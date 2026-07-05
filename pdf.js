// BLEXX SPELLBINDER — SPELLBOOK PAGE PDF v0
// Builds the downloadable A5 spellbook page with jsPDF.
// Blueprint sheet structure, house color as the single accent ink.
// v0 fonts: helvetica/courier stand-ins — embed licensed brand TTFs later.

const SPELLBOOK_PDF = (function () {

  const PAPER = [244, 241, 234];   // #f4f1ea
  const INK = [16, 32, 63];        // #10203f

  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  // Rasterize an SVG string to a PNG data URL (for the rune mark + cipher glyphs).
  function svgToPng(svgText, heightPx, color) {
    let s = svgText.replace(/currentColor/g, color);
    const vb = /viewBox="([\d.\s-]+)"/.exec(s);
    const [, , vbW, vbH] = vb ? vb[1].split(/\s+/).map(Number) : [0, 0, 1, 1];
    const wPx = Math.round(heightPx * (vbW / vbH));
    if (!/<svg[^>]*\sfill=/.test(s)) s = s.replace('<svg ', '<svg fill="' + color + '" ');
    s = s.replace('<svg ', '<svg width="' + wPx + '" height="' + heightPx + '" ');
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(new Blob([s], { type: 'image/svg+xml' }));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = wPx; canvas.height = heightPx;
        canvas.getContext('2d').drawImage(img, 0, 0, wPx, heightPx);
        URL.revokeObjectURL(url);
        resolve({ dataUrl: canvas.toDataURL('image/png'), aspect: vbW / vbH });
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  function pdfPoly(doc, pts, style) {
    const vectors = [];
    for (let i = 1; i < pts.length; i++) {
      vectors.push([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]);
    }
    doc.lines(vectors, pts[0][0], pts[0][1], [1, 1], style, true);
  }

  function drawSigil(doc, spell, x, y, box) {
    const m = sigilModel(spell.seed);
    const u = box / (m.G + 2);
    const center = c => [x + u + c.gx * u + u / 2, y + u + c.gy * u + u / 2];
    const gridPt = g => [x + u + g[0] * u + u / 2, y + u + g[1] * u + u / 2];
    const house = hexToRgb(spell.houseColor);

    // connectors under the shapes
    doc.setDrawColor(INK[0], INK[1], INK[2]);
    doc.setLineWidth(0.25);
    for (const run of m.connectors) {
      for (let i = 1; i < run.length; i++) {
        const a = gridPt(run[i - 1]), b = gridPt(run[i]);
        doc.line(a[0], a[1], b[0], b[1]);
      }
    }

    m.cells.forEach((c, i) => {
      const col = i === m.accentIndex ? house : INK;
      doc.setFillColor(col[0], col[1], col[2]);
      const [cx, cy] = center(c);
      const scale = c.kind === 'hex' ? 1.02 : 0.92;
      pdfPoly(doc, shapePoints(c.kind, cx, cy, u * scale, c.rot), 'F');
    });
    doc.setFillColor(PAPER[0], PAPER[1], PAPER[2]);
    for (const s of m.stacked) {
      const [cx, cy] = center(s);
      pdfPoly(doc, shapePoints(s.kind, cx, cy, u * 0.4, s.rot), 'F');
    }
    // vertex nodes
    doc.setFillColor(INK[0], INK[1], INK[2]);
    for (const n of m.nodes) {
      const [cx, cy] = center(n);
      const corners = shapePoints('sq', cx, cy, u * 0.92, 0);
      const p = corners[n.corner % corners.length];
      doc.rect(p[0] - 0.6, p[1] - 0.6, 1.2, 1.2, 'F');
    }

    doc.setDrawColor(INK[0], INK[1], INK[2]);
    doc.setLineWidth(0.5);
    const baseY = y + u + m.G * u + u * 0.4;
    doc.line(x + u, baseY, x + u + m.G * u, baseY);
  }

  // build(spell, brandMarkSvg) -> saves BLX-XXX-NNN.pdf
  async function build(spell, brandMarkSvg) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a5' });   // 148 x 210
    const W = 148, M = 10;
    const house = hexToRgb(spell.houseColor);
    const houseHex = spell.houseColor;

    const ink = () => doc.setTextColor(INK[0], INK[1], INK[2]);
    const acc = () => doc.setTextColor(house[0], house[1], house[2]);

    // paper
    doc.setFillColor(PAPER[0], PAPER[1], PAPER[2]);
    doc.rect(0, 0, 148, 210, 'F');

    // ---- title block
    const markInk = await svgToPng(brandMarkSvg, 120, houseHex);
    let y = M;
    doc.setDrawColor(INK[0], INK[1], INK[2]);
    doc.setLineWidth(0.5);
    doc.rect(M, y, W - 2 * M, 9);
    const markW = 6 * markInk.aspect;
    doc.addImage(markInk.dataUrl, 'PNG', M + 2, y + 1.5, markW, 6);
    const cuts = [M + markW + 4, M + 38, M + 66, M + 94];
    cuts.forEach(cx => doc.line(cx, y, cx, y + 9));
    doc.setFont('courier', 'normal'); doc.setFontSize(6); ink();
    doc.text('BLEXX STUDIOS', cuts[0] + 2, y + 5.5);
    doc.text('SHEET: SPELL/1', cuts[1] + 2, y + 5.5);
    doc.text(spell.modeLabel + ' · ' + spell.artifactType.toUpperCase(), cuts[2] + 2, y + 5.5);
    doc.setFont('courier', 'bold'); acc();
    doc.text(spell.registry.label + (spell.registry.provisional ? ' *' : ''), cuts[3] + 2, y + 5.5);
    y += 15;

    // ---- blessing + name
    doc.setFont('courier', 'bold'); doc.setFontSize(7.5); acc();
    doc.text(spell.blessing.toUpperCase(), M, y);
    y += 6;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(17); ink();
    const nameLines = doc.splitTextToSize(spell.name, W - 2 * M);
    doc.text(nameLines, M, y);
    y += nameLines.length * 7 + 3;

    // ---- sigil box + params
    const sigTop = y, box = 48;
    doc.setLineDashPattern([1, 1], 0);
    doc.rect(M, sigTop, box + 4, box + 8);
    doc.setLineDashPattern([], 0);
    drawSigil(doc, spell, M + 2, sigTop + 1, box);
    doc.setFont('courier', 'normal'); doc.setFontSize(5); ink();
    doc.text('FIG. A — SIGIL · SHAPE GRAMMAR · TESSELLATE + STACK', M + (box + 4) / 2, sigTop + box + 5.5, { align: 'center' });

    const px = M + box + 10;
    const pw = W - M - px;
    let py = sigTop + 4;
    function param(label, value) {
      doc.setFont('courier', 'bold'); doc.setFontSize(6.5); acc();
      doc.text(label, px, py);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); ink();
      const lines = doc.splitTextToSize(value, pw);
      doc.text(lines, px, py + 3.5);
      py += 3.5 + lines.length * 3.6 + 1.8;
    }
    param('DESIRE', spell.desire);
    if (spell.giftFor) param('BOUND FOR', spell.giftFor);
    param('CASTER', spell.casterMark);
    param('CHARGE', spell.charge.toUpperCase());
    param('CAST WINDOW', spell.castWindow.text);
    param('DURATION', spell.duration);
    y = Math.max(sigTop + box + 12, py + 2);

    function section(title) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); acc();
      doc.text(title, M, y);
      doc.setDrawColor(INK[0], INK[1], INK[2]);
      doc.line(M, y + 1.5, W - M, y + 1.5);
      y += 5.5;
    }

    // ---- components
    section('COMPONENTS');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); ink();
    for (const k of spell.components.kit) {
      const lines = doc.splitTextToSize('• ' + k.name + ' — ' + k.role + '  [' + k.sku + ']', W - 2 * M - 2);
      doc.text(lines, M + 2, y);
      y += lines.length * 3.7;
    }
    const fLines = doc.splitTextToSize('• FOUND: ' + spell.components.found + ' (you supply this)', W - 2 * M - 2);
    doc.text(fLines, M + 2, y);
    y += fLines.length * 3.7 + 3;

    // ---- the words
    section('THE WORDS');
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); ink();
    for (const line of spell.incantation) {
      const lines = doc.splitTextToSize(line, W - 2 * M - 2);
      doc.text(lines, M + 2, y);
      y += lines.length * 4.1;
    }
    // sealed cipher line
    y += 2;
    let gx = M + 2;
    for (const ch of spell.hiddenBlessing.toLowerCase()) {
      if (ch >= 'a' && ch <= 'z') {
        const g = await svgToPng(await CIPHER.glyph(ch), 80, houseHex);
        doc.addImage(g.dataUrl, 'PNG', gx, y - 3.5, 4.5 * g.aspect, 4.5);
        gx += 4.5 * g.aspect + 1;
      } else {
        gx += 2.5;
      }
    }
    y += 4;
    doc.setFont('courier', 'normal'); doc.setFontSize(5); ink();
    doc.text('SEALED LINE — DECODE WITH THE BLEXX ALPHABET', M + 2, y);
    y += 6;

    // ---- procedure
    section('THE PROCEDURE');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); ink();
    spell.steps.forEach((s, i) => {
      const lines = doc.splitTextToSize((i + 1) + '.  ' + s, W - 2 * M - 2);
      doc.text(lines, M + 2, y);
      y += lines.length * 3.7 + 1;
    });

    // ---- footer
    const fy = 210 - M - 2;
    doc.setDrawColor(INK[0], INK[1], INK[2]);
    doc.setLineWidth(0.5);
    doc.line(M, fy - 5, W - M, fy - 5);
    const markFoot = await svgToPng(brandMarkSvg, 120, '#10203f');
    doc.addImage(markFoot.dataUrl, 'PNG', M, fy - 3.5, 4.5 * markFoot.aspect, 4.5);
    doc.setFont('courier', 'normal'); doc.setFontSize(5.5); ink();
    doc.text('ALWAYS A BLEXXING · NEVER A CURSE', 74, fy - 0.5, { align: 'center' });
    doc.text('HOUSE OF ' + spell.houseName + ' · BLEXX.ME', W - M, fy - 0.5, { align: 'right' });

    doc.save(spell.registry.label.replace(/\//g, '-') + '.pdf');
  }

  return { build };
})();
