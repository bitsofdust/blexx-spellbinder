// BLEXX SPELLBINDER — SIGIL GENERATOR v1
// Seeded marks built from the pamphlet shape grammar, now with the legal
// COMBINATIONS from the geometry sheet: diamond (△+△), hexagon (6×△),
// alongside the triangle and square primitives. Tessellate + stack still the
// only moves; connectors trace the tessellation edges; nodes mark vertices
// (the "dimension callout" dots). Circles remain excluded — too complex to fold.
// Deterministic: the spell's seed draws the sigil, forever.
//
// MODEL (pure geometry, grid units) + RENDERERS (SVG for the app/page,
// jsPDF vectors in pdf.js, neon canvas in motion.js).

function sigilModel(seedString) {
  const G = 5;
  const rng = SeededRandom('sigil::' + seedString);

  const cells = [];
  const taken = {};
  const density = 0.32 + rng() * 0.22;
  const mirror = rng() > 0.35;             // vertical symmetry, sigils like it
  const cols = mirror ? Math.ceil(G / 2) : G;

  function kindFor(r) {
    if (r < 0.34) return 'tri';
    if (r < 0.60) return 'sq';
    if (r < 0.82) return 'diamond';
    return 'hex';
  }

  for (let gx = 0; gx < cols; gx++) {
    for (let gy = 0; gy < G; gy++) {
      if (rng() > density) continue;
      const cell = { kind: kindFor(rng()), rot: Math.floor(rng() * 4), gx, gy };
      cells.push(cell); taken[gx + ',' + gy] = true;
      const mx = G - 1 - gx;
      if (mirror && mx !== gx && !taken[mx + ',' + gy]) {
        cells.push({ kind: cell.kind, rot: (4 - cell.rot) % 4, gx: mx, gy });
        taken[mx + ',' + gy] = true;
      }
    }
  }
  if (cells.length < 3) {
    [['diamond', 2, 1], ['tri', 1, 3], ['sq', 3, 3]].forEach(([kind, gx, gy]) => {
      if (!taken[gx + ',' + gy]) { cells.push({ kind, rot: 0, gx, gy }); taken[gx + ',' + gy] = true; }
    });
  }

  // stack pass: smaller inverted shapes ON TOP of existing ones
  const stacked = [];
  const stacks = 1 + Math.floor(rng() * Math.min(3, cells.length));
  for (let i = 0; i < stacks; i++) {
    const host = cells[Math.floor(rng() * cells.length)];
    stacked.push({ kind: rng() > 0.5 ? 'tri' : 'sq', rot: Math.floor(rng() * 4), gx: host.gx, gy: host.gy });
  }

  // connectors: constellation lines tracing 2–4 cell centers
  const connectors = [];
  if (cells.length > 2) {
    const runs = 1 + Math.floor(rng() * 2);
    for (let r = 0; r < runs; r++) {
      const count = 2 + Math.floor(rng() * Math.min(3, cells.length - 1));
      const picked = pickN(rng, cells, count);
      connectors.push(picked.map(c => [c.gx, c.gy]));
    }
  }

  // nodes: vertex dots (dimension-callout language)
  const nodes = [];
  const nodeCount = 2 + Math.floor(rng() * 3);
  for (let i = 0; i < nodeCount; i++) {
    const host = cells[Math.floor(rng() * cells.length)];
    nodes.push({ gx: host.gx, gy: host.gy, corner: Math.floor(rng() * 4) });
  }

  const accentIndex = Math.floor(rng() * cells.length);
  return { G, cells, stacked, connectors, nodes, accentIndex };
}

// polygon corner points for any shape kind, centered (cx,cy), size s
function shapePoints(kind, cx, cy, s, rot) {
  const h = s / 2;
  let pts;
  if (kind === 'tri') pts = [[0, -h], [h, h], [-h, h]];
  else if (kind === 'sq') pts = [[-h, -h], [h, -h], [h, h], [-h, h]];
  else if (kind === 'diamond') pts = [[0, -h], [h, 0], [0, h], [-h, 0]];
  else { // hex
    pts = [];
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + i * Math.PI / 3;
      pts.push([Math.cos(a) * h, Math.sin(a) * h]);
    }
  }
  const rad = rot * Math.PI / (kind === 'hex' ? 6 : 2);
  const cos = Math.cos(rad), sin = Math.sin(rad);
  return pts.map(p => [cx + p[0] * cos - p[1] * sin, cy + p[0] * sin + p[1] * cos]);
}

// kept for compatibility with older callers
function triPoints(cx, cy, s, rot) { return shapePoints('tri', cx, cy, s, rot); }

// ---- SVG renderer (the app + spellbook page)

function generateSigil(seedString, houseColor, opts) {
  opts = opts || {};
  const size = opts.size || 240;
  const m = sigilModel(seedString);
  const u = size / (m.G + 2);
  const center = c => [u + c.gx * u + u / 2, u + c.gy * u + u / 2];
  const gridPt = g => [u + g[0] * u + u / 2, u + g[1] * u + u / 2];

  const parts = [];

  // connectors first (under the shapes)
  for (const run of m.connectors) {
    const d = run.map((g, i) => (i ? 'L' : 'M') + gridPt(g).map(v => v.toFixed(1)).join(' ')).join(' ');
    parts.push('<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1" opacity="0.55"/>');
  }

  m.cells.forEach((c, i) => {
    const fill = i === m.accentIndex ? houseColor : 'currentColor';
    const [cx, cy] = center(c);
    const scale = c.kind === 'hex' ? 1.02 : 0.92;
    const pts = shapePoints(c.kind, cx, cy, u * scale, c.rot)
      .map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    parts.push('<polygon points="' + pts + '" fill="' + fill + '"/>');
  });

  for (const s of m.stacked) {
    const [cx, cy] = center(s);
    const pts = shapePoints(s.kind, cx, cy, u * 0.4, s.rot)
      .map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    parts.push('<polygon points="' + pts + '" fill="var(--paper, #fff)"/>');
  }

  // vertex nodes
  for (const n of m.nodes) {
    const [cx, cy] = center(n);
    const corners = shapePoints('sq', cx, cy, u * 0.92, 0);
    const p = corners[n.corner % corners.length];
    parts.push('<rect x="' + (p[0] - 1.8).toFixed(1) + '" y="' + (p[1] - 1.8).toFixed(1) +
      '" width="3.6" height="3.6" fill="currentColor"/>');
  }

  // base plane — the tessellation surface, like the pamphlet diagram
  const baseY = u + m.G * u + u * 0.4;
  parts.push('<line x1="' + u + '" y1="' + baseY + '" x2="' + (u + m.G * u) + '" y2="' + baseY +
    '" stroke="currentColor" stroke-width="1.5"/>');

  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" ' +
    'class="sigil" role="img" aria-label="spell sigil">' + parts.join('') + '</svg>';
}

if (typeof module !== 'undefined') module.exports = { sigilModel, shapePoints, triPoints, generateSigil };
