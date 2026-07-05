// BLEXX SPELLBINDER — LEXICON v1
// Handmade content libraries. The engine only ever *selects* from these;
// no text is generated at runtime. Cast windows listen to the city, not a
// clock. Every release line belongs to a real component. Expand freely —
// more entries means more variety, never different behavior.

const LEXICON = {

  HOUSES: {
    chance: {
      name: 'CHANCE',
      color: '#ED2024',
      code: 'CHA',
      blessing: 'You have been blessed with Chance.',
      voice: 'Fortune favors the bold, but Chance favors those most open to possibility.',
      nouns: ['the Open Door', 'the Second Invitation', 'the Spinning Coin',
        'the Lucky Corner', 'the Unmarked Path', 'the Flickering Strobe',
        'the Passing Window', 'the Bold Step', 'the Loose Thread',
        'the Sudden Yes', 'the Crossroads', 'the Fair Wind'],
      obstacles: ['Closed Doors', 'Missed Turns', 'Hesitation',
        'the Long Odds', 'Cold Streaks', 'the Wrong Moment'],
      openings: [
        'A coin is still spinning somewhere. Do not catch it.',
        'The door was never locked. It was only heavy.',
        'Every odds-maker in Blexx city is wrong about you this week.',
        'Luck is not found. It is noticed.',
      ],
      actions: [
        'I open myself to the possibility in front of me.',
        'I take the chance while it is still warm.',
        'I let the outcome flicker until it lands.',
        'I say yes before I know the question.',
      ],
      seals: [
        'What is open, stays open.',
        'The coin lands when I stop watching.',
        'So it is flipped. So it falls.',
        'Let the odds remember my name.',
      ],
      blessings: ['take the chance', 'the door is open', 'luck notices you',
        'say yes twice', 'fortune is watching'],
    },

    devotion: {
      name: 'DEVOTION',
      color: '#882782',
      code: 'DEV',
      blessing: 'You have been blessed with Devotion.',
      voice: 'Devotion is an emotion past love. It causes action, not just a feeling.',
      nouns: ['the Kept Promise', 'the Steady Flame', 'the Deep Root',
        'the Unbroken Thread', 'the Long Watch', 'the True North',
        'the Held Hand', 'the Quiet Vow', 'the Faithful Hour',
        'the Guarded Hearth', 'the Whole Heart', 'the Patient Stone'],
      obstacles: ['Wavering', 'Forgetting', 'the Loosening Grip',
        'Distraction', 'the Cold Morning', 'Half-Measures'],
      openings: [
        'What you love is listening. Speak carefully.',
        'A vow is a small machine. Wind it daily.',
        'The flame does not ask to be impressive. Only tended.',
        'You already know what you are devoted to. Say it.',
      ],
      actions: [
        'I follow what I am devoted to, entirely and without question.',
        'I tend this one thing until it tends me back.',
        'I hold on with both hands and let my grip become a home.',
        'I release what I only pretended to love.',
      ],
      seals: [
        'What is kept, keeps me.',
        'The vow outlives the weather.',
        'So it is held. So it holds.',
        'Let the flame find me faithful.',
      ],
      blessings: ['tend the flame', 'keep the vow', 'love is action',
        'hold with both hands', 'you are kept'],
    },

    manifestation: {
      name: 'MANIFESTATION',
      color: '#405EAB',
      code: 'MAN',
      blessing: 'You have been blessed with Manifestation.',
      voice: 'Thoughts are seeds, but desire is the soil — be careful what you plant.',
      nouns: ['the Arriving Thing', 'the Thin Boundary', 'the Planted Seed',
        'the Drawn Curtain', 'the Open Palm', 'the Written Want',
        'the Clear Path', 'the Coming Knock', 'the Named Desire',
        'the Turning Tide', 'the First Brick', 'the Answered Door'],
      obstacles: ['Fog', 'Unnamed Wants', 'the Scattered Mind',
        'Doubt', 'the Crowded Path', 'Waiting Without Asking'],
      openings: [
        'The boundary between imagined and real is thin this week. Lean on it.',
        'What you hold in your mind has a way of arriving at your door.',
        'Attention is the strange alchemy. Aim it.',
        'Name the thing. Unnamed things cannot find your address.',
      ],
      actions: [
        'I call forth what I most deeply want.',
        'I trust that it is already moving toward me.',
        'I make room on the shelf before the parcel arrives.',
        'I plant the want and water nothing else.',
      ],
      seals: [
        'What is named, arrives.',
        'The door knows to knock.',
        'So it is planted. So it grows.',
        'It is already on its way.',
      ],
      blessings: ['it is coming', 'name it daily', 'make room now',
        'the seed took', 'already moving toward you'],
    },
  },

  // The desire menu — the first callout on the map. Each divines a House.
  DESIRES: [
    { id: 'open-door',    label: 'open a door',              house: 'chance' },
    { id: 'right-place',  label: 'be in the right place',    house: 'chance' },
    { id: 'need-yes',     label: 'get a yes I need',         house: 'chance' },
    { id: 'one-moment',   label: 'find courage for one moment', house: 'chance' },
    { id: 'shuffle-luck', label: 'shuffle my luck',          house: 'chance' },
    { id: 'hold-on',      label: 'hold on to something',     house: 'devotion' },
    { id: 'let-go',       label: 'let something go',         house: 'devotion' },
    { id: 'keep-promise', label: 'keep a promise',           house: 'devotion' },
    { id: 'protect',      label: 'protect what I love',      house: 'devotion' },
    { id: 'stay-true',    label: 'stay true to a practice',  house: 'devotion' },
    { id: 'call-toward',  label: 'call something toward me', house: 'manifestation' },
    { id: 'be-seen',      label: 'be seen',                  house: 'manifestation' },
    { id: 'make-real',    label: 'make an idea real',        house: 'manifestation' },
    { id: 'clear-path',   label: 'clear the path ahead',     house: 'manifestation' },
    { id: 'money-finds',  label: 'let money find me',        house: 'manifestation' },
  ],

  // Name grammar: pattern picks a shape, banks fill it.
  NAME_FORMS: ['A Charm', 'A Small Spell', 'A Working', 'A Blessing', 'A Seal', 'An Arrangement'],
  NAME_PATTERNS: [
    '{form} of {noun}',
    '{form} Against {obstacle}',
    'The Spell of {noun}',
    '{noun}: {form}',
  ],

  // Provisional kit component pool. `sku` values are placeholders until the
  // real drop SKU list exists — swap here, nothing else changes.
  // modes: which interaction modes a component can serve.
  COMPONENT_POOL: [
    { id: 'ritual-sand',  name: 'a vial of ritual sand',        sku: 'DROP-02-SAND',   modes: ['place', 'apply'], breakable: false,
      role: 'draws the boundary',
      release: 'Pour out the sand at a curb with a tree in it. The spell drains with it.' },
    { id: 'key-card',     name: 'a holographic key card',       sku: 'DROP-01-CARD',   modes: ['carry', 'place'], breakable: false,
      role: 'holds the address of the want',
      release: 'Retire the key card to a drawer you rarely open. It has held the address long enough.' },
    { id: 'reflect-pin',  name: 'a retro-reflective pin',       sku: 'DROP-03-PIN',    modes: ['wear'],           breakable: false,
      role: 'signals under passing light',
      release: 'Unpin it and fix it to something that travels without you — a bag, a jacket, a friend.' },
    { id: 'paper-charm',  name: 'a paper charm (breakable)',    sku: 'KIT-PAPER-01',   modes: ['carry', 'place'], breakable: true,
      role: 'meant to break to complete the spell',
      release: 'Tear the paper charm in half. The spell completes at the tear.' },
    { id: 'thread',       name: 'a length of waxed thread',     sku: 'KIT-THREAD-01',  modes: ['wear', 'use'],    breakable: true,
      role: 'ties the vow; cut to release',
      release: 'Cut the thread. The spell completes at the snip.' },
    { id: 'chalk-tab',    name: 'a tablet of sigil chalk',      sku: 'KIT-CHALK-01',   modes: ['place', 'apply'], breakable: true,
      role: 'marks what must be marked',
      release: 'Wash the mark away with your own two hands.' },
    { id: 'match',        name: 'a single long match',          sku: 'KIT-MATCH-01',   modes: ['use'],            breakable: true,
      role: 'one light, one chance',
      release: 'The spell spends itself with the match.' },
  ],

  // In every kit, always — not drawn from the pool, not counted by charge.
  KEYCHAIN: { id: 'keychain', name: 'the BLEXX keychain', sku: 'KIT-KEYCHAIN-01',
    role: 'in every kit — clips the spell to your days' },

  // The one component the caster supplies themselves. Never sold.
  FOUND_COMPONENTS: [
    'a coin you received as change this week',
    'a photograph of a door',
    'salt from your own kitchen',
    'a key that no longer opens anything',
    'a word written in someone else’s handwriting',
    'water that stood overnight',
    'a small stone from a place you want to return to',
    'the stub of a ticket',
    'a receipt from the best day of last month',
    'a bottle cap found face-up',
    'the wrapper of something you shared',
    'a takeout menu from a place you have never ordered from',
  ],

  MODES: {
    carry: { label: 'CARRY', artifact: 'charm' },
    wear:  { label: 'WEAR',  artifact: 'talisman' },
    place: { label: 'PLACE', artifact: 'sigil' },
    use:   { label: 'USE',   artifact: 'instrument' },
    apply: { label: 'APPLY', artifact: 'potion' },
  },
  // dwelling answer -> eligible modes
  DWELLINGS: {
    'on-me':    ['carry', 'wear'],
    'in-place': ['place'],
    'as-act':   ['use', 'apply'],
  },

  CHARGES: {
    low:    { label: 'LOW',    components: 2, lines: 3, breakable: false },
    medium: { label: 'MEDIUM', components: 3, lines: 3, breakable: false },
    high:   { label: 'HIGH',   components: 4, lines: 4, breakable: true },
  },

  MOON_LINES: {
    'new':             'under the new moon, when the sky keeps no records',
    'waxing-crescent': 'while the moon is a sliver and still deciding',
    'first-quarter':   'at first quarter, when the moon takes sides',
    'waxing-gibbous':  'under the waxing gibbous, while everything swells',
    'full':            'under the full moon, when the Long Door stands open',
    'waning-gibbous':  'as the moon exhales, in the waning gibbous',
    'last-quarter':    'at last quarter, when half of everything is enough',
    'waning-crescent': 'in the last thin light before the sky goes dark',
  },

  // City signals — the spell listens to the street, not a clock.
  // Every spell is assigned one; the caster waits for the city to say go.
  TRIGGERS: [
    'the next traffic light you watch turn green',
    'a car honking twice — exactly twice',
    'the next dog that looks at you first',
    'a leaf landing directly in front of your feet',
    'a stranger laughing on the other side of the street',
    'the streetlights coming on for the night',
    'an elevator that opens before you press the button',
    'a bus passing with every window empty',
    'someone holding a door without looking back',
    'the first siren after dark, once it has faded',
    'two people wearing the same color crossing your path',
    'a pigeon that refuses to move for you',
  ],

  DURATIONS: {
    low:    'seven days, or until you stop noticing it',
    medium: 'one full turn of the moon',
    high:   'until the release is performed',
  },

  RELEASES: {
    // low-charge spells fade; medium/high releases come from the actual
    // components in the kit (each COMPONENT_POOL entry carries its own).
    low: 'No release needed. Let it fade — when you forget the spell, it has finished its work.',
  },

  // Step templates per mode. Slots: {kit}, {found}, {trigger}, {release}.
  // Every slot must resolve against the ACTUAL kit — no orphan references.
  // "The marked ring" is real: page 2 of the spellbook PDF (Ritual Surface).
  STEPS: {
    carry: [
      'Lay the Ritual Surface flat (page 2 of your spellbook page). Place {kit} inside the marked ring.',
      'Set {found} just outside the ring and speak the words once, quietly.',
      'Wait for the signal: {trigger}. Then pocket the charm — it rides; you drive.',
      '{release}',
    ],
    wear: [
      'Put on {kit} while looking at the sigil, not the mirror.',
      'Touch it once whenever the desire crosses your mind. Do not explain it to anyone.',
      'The spell arms itself at the signal: {trigger}. Be wearing it when the city speaks.',
      '{release}',
    ],
    place: [
      'Choose the room the spell should influence. Arrange {kit} there, echoing the sigil.',
      'Set {found} at the edge of the arrangement, like a guest at a table.',
      'Speak the words facing the door. Leave before you are tempted to tidy.',
      '{release}',
    ],
    use: [
      'Keep {kit} with you and wait for the signal: {trigger}.',
      'When it comes, take the instrument in your writing hand and {found} in the other.',
      'Speak the words, then act — once. Only once.',
      '{release}',
    ],
    apply: [
      'Draw a thin line with {kit} along a threshold you cross every day.',
      'Cross it while speaking the words. Do not look down.',
      'Let {found} stay on the far side overnight.',
      '{release}',
    ],
  },

  // Moderation — starter blocklist; expand from the zine press list.
  BLOCKED_TERMS: ['kill', 'die', 'death to', 'hurt', 'harm', 'curse', 'hex',
    'revenge', 'suffer', 'destroy him', 'destroy her', 'destroy them'],
};

if (typeof module !== 'undefined') module.exports = LEXICON;
