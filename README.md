# THE SPELLBINDER · BLEXX

Customer app for binding executable Spells. Live target: **blexx.me**.
Full framework: [SPEC.md](SPEC.md).

## Status: P0 — engine test bench

- `index.html` — test bench: input map → bound spell preview. Serve statically
  (`python3 -m http.server 8788`) — `fetch()` of glyphs won't work from `file://`.
- `lexicon.js` — ALL content lives here (desires, houses, name grammars,
  incantation fragments, component pool, steps, moon lines). v0 placeholder
  copy — rewrite in BLEXX voice, the engine only selects from it.
- `engine.js` — deterministic binding: seed = desire + detail + caster mark
  (+ gift), mulberry32 RNG, local moon phase. Same inputs ⇒ same spell.
- `sigil.js` — seeded sigil SVG, triangle+square grammar only (tessellate +
  stack), one house-color accent.
- `cipher.js` + `assets/alphabet/` — Blexx alphabet glyphs, extracted from
  the alphabet PDF by `tools/extract_alphabet.py` (needs `pip install pymupdf`).
- `brand-assets.js` — GENERATED, all brand SVGs + alphabet embedded as JS so
  nothing needs fetch() (branding works even opened as file://). Re-run
  `python3 tools/build_assets.py` after changing anything in assets/.
- The sheet's sigil box is the LIVING SIGIL — `MOTION_SEAL.animate()` running
  the GIF renderer on a canvas at 10fps (first frame drawn synchronously;
  heartbeat keeps it moving in hidden tabs).
- `motion.js` — the Motion Seal: the spell's sigil as an animated glitch GIF
  (500×500, 36 frames @100ms, infinite loop, ~400–650KB). Entropy-engine
  visual language from bitsofdust/blexx-gif (neon glow, chromatic aberration,
  slice shifts, receipt overlay, per-house aura geometry: Chance shards +
  chevron, Manifestation orbits + vesica, Devotion fortress squares) but
  fully seeded — same spell ⇒ same GIF bytes. Encoded with gifenc (ESM from
  jsDelivr, loaded on first compile); MessageChannel yields so background
  tabs can't throttle the compile.
- Sigil grammar v1: 5×5 grid; triangle/square primitives plus the pamphlet's
  legal combinations (diamond = 2△, hexagon = 6△), constellation connectors,
  vertex nodes. Circles stay excluded on paper; the digital seal's aura may
  use them (original engine license).
- UI: onyx + house-tinted glow, rounded cards/pills, cream input fields,
  mascots (reveal moment, sheet stamp, bottom-right companion). Blueprint
  language survives only on the printed sheet's title block.
- Registry numbers are provisional (seed-hash) until Firestore mints real
  ones atomically at P3. 900 per House, then the registry closes.

## Roadmap

P1 binder UI (blueprint map, house reveal, proof stage) → P2 jsPDF spellbook
page → P3 Firebase `blexx-spellbinder` (Grimoire + upvotes + $20 kit orders
via Stripe, pre-made spells orderable) → P4 polish. Rituals later.
