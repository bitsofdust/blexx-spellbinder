// BLEXX SPELLBINDER — SPELLBOOK PAGE PDF v1
// Two-sheet A5 spellbook page:
//   SHEET 1 — SPEC: sigil, parameters, components, procedure (form layout)
//   SHEET 2 — RITUAL SURFACE: the marked ring, found-component square,
//             the words + sealed line. Lay flat; charge; cast.
// v1 fonts: helvetica/courier stand-ins — embed licensed brand TTFs later.

const SPELLBOOK_PDF = (function () {

  const PAPER = [244, 241, 234];   // #f4f1ea
  const INK = [16, 32, 63];        // #10203f
  const W = 148, H = 210, M = 10, CW = W - 2 * M;

  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  // Rasterize an SVG string to a PNG data URL (rune mark + cipher glyphs).
  function svgToPng(svgText, heightPx, color) {
    let s = svgText.replace(/currentColor/g, color);
    const vb = /viewBox="([\d.\s-]+)"/.exec(s);
    const [, , vbW, vbH] = vb ? vb[1].split(/\s+/).map(Number) : [0, 0, 1, 1];
    const wPx = Math.max(1, Math.round(heightPx * (vbW / vbH)));
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

  // build(spell, brandMarkSvg) -> saves BLX-XXX-NNN.pdf (2 sheets)
  async function build(spell, brandMarkSvg) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a5' });
    const house = hexToRgb(spell.houseColor);
    const houseHex = spell.houseColor;

    const ink = () => doc.setTextColor(INK[0], INK[1], INK[2]);
    const acc = () => doc.setTextColor(house[0], house[1], house[2]);
    const inkLine = (w) => { doc.setDrawColor(INK[0], INK[1], INK[2]); doc.setLineWidth(w || 0.3); };
    const paper = () => { doc.setFillColor(PAPER[0], PAPER[1], PAPER[2]); doc.rect(0, 0, W, H, 'F'); };

    const markInk = await svgToPng(brandMarkSvg, 120, houseHex).catch(() => null);
    const markDark = await svgToPng(brandMarkSvg, 120, '#10203f').catch(() => null);

    function titleBlock(sheetLabel) {
      inkLine(0.5);
      doc.rect(M, M, CW, 9);
      let cx = M;
      if (markInk) {
        const mw = 6 * markInk.aspect;
        doc.addImage(markInk.dataUrl, 'PNG', M + 2, M + 1.5, mw, 6);
        cx = M + mw + 4;
      }
      const cuts = [cx, M + 36, M + 78];
      cuts.forEach(c => doc.line(c, M, c, M + 9));
      doc.setFont('courier', 'normal'); doc.setFontSize(6); ink();
      doc.text('BLEXX STUDIOS', cuts[0] + 2, M + 5.5);
      doc.text(sheetLabel, cuts[1] + 2, M + 5.5);
      doc.setFont('courier', 'bold'); acc();
      doc.text(spell.registry.label + (spell.registry.provisional ? ' *' : ''), W - M - 2, M + 5.5, { align: 'right' });
    }

    function footer() {
      const fy = H - M - 1;
      inkLine(0.5);
      doc.line(M, fy - 5, W - M, fy - 5);
      if (markDark) doc.addImage(markDark.dataUrl, 'PNG', M, fy - 3.5, 4 * markDark.aspect, 4);
      doc.setFont('courier', 'normal'); doc.setFontSize(5.5); ink();
      doc.text('HOUSE OF ' + spell.houseName, W / 2, fy - 0.5, { align: 'center' });
      doc.text('BLEXX.ME', W - M, fy - 0.5, { align: 'right' });
    }

    function section(title, y) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); acc();
      doc.text(title, M, y);
      inkLine(0.5);
      doc.line(M, y + 1.5, W - M, y + 1.5);
      return y + 6;
    }

    // Bordered key/value table. rows = [[label, value], ...]
    function specTable(x, y, w, labelW, rows, valueSize) {
      doc.setFontSize(valueSize);
      const heights = rows.map(([, v]) => {
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(v, w - labelW - 5);
        return Math.max(6.5, lines.length * 3.3 + 3.2);
      });
      const total = heights.reduce((a, b) => a + b, 0);
      inkLine(0.5); doc.rect(x, y, w, total);
      inkLine(0.2); doc.line(x + labelW, y, x + labelW, y + total);
      let ry = y;
      rows.forEach(([k, v], i) => {
        if (i) { inkLine(0.2); doc.line(x, ry, x + w, ry); }
        doc.setFont('courier', 'bold'); doc.setFontSize(5.3); acc();
        doc.text(k, x + 2, ry + 4);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(valueSize); ink();
        doc.text(doc.splitTextToSize(v, w - labelW - 5), x + labelW + 2.5, ry + 4);
        ry += heights[i];
      });
      return y + total;
    }

    // ============ SHEET 1 — SPEC ============
    paper();
    titleBlock('SHEET 1/2 - SPEC');

    let y = M + 15;
    doc.setFont('courier', 'bold'); doc.setFontSize(7.5); acc();
    doc.text(spell.blessing.toUpperCase(), M, y);
    y += 6;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); ink();
    const nameLines = doc.splitTextToSize(spell.name, CW);
    doc.text(nameLines, M, y);
    y += nameLines.length * 6.5 + 4;

    // sigil frame (caption OUTSIDE the frame — no more overlap)
    const sigTop = y, box = 46;
    inkLine(0.5);
    doc.setLineDashPattern([1, 1], 0);
    doc.rect(M, sigTop, box + 4, box + 4);
    doc.setLineDashPattern([], 0);
    drawSigil(doc, spell, M + 2, sigTop + 2, box);
    doc.setFont('courier', 'normal'); doc.setFontSize(5); ink();
    doc.text('FIG. A - SIGIL · TESSELLATE + STACK', M + (box + 4) / 2, sigTop + box + 8.5, { align: 'center' });

    // spec table beside the sigil
    const tx = M + box + 10, tw = W - M - tx;
    const specRows = [['DESIRE', spell.desire]];
    if (spell.giftFor) specRows.push(['BOUND FOR', spell.giftFor]);
    specRows.push(['CASTER', spell.casterMark], ['CHARGE', spell.charge.toUpperCase()],
      ['CAST WINDOW', spell.castWindow.text], ['DURATION', spell.duration]);
    const specBottom = specTable(tx, sigTop, tw, 22, specRows, 7.5);

    y = Math.max(sigTop + box + 12, specBottom) + 6;

    // components table: name | role | sku (+ keychain, + found)
    y = section('COMPONENTS', y);
    const c = spell.components;
    const compRows = c.kit.map(k => [k.name, k.role, k.sku]);
    if (c.keychain) compRows.push([c.keychain.name, c.keychain.role, c.keychain.sku]);
    compRows.push(['FOUND: ' + c.found, 'you supply this - the kit cannot contain it', '-']);
    const c1 = 42, c2 = 58, c3 = CW - c1 - c2;
    const rowH = compRows.map(r => {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
      const n = doc.splitTextToSize(r[0], c1 - 4).length;
      const ro = doc.splitTextToSize(r[1], c2 - 4).length;
      return Math.max(6, Math.max(n, ro) * 3 + 3);
    });
    const compTotal = rowH.reduce((a, b) => a + b, 0);
    inkLine(0.5); doc.rect(M, y, CW, compTotal);
    inkLine(0.2); doc.line(M + c1, y, M + c1, y + compTotal); doc.line(M + c1 + c2, y, M + c1 + c2, y + compTotal);
    let ry = y;
    compRows.forEach((r, i) => {
      if (i) { inkLine(0.2); doc.line(M, ry, M + CW, ry); }
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); ink();
      doc.text(doc.splitTextToSize(r[0], c1 - 4), M + 2, ry + 3.8);
      doc.setFont('helvetica', 'italic');
      doc.text(doc.splitTextToSize(r[1], c2 - 4), M + c1 + 2, ry + 3.8);
      doc.setFont('courier', 'normal'); doc.setFontSize(5.3);
      doc.text(r[2], M + c1 + c2 + 2, ry + 3.8);
      ry += rowH[i];
    });
    y += compTotal + 3;

    // ring note strip
    inkLine(0.4);
    doc.setLineDashPattern([1.2, 1], 0);
    doc.roundedRect(M, y, CW, 10, 2, 2);
    doc.setDrawColor(house[0], house[1], house[2]);
    doc.circle(M + 6.5, y + 5, 3);
    doc.setLineDashPattern([], 0);
    doc.setFont('courier', 'normal'); doc.setFontSize(5.3); ink();
    doc.text('THE MARKED RING - SHEET 2 IS THE RITUAL SURFACE. CHARGE KIT COMPONENTS INSIDE THE RING BEFORE CASTING.', M + 12, y + 6);
    y += 15;

    // procedure — numbered rows with rules
    y = section('THE PROCEDURE', y);
    doc.setFontSize(7.5);
    const stepH = spell.steps.map(s => {
      doc.setFont('helvetica', 'normal');
      return doc.splitTextToSize(s, CW - 12).length * 3.3 + 3.4;
    });
    const stepTotal = stepH.reduce((a, b) => a + b, 0);
    inkLine(0.5); doc.rect(M, y, CW, stepTotal);
    ry = y;
    spell.steps.forEach((s, i) => {
      if (i) { inkLine(0.2); doc.line(M, ry, M + CW, ry); }
      doc.setFont('courier', 'bold'); doc.setFontSize(6); acc();
      doc.text('0' + (i + 1), M + 2, ry + 4);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); ink();
      doc.text(doc.splitTextToSize(s, CW - 12), M + 10, ry + 4);
      ry += stepH[i];
    });

    footer();

    // ============ SHEET 2 — RITUAL SURFACE ============
    doc.addPage();
    paper();
    titleBlock('SHEET 2/2 - RITUAL SURFACE');

    doc.setFont('courier', 'normal'); doc.setFontSize(6); ink();
    doc.text('LAY THIS SHEET FLAT. THE RING CHARGES. THE SQUARE RECEIVES. SPEAK THE WORDS OVER BOTH.', W / 2, M + 15, { align: 'center' });

    // the marked ring
    const rcx = W / 2, rcy = 78, rr = 40;
    doc.setDrawColor(house[0], house[1], house[2]);
    doc.setLineWidth(0.8);
    doc.setLineDashPattern([2.2, 1.8], 0);
    doc.circle(rcx, rcy, rr);
    doc.setLineDashPattern([1, 1], 0);
    doc.setLineWidth(0.3);
    doc.circle(rcx, rcy, rr - 4);
    doc.setLineDashPattern([], 0);
    doc.setFont('courier', 'bold'); doc.setFontSize(7); acc();
    doc.text('PLACE KIT COMPONENTS HERE', rcx, rcy - 2, { align: 'center' });
    doc.setFont('courier', 'normal'); doc.setFontSize(5.5); ink();
    doc.text('LET THEM SIT WHILE YOU READ THE WORDS', rcx, rcy + 3, { align: 'center' });
    doc.setFont('courier', 'normal'); doc.setFontSize(5.3); ink();
    doc.text('THE MARKED RING', rcx, rcy + rr + 5, { align: 'center' });

    // found-component square
    const fsY = 132;
    inkLine(0.5);
    doc.setLineDashPattern([1.5, 1.2], 0);
    doc.rect(M + 2, fsY, 36, 36);
    doc.setLineDashPattern([], 0);
    doc.setFont('courier', 'bold'); doc.setFontSize(5.6); ink();
    doc.text('FOUND', M + 20, fsY + 15, { align: 'center' });
    doc.text('COMPONENT', M + 20, fsY + 19, { align: 'center' });
    doc.text('HERE', M + 20, fsY + 23, { align: 'center' });
    doc.setFontSize(4.8);
    doc.text(doc.splitTextToSize(spell.components.found.toUpperCase(), 34), M + 20, fsY + 41, { align: 'center' });

    // the words + sealed line
    const wx = M + 46, ww = W - M - wx;
    let wy = fsY;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); acc();
    doc.text('THE WORDS', wx, wy);
    inkLine(0.4); doc.line(wx, wy + 1.5, wx + ww, wy + 1.5);
    wy += 6;
    doc.setFont('helvetica', 'italic'); doc.setFontSize(7); ink();
    for (const line of spell.incantation) {
      const lines = doc.splitTextToSize(line, ww);
      doc.text(lines, wx, wy);
      wy += lines.length * 3.2 + 0.8;
    }
    wy += 2;
    let gx = wx;
    for (const ch of spell.hiddenBlessing.toLowerCase()) {
      if (ch >= 'a' && ch <= 'z') {
        const g = await svgToPng(await CIPHER.glyph(ch), 80, houseHex).catch(() => null);
        if (g) { doc.addImage(g.dataUrl, 'PNG', gx, wy - 3, 3.8 * g.aspect, 3.8); gx += 3.8 * g.aspect + 0.9; }
      } else gx += 2.2;
    }
    wy += 3.5;
    doc.setFont('courier', 'normal'); doc.setFontSize(4.8); ink();
    doc.text('SEALED LINE - DECODE WITH THE BLEXX ALPHABET', wx, wy);

    footer();

    doc.save(spell.registry.label.replace(/\//g, '-') + '.pdf');
  }

  return { build };
})();
