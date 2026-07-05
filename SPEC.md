# THE SPELLBINDER — Framework v1
BLEXX · customer-facing spell binding app · drafted 2026-07-04

> A Spell is a simple, executable magical procedure. The Spellbinder is where a
> customer binds one: they state a desire, the machine divines their House,
> assembles the spell, and returns (a) a downloadable spellbook page and (b) a
> physical kit built from drop inventory. A **Ritual** is a complex, multi-spell
> procedure — out of scope for v1, but the data model leaves room for it.

Always a blexxing, never a curse — no hexes, no targets who didn't ask for it.

---

## 1. Decisions locked (2026-07-04)

| Decision | Choice |
|---|---|
| Platform | Static site + Firebase, same production stack as the Publicide zine press (plain HTML/JS, Firestore, Cloud Functions + Stripe Checkout, jsPDF) |
| Spell engine | Rule-based + seeded. Handmade libraries, deterministic assembly. Same inputs ⇒ same spell. **No AI at runtime** (per Almanac spec: "keep it handmade") |
| Houses | Divined from the customer's stated desire — the reveal moment is "YOU HAVE BEEN BLESSED WITH ___" (house cards copy) |
| Kit | Assembled from six-drop inventory (key cards, ritual sand, pins, potion bottles, candles). The Spellbinder is the sales bridge for the drops |
| Intent input | Curated desire menu + optional free-text detail phrase (blocklist-moderated, seeds the RNG) |
| Timing | Light Almanac in v1: locally computed moon phase + weekday windows (Hour-Keeper's Pause Tue 4:14pm, Crossing Hour Tue 11:11–11:22pm). Full 5-field Almanac engine later |
| Archive | Public Grimoire — email-gated binding; bound spells (minus private text/email) are public entries, like the zine archive |
| Page aesthetic | Hybrid: blueprint technical-drawing structure (pamphlet language — grid, callouts, title block, edition stamp) with the caster's House color as the single accent ink |
| Kit price | **$20 flat**, fixed server-side (same price discipline as the zine press) |
| Domain | **blexx.me** |
| Spells for others | **Gift blexxings only** — you can bind a blessing *for* someone, never a spell *on* someone |
| Blexx alphabet | Exists: full A–Z pictographic glyph set at `/Users/bustin/Desktop/BLEXX/BLEXX-2/Alphabet - Cards - Icons/BLEXX_Alphabet.pdf` (vector — extract each tile to SVG for the cipher line) |
| Edition caps | **900 per House** (pamphlet-style scarcity) — 2,700 spells total, then the registry closes |
| Firebase project | **`blexx-spellbinder`** (separate from `pbcd-zine`) |
| Grimoire commerce | Public spells are **orderable by anyone** as pre-made kits — the registry number stays with the spell, not the buyer; binding mints numbers, ordering doesn't |
| Upvotes | Grimoire entries have an **upvote system** (one vote per visitor) to surface the best spells |

House accents: **Chance** red `#ED2024` · **Devotion** purple `#882782` · **Manifestation** blue `#405EAB`.

---

## 2. Anatomy of a bound Spell (the output)

Every spell the binder produces has eight parts:

1. **Name** — generated from per-house grammars, e.g. "The Second Invitation,"
   "A Charm Against Closed Doors." Formula: [form word] + [house noun bank] +
   [modifier seeded by the detail phrase].
2. **House** — Chance / Devotion / Manifestation, divined from the desire.
   Sets accent color, house mascot mark, and voice of the incantation.
3. **Sigil** — a seeded SVG mark composed only from the pamphlet shape grammar:
   triangle + square primitives, tessellated and stacked (circle excluded — too
   complex to fold). Deterministic from the seed; every spell's sigil is unique
   but reproducible.
4. **Components** — 2–4 physical items:
   - **Kit components** mapped to drop SKUs (pinch of ritual sand, key card,
     pin, vial, candle...)
   - exactly one **found component** the caster must supply themselves (a coin,
     a photograph, something borrowed, salt from their own kitchen) — keeps the
     spell from feeling like pure merch.
5. **Words** — the incantation, assembled from handmade fragment libraries
   (opening / action / seal), plus one line rendered in the Blexx
   alphabet/cipher that decodes to a hidden blessing.
6. **Parameters** — the executable settings block, printed like a spec table:
   - **Mode**: carry / wear / place / use / apply (concept-outline interaction modes)
   - **Cast window**: moon phase + day/window ("cast under the waxing moon;
     strongest Tuesday 11:11pm")
   - **Duration**: until broken / N days / until the condition arrives
   - **Release**: how the spell completes — break the charm, burn the corner
     of the page, pour out the sand (designed fragility, per the brandbook)
7. **Steps** — 3–5 numbered instructions. This is what makes it *executable*:
   a procedure a person actually performs.
8. **Registry number** — numbered per House, `BLX-CHA-001/900`,
   `BLX-DEV-001/900`, `BLX-MAN-001/900` — stamped in the title block and used
   as the Grimoire entry ID. When a House's run hits 900, that registry closes
   (scarcity is the point; what "closing" unlocks is a v2 question).

---

## 3. What the customer inputs (the "map")

The binding form is styled as a blueprint operational diagram (pamphlet
DWG language): each input is a labeled callout on the sheet, filled in order.

| # | Field | Form | Role in generation |
|---|---|---|---|
| 1 | **Desire** | curated menu, ~12–18 desires tagged by house (e.g. "open a door" → Chance, "hold on to something" → Devotion, "call something toward me" → Manifestation) | divines the House; picks component/mode pools |
| 2 | **Detail phrase** | optional short free text ("...the job at the print shop"), blocklist-moderated like the zine press | seeds the RNG; personalizes name + incantation slot |
| 3 | **Caster mark** | name or initials | printed on the page; Grimoire handle |
| 4 | **Where it lives** | 3-way choice: *on me* (carry/wear) / *in a place* (place) / *as an act* (use/apply) | selects Mode + which drop SKUs are eligible components |
| 5 | **Charge** | low / medium / high | scales component count, incantation length, and fragility (high charge ⇒ a breakable component) |
| 6 | **Email** | required to bind | gate + Grimoire + kit orders; feeds the Dispatch list |

**Seed string = desire + detail phrase + caster mark** (exactly the zine-press
"title seeds the layout" pattern). PROOF stage before binding: the caster can
tweak charge/mode and re-roll nothing — the spell only changes if the inputs
change. Nothing is stored until they hit **BIND** (commitZine() pattern).

---

## 4. Generation engine

- `SeededRandom` ported from the zine press.
- **Libraries to write once** (a weekend of writing, per the Almanac spec):
  - name grammars: 3 house noun banks (~30 each), form words, modifiers
  - incantation fragments: openings / actions / seals (~20 each per house)
  - component pool: each entry = display name + ritual function + drop SKU (or `found`)
  - step templates per mode (carry/wear/place/use/apply)
  - cast-window lines: 8 moon phases + the two Tuesday windows
- **Sigil generator**: seeded placement of triangles/squares on a small grid,
  legal moves = tessellate (edge-to-edge) + stack (on top), house-color accent.
  Output SVG → embedded in page + PDF.
- Moon phase computed locally (simple synodic arithmetic) — no API dependency,
  degrades to "the moon is where it is" never.

## 5. The spellbook page (downloadable artifact)

- A5 PDF via jsPDF (reuse zine-press builders; a print-grade version with
  bleed can come later if pages ever go to the press).
- Blueprint sheet: grid, title block (`DWG-SPL-####`, edition, house), sigil
  as FIG. A with dimension callouts, components table with dashed
  **PLACE ARTIFACT HERE** rings sized to the actual kit items, incantation
  block + cipher line, numbered steps, cast-window stamp, QR → Grimoire entry.
- One accent ink = house color; everything else near-black on paper white.
- The page participates in the pamphlet loop: **PLACE · STAMP/WRITE · PHOTO · SCAN**.

## 6. Kit + orders

- Kit = the spell's kit-components + printed spellbook page + the matching
  House card (existing House_cards art) in drop-style packaging.
- **$20 flat** regardless of composition — one Stripe price, direct port of
  `createCheckoutSession` / `stripeWebhook` / `orderNotify` with
  `PRICE_USD_CENTS = 2000` fixed server-side. (Note: kit components must be
  chosen so COGS works at $20 — the pool skews toward sand/cards/pins;
  candles ($30–55 solo) stay drop-only or appear as a "found component"
  upsell link.)
- Order flow: bind → Grimoire entry → "SEND ME THE KIT" → Firestore order →
  Stripe Checkout redirect → webhook marks paid → email notify. No card data
  on-site, ever.
- **Pre-made spells**: every public Grimoire entry has an order button too —
  anyone can buy the kit for an existing spell and perform it themselves.
  Orders reference the spellId; a spell can be ordered any number of times.
  Binding is what's capped at 900/house, not ordering. Top-voted spells become
  de facto products the community curated for you.
- **Upvotes**: one vote per visitor per spell (anonymous voter UUID in
  localStorage; `spells/{id}/votes/{voterId}` create-only so the doc ID
  dedupes; count via aggregation). Grimoire sorts by new / most-charged
  (top-voted).

## 7. Data model (Firestore, project TBD)

Firebase project: **`blexx-spellbinder`**, hosted at **blexx.me**.

- `spells/{id}` — name, house, seed inputs (desire, mode, charge), casterHandle,
  sigil SVG string, components[], castWindow, registryNumber, createdAt,
  `private:{email, detailPhrase}` (rules: public read of public fields,
  create-only, admin delete)
- `orders/{id}` — spellId, status (new→paid→shipped), shipping, stripeSessionId
- `generation_log` — logged at compose time (zine-press convention)
- `admin.html` port: order status management + spell takedowns, same
  ADMIN_EMAILS allowlist pattern.

## 8. Build phases

- **P0 — Content + engine**: write the libraries; seeded generator + sigil SVG as a bare test page.
- **P1 — The Binder**: blueprint form-map UI, house reveal moment, PROOF stage.
- **P2 — The Page**: jsPDF spellbook page + download.
- **P3 — The Grimoire + kits**: Firebase publish, public archive, Stripe order flow, admin room.
- **P4 — Polish**: intro overlay ("BLEXX discovers and releases artifacts…"), cipher line, window-hours easter eggs (site behaves differently Tue 4:14pm).
- **Later — Rituals**: multi-spell procedures spanning days/moons, full Almanac engine (the 5-field daily object), spell combinations (artifact systems).

## 9. Open questions (remaining)

1. **Drop SKU list** — no confirmed list yet. Until it exists, the component
   pool ships with *provisional* SKUs from the roadmap (holographic key card,
   ritual sand, retro-reflective pin, glass potion vial, manifestation candle)
   behind a single `COMPONENT_POOL` config so swapping in real SKUs is a
   one-file change.
2. **Alphabet extraction** — the A–Z glyphs live in a vector PDF
   (`BLEXX_Alphabet.pdf`); extract each tile to individual SVGs (build-time
   script or Illustrator export) before the cipher line can render.
3. **Registry closing** — what happens when a House hits 900/900 (waitlist?
   second edition? Ritual unlock?). v2 question, but the counter UI should be
   designed knowing the answer eventually exists.
4. **Concurrency guard** — 900-cap numbering needs an atomic counter
   (Firestore transaction) so two simultaneous binds can't claim the same
   number; decide at P3.
