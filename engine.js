// BLEXX SPELLBINDER — ENGINE v0
// Deterministic spell assembly. Same inputs ⇒ same spell, forever.
// No AI at runtime. The engine only selects from LEXICON.

// ---- Seeded RNG (same discipline as the zine press: the inputs seed everything)

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function SeededRandom(seedString) {
  let a = hashString(seedString);
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
function pickN(rng, arr, n) {
  const copy = arr.slice(), out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  }
  return out;
}

// ---- Moon phase (local arithmetic, no API; degrades never)

const SYNODIC = 29.53058867;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14); // 2000-01-06 18:14 UTC

function moonPhase(date) {
  const days = (date.getTime() - KNOWN_NEW_MOON) / 86400000;
  const age = ((days % SYNODIC) + SYNODIC) % SYNODIC;
  const names = ['new', 'waxing-crescent', 'first-quarter', 'waxing-gibbous',
    'full', 'waning-gibbous', 'last-quarter', 'waning-crescent'];
  const idx = Math.floor(((age + SYNODIC / 16) / SYNODIC) * 8) % 8;
  return { age: age, name: names[idx] };
}

// ---- Moderation

function isBlocked(text) {
  const t = (text || '').toLowerCase();
  return LEXICON.BLOCKED_TERMS.some(term => t.includes(term));
}

// ---- The Spellbinder

// inputs: { desireId, detail, casterMark, dwelling, charge, giftFor }
// Returns a fully assembled spell object, or { blocked: true }.
function bindSpell(inputs, now) {
  now = now || new Date();
  if (isBlocked(inputs.detail) || isBlocked(inputs.giftFor)) {
    return { blocked: true };
  }

  const desire = LEXICON.DESIRES.find(d => d.id === inputs.desireId);
  if (!desire) throw new Error('unknown desire: ' + inputs.desireId);

  const houseKey = desire.house;                 // the divination
  const house = LEXICON.HOUSES[houseKey];
  const charge = LEXICON.CHARGES[inputs.charge || 'medium'];

  // The seed: desire + detail + caster mark (the zine-press title pattern).
  const seed = [inputs.desireId, inputs.detail || '', inputs.casterMark || '',
    inputs.giftFor || ''].join('::').toLowerCase().trim();
  const rng = SeededRandom(seed);

  // Mode — constrained by where the caster wants the spell to live.
  const eligibleModes = LEXICON.DWELLINGS[inputs.dwelling || 'on-me'];
  const modeKey = pick(rng, eligibleModes);
  const mode = LEXICON.MODES[modeKey];

  // Name
  const pattern = pick(rng, LEXICON.NAME_PATTERNS);
  let name = pattern
    .replace('{form}', pick(rng, LEXICON.NAME_FORMS))
    .replace('{noun}', pick(rng, house.nouns))
    .replace('{obstacle}', pick(rng, house.obstacles));
  name = name.charAt(0).toUpperCase() + name.slice(1);

  // Components: kit items filtered by mode, +1 always-eligible filler if the
  // mode-filtered pool runs short; exactly one found component; high charge
  // guarantees a breakable item.
  const kitCount = charge.components - 1;
  let pool = LEXICON.COMPONENT_POOL.filter(c => c.modes.includes(modeKey));
  let kit = pickN(rng, pool, kitCount);
  if (kit.length < kitCount) {
    const rest = LEXICON.COMPONENT_POOL.filter(c => !kit.includes(c));
    kit = kit.concat(pickN(rng, rest, kitCount - kit.length));
  }
  if (charge.breakable && !kit.some(c => c.breakable)) {
    const breakables = LEXICON.COMPONENT_POOL.filter(c => c.breakable && !kit.includes(c));
    if (breakables.length) kit[kit.length - 1] = pick(rng, breakables);
  }
  const found = pick(rng, LEXICON.FOUND_COMPONENTS);

  // Words: opening / action / seal (+ extra action at high charge),
  // with the detail phrase woven in when present.
  const lines = [pick(rng, house.openings), pick(rng, house.actions)];
  if (charge.lines > 3) {
    const second = LEXICON.HOUSES[houseKey].actions.filter(a => a !== lines[1]);
    lines.push(pick(rng, second));
  }
  if (inputs.detail) lines.push('Namely: ' + inputs.detail.trim() + '.');
  if (inputs.giftFor) lines.push('This working is bound for ' + inputs.giftFor.trim() + ', and only in their favor.');
  lines.push(pick(rng, house.seals));

  // The cipher line: a hidden blessing, rendered in the Blexx alphabet.
  const hiddenBlessing = pick(rng, house.blessings);

  // Cast window
  const phase = moonPhase(now);
  const window = pick(rng, LEXICON.WINDOWS);
  const castWindow = {
    moon: phase.name,
    moonLine: LEXICON.MOON_LINES[phase.name],
    window: window,
    text: 'Cast ' + LEXICON.MOON_LINES[phase.name] + '. Strongest during ' +
      window.label + ' (' + window.when + ' — ' + window.note + ').',
  };

  // Steps
  const kitNames = kit.map(c => c.name);
  const kitPhrase = kitNames.length > 1
    ? kitNames.slice(0, -1).join(', ') + ' and ' + kitNames[kitNames.length - 1]
    : kitNames[0];
  const steps = LEXICON.STEPS[modeKey].map(s => s
    .replace('{kit}', kitPhrase)
    .replace('{found}', found)
    .replace('{window}', window.label + ' (' + window.when + ')')
    .replace('{release}', LEXICON.RELEASES[inputs.charge || 'medium']));

  // Registry number: PROVISIONAL. Real numbers are minted by a Firestore
  // transaction at bind time (P3) — 900 per house, then the registry closes.
  const provisionalNo = (hashString(seed) % 900) + 1;

  return {
    version: 'v0',
    seed: seed,
    name: name,
    house: houseKey,
    houseName: house.name,
    houseColor: house.color,
    blessing: house.blessing,
    desire: desire.label,
    detail: inputs.detail || null,
    giftFor: inputs.giftFor || null,
    casterMark: inputs.casterMark || 'UNSIGNED',
    mode: modeKey,
    modeLabel: mode.label,
    artifactType: mode.artifact,
    charge: inputs.charge || 'medium',
    components: {
      kit: kit,
      found: found,
    },
    incantation: lines,
    hiddenBlessing: hiddenBlessing,
    castWindow: castWindow,
    duration: LEXICON.DURATIONS[inputs.charge || 'medium'],
    release: LEXICON.RELEASES[inputs.charge || 'medium'],
    steps: steps,
    registry: {
      provisional: true,
      number: provisionalNo,
      label: 'BLX-' + house.code + '-' + String(provisionalNo).padStart(3, '0') + '/900',
    },
  };
}

if (typeof module !== 'undefined') {
  module.exports = { SeededRandom, hashString, moonPhase, bindSpell, isBlocked, pick, pickN };
}
