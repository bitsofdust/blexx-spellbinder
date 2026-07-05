// BLEXX SPELLBINDER — LEXICON v0
// Handmade content libraries. Every list here is meant to be rewritten and
// expanded in the BLEXX voice — entries marked v0 are working placeholders.
// The engine only ever *selects* from these; no text is generated at runtime.

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
      role: 'draws the boundary' },
    { id: 'key-card',     name: 'a holographic key card',       sku: 'DROP-01-CARD',   modes: ['carry', 'place'], breakable: false,
      role: 'holds the address of the want' },
    { id: 'reflect-pin',  name: 'a retro-reflective pin',       sku: 'DROP-03-PIN',    modes: ['wear'],           breakable: false,
      role: 'signals under passing light' },
    { id: 'paper-charm',  name: 'a paper charm (breakable)',    sku: 'KIT-PAPER-01',   modes: ['carry', 'place'], breakable: true,
      role: 'meant to break to complete the spell' },
    { id: 'thread',       name: 'a length of waxed thread',     sku: 'KIT-THREAD-01',  modes: ['wear', 'use'],    breakable: true,
      role: 'ties the vow; cut to release' },
    { id: 'chalk-tab',    name: 'a tablet of sigil chalk',      sku: 'KIT-CHALK-01',   modes: ['place', 'apply'], breakable: true,
      role: 'marks what must be marked' },
    { id: 'match',        name: 'a single long match',          sku: 'KIT-MATCH-01',   modes: ['use'],            breakable: true,
      role: 'one light, one chance' },
  ],

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

  WINDOWS: [
    { id: 'crossing-hour', label: 'The Crossing Hour', when: 'Tuesday, 11:11–11:22pm', note: 'pull is doubled' },
    { id: 'hour-keepers',  label: 'The Hour-Keeper’s Pause', when: 'Tuesday, 4:14pm', note: 'stop what you are doing first' },
  ],

  DURATIONS: {
    low:    'seven days, or until you stop noticing it',
    medium: 'one full turn of the moon',
    high:   'until the release is performed',
  },

  RELEASES: {
    low:    'Let it fade. When you forget the spell, it has finished its work.',
    medium: 'Pour out the sand / retire the charm somewhere it will not be found.',
    high:   'Break the breakable component. The spell completes at the snap.',
  },

  // Step templates per mode. Slots: {kit}, {found}, {sigil}, {window},
  // {incant}, {release}. Rendered in order.
  STEPS: {
    carry: [
      'Lay this page flat. Place {kit} inside the marked ring.',
      'Set {found} beside it and speak the words once, quietly.',
      'Carry the charm with you for the spell’s duration. It rides; you drive.',
      '{release}',
    ],
    wear: [
      'Put on {kit} while looking at the sigil, not the mirror.',
      'Touch it once whenever the desire crosses your mind. Do not explain it to anyone.',
      'Wear it through {window} at least once.',
      '{release}',
    ],
    place: [
      'Choose the room the spell should influence. Draw the sigil there with {kit}.',
      'Set {found} at the sigil’s edge, like a guest at a table.',
      'Speak the words facing the door. Leave before you are tempted to tidy it.',
      '{release}',
    ],
    use: [
      'Wait for {window}.',
      'Hold {kit} in your writing hand and {found} in the other.',
      'Speak the words, then use the instrument exactly once. Once.',
      '{release}',
    ],
    apply: [
      'Pour a thin line of {kit} along a threshold you cross every day.',
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
