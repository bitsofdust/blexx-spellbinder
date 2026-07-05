// BLEXX SPELLBINDER — MOTION SEAL v0
// The emailable/downloadable moving image of a bound spell: the spell's own
// sigil as glowing line-art on near-black, with glitch partitions in the
// language of the blexx-gif entropy engine (chromatic aberration, slice
// shifts, scanlines, tech-text stamps), compiled to an animated GIF.
//
// Unlike the original engine, every "random" decision here is seeded by the
// spell — same spell ⇒ same Motion Seal, forever (frame-indexed rng, so the
// glitches themselves are bound).

const MOTION_SEAL = (function () {

  const SIZE = 500;
  const FRAMES = 36;              // @100ms → 3.6s loop
  const DARK = '#050507';

  // gifenc (ESM, loaded on first compile): synchronous encode, no worker /
  // setTimeout chains — immune to background-tab throttling, and the GIF
  // bytes come out deterministic.
  let gifencP = null;
  function gifenc() {
    if (!gifencP) gifencP = import('https://cdn.jsdelivr.net/npm/gifenc@1.0.3/+esm');
    return gifencP;
  }

  // frame phase plan: steady / glitch / variant / glitch / steady / flicker
  function phaseFor(i) {
    if (i < 9) return 'steady';
    if (i < 12) return 'glitch';
    if (i < 19) return 'variant';
    if (i < 22) return 'glitch';
    if (i < 33) return 'steady';
    return 'glitch';
  }

  function rasterize(svgText, heightPx, color) {
    let s = svgText.replace(/currentColor/g, color);
    const vb = /viewBox="([\d.\s-]+)"/.exec(s);
    const [, , vbW, vbH] = vb ? vb[1].split(/\s+/).map(Number) : [0, 0, 1, 1];
    const wPx = Math.max(1, Math.round(heightPx * (vbW / vbH)));
    if (!/<svg[^>]*\sfill=/.test(s)) s = s.replace('<svg ', '<svg fill="' + color + '" ');
    s = s.replace('<svg ', '<svg width="' + wPx + '" height="' + heightPx + '" ');
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(new Blob([s], { type: 'image/svg+xml' }));
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = reject;
      img.src = url;
    });
  }

  // UI-breathing yield that background-tab timer throttling can't clamp
  function yieldNow() {
    return new Promise(r => {
      const mc = new MessageChannel();
      mc.port1.onmessage = () => r();
      mc.port2.postMessage(null);
    });
  }

  function glow(ctx, color, blur) { ctx.shadowColor = color; ctx.shadowBlur = blur; }
  function unglow(ctx) { ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; }

  function strokePoly(ctx, pts, close) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if (close !== false) ctx.closePath();
    ctx.stroke();
  }

  // house aura — the entropy-engine's per-house geometry language,
  // drawn behind the sigil. Circles are legal again in the digital seal.
  function drawAura(ctx, house, houseColor, cx, cy, t) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = houseColor;

    if (house === 'chance') {
      // radiating chaos shards + floating chevron gateway
      const numShards = 9;
      for (let i = 0; i < numShards; i++) {
        const angle = (i * Math.PI * 2) / numShards + t * 0.05;
        const expansion = Math.sin(t * 0.25 + i) * 8 + 14;
        const r1 = 150 + expansion, r2 = r1 + 18;
        glow(ctx, houseColor, 8);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
        ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
        ctx.stroke();
        unglow(ctx);
        if (i % 2 === 0) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(Math.cos(angle) * r2 - 2, Math.sin(angle) * r2 - 2, 4, 4);
        }
      }
      const cy2 = -196 - Math.sin(t * 0.3) * 5;
      glow(ctx, houseColor, 12);
      ctx.beginPath();
      ctx.moveTo(-22, cy2 + 11); ctx.lineTo(0, cy2); ctx.lineTo(22, cy2 + 11);
      ctx.stroke();
      unglow(ctx);

    } else if (house === 'manifestation') {
      // concentric dashed orbits + vesica piscis
      for (const [r, speed, dash] of [[168, 0.5, [10, 14]], [204, -0.3, [4, 18]]]) {
        ctx.setLineDash(dash);
        ctx.lineDashOffset = t * speed * 6;
        glow(ctx, houseColor, 7);
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
        unglow(ctx);
      }
      ctx.setLineDash([]);
      const sep = 26 + Math.sin(t * 0.2) * 6;
      ctx.globalAlpha = 0.55;
      glow(ctx, houseColor, 9);
      ctx.beginPath(); ctx.arc(-sep, 0, 140, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(sep, 0, 140, 0, Math.PI * 2); ctx.stroke();
      unglow(ctx);
      ctx.globalAlpha = 1;

    } else {
      // devotion: nested fortress squares, counter-rotating
      for (const [r, dir, alpha] of [[158, 1, 0.9], [196, -1, 0.55]]) {
        ctx.save();
        ctx.rotate(dir * t * 0.02 + (dir < 0 ? Math.PI / 4 : 0));
        ctx.globalAlpha = alpha;
        glow(ctx, houseColor, 8);
        ctx.strokeRect(-r, -r, r * 2, r * 2);
        unglow(ctx);
        ctx.restore();
      }
      // corner anchors
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + i * Math.PI / 2 + t * 0.02;
        const r = 158 * Math.SQRT2;
        ctx.fillRect(Math.cos(a) * r - 2.5, Math.sin(a) * r - 2.5, 5, 5);
      }
    }
    ctx.restore();
  }

  // the spell's sigil as neon line-art
  function drawSigilNeon(ctx, model, houseColor, cx, cy, box, t, rot) {
    const u = box / (model.G + 2);
    const origin = -box / 2 + u;
    const center = c => [origin + c.gx * u + u / 2, origin + c.gy * u + u / 2];
    ctx.save();
    ctx.translate(cx, cy);
    if (rot) ctx.rotate(rot);
    ctx.lineJoin = 'round';

    // constellation connectors under the shapes
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    for (const run of model.connectors) {
      ctx.beginPath();
      run.forEach((g, i) => {
        const p = [origin + g[0] * u + u / 2, origin + g[1] * u + u / 2];
        i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
      });
      ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.lineWidth = 2.5;
    model.cells.forEach((c, idx) => {
      const [px, py] = center(c);
      const isAccent = idx === model.accentIndex;
      ctx.strokeStyle = isAccent ? houseColor : 'rgba(255,255,255,0.92)';
      glow(ctx, isAccent ? houseColor : 'rgba(255,255,255,0.5)', isAccent ? 16 : 9);
      const wob = Math.sin(t * 0.35 + idx) * 1.2;   // each shape breathes alone
      const scale = c.kind === 'hex' ? 1.02 : 0.92;
      const pts = shapePoints(c.kind, px, py + wob, u * scale, c.rot);
      strokePoly(ctx, pts);
      if (isAccent) {
        ctx.fillStyle = houseColor + '33';
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.closePath(); ctx.fill();
      }
      unglow(ctx);
    });

    // stacked knockouts become inner marks
    ctx.strokeStyle = houseColor;
    ctx.lineWidth = 1.6;
    for (const s of model.stacked) {
      const [px, py] = center(s);
      glow(ctx, houseColor, 10);
      strokePoly(ctx, shapePoints(s.kind, px, py, u * 0.4, s.rot));
      unglow(ctx);
    }

    // vertex nodes
    ctx.fillStyle = '#ffffff';
    for (const n of model.nodes) {
      const [px, py] = center(n);
      const corners = shapePoints('sq', px, py, u * 0.92, 0);
      const p = corners[n.corner % corners.length];
      ctx.fillRect(p[0] - 2, p[1] - 2, 4, 4);
    }

    // base plane
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2.5;
    glow(ctx, 'rgba(255,255,255,0.4)', 8);
    const baseY = origin + model.G * u + u * 0.4;
    ctx.beginPath();
    ctx.moveTo(origin, baseY); ctx.lineTo(origin + model.G * u, baseY);
    ctx.stroke();
    unglow(ctx);
    ctx.restore();
  }

  const TECH_TEXT = [
    'SYS_ENTROPY: OVERLOAD', 'BLX-SEAL_INCOMING_VECTOR', 'REGISTRY: LOCKED',
    'PULL DOUBLED 11:11', 'THE HOUR-KEEPER IS WATCHING', 'ALWAYS A BLEXXING',
  ];

  // seeded glitch pass — the entropy-engine language, but bound
  function drawGlitch(ctx, canvas, rng, houseColor, t) {
    // chromatic aberration split
    if (rng() < 0.6) {
      const off = Math.sin(t * 0.4) * 4 + rng() * 3;
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = houseColor + '30';
      ctx.fillRect(off, 0, SIZE, SIZE);
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.fillRect(-off, 0, SIZE, SIZE);
      ctx.globalCompositeOperation = 'source-over';
    }
    // slice shifts (self-sample)
    const numSlices = Math.floor(rng() * 4) + 2;
    for (let i = 0; i < numSlices; i++) {
      const sliceY = Math.floor(rng() * SIZE);
      const sliceH = Math.floor(rng() * 45) + 10;
      const shiftX = (rng() - 0.5) * 30;
      ctx.drawImage(canvas, 0, sliceY, SIZE, sliceH, shiftX, sliceY, SIZE, sliceH);
    }
    // tech-text stamps
    if (rng() < 0.5) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '9px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(TECH_TEXT[Math.floor(rng() * TECH_TEXT.length)], 14, 60 + rng() * (SIZE - 120));
      ctx.fillText(TECH_TEXT[Math.floor(rng() * TECH_TEXT.length)], SIZE - 170, 60 + rng() * (SIZE - 120));
    }
    // scanlines
    const numLines = Math.floor(rng() * 3);
    for (let i = 0; i < numLines; i++) {
      ctx.strokeStyle = rng() > 0.5 ? 'rgba(255,255,255,0.5)' : houseColor;
      ctx.lineWidth = rng() * 1.5 + 0.3;
      const lineY = rng() * SIZE;
      ctx.beginPath(); ctx.moveTo(0, lineY); ctx.lineTo(SIZE, lineY); ctx.stroke();
    }
  }

  function drawOverlay(ctx, spell, markImg, dateStr) {
    // frame corners
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.5;
    const m = 12, b = 16;
    [[m, m + b, m, m, m + b, m], [SIZE - m - b, m, SIZE - m, m, SIZE - m, m + b],
     [m, SIZE - m - b, m, SIZE - m, m + b, SIZE - m],
     [SIZE - m - b, SIZE - m, SIZE - m, SIZE - m, SIZE - m, SIZE - m - b]].forEach(p => {
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[2], p[3]); ctx.lineTo(p[4], p[5]); ctx.stroke();
    });
    // dividers
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath(); ctx.moveTo(m, 46); ctx.lineTo(SIZE - m, 46);
    ctx.moveTo(m, SIZE - 46); ctx.lineTo(SIZE - m, SIZE - 46); ctx.stroke();
    // header: rune + wordmark text + house
    if (markImg) ctx.drawImage(markImg, m + 8, m + 4, markImg.width * (22 / markImg.height), 22);
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText('BLEXX // MOTION SEAL', m + 30, m + 20);
    ctx.textAlign = 'right';
    ctx.fillStyle = spell.houseColor;
    ctx.fillText('HOUSE OF ' + spell.houseName, SIZE - m - 8, m + 20);
    // footer: name + registry
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '11px "Courier New", monospace';
    const name = spell.name.length > 34 ? spell.name.slice(0, 33) + '…' : spell.name;
    ctx.fillText(name.toUpperCase() + ' // ' + dateStr, m + 8, SIZE - m - 8);
    ctx.textAlign = 'right';
    ctx.fillStyle = spell.houseColor;
    ctx.fillText(spell.registry.label, SIZE - m - 8, SIZE - m - 8);
  }

  // compile(spell, markSvg, opts) -> { url, blob, filename }
  // opts.onProgress(0..1), opts.dateStr (defaults to today)
  async function compile(spell, markSvg, opts) {
    opts = opts || {};
    const onProgress = opts.onProgress || (() => {});
    const dateStr = opts.dateStr || new Date().toISOString().slice(0, 10);
    const { GIFEncoder, quantize, applyPalette } = await gifenc();

    const model = sigilModel(spell.seed);
    const markImg = await rasterize(markSvg, 44, spell.houseColor).catch(() => null);
    const firstLetter = (spell.hiddenBlessing.match(/[a-z]/i) || ['b'])[0].toLowerCase();
    const glyphImg = await CIPHER.glyph(firstLetter)
      .then(svg => rasterize(svg, 320, spell.houseColor)).catch(() => null);

    const canvas = document.createElement('canvas');
    canvas.width = SIZE; canvas.height = SIZE;
    const ctx = canvas.getContext('2d');

    const frames = [];
    for (let i = 0; i < FRAMES; i++) {
      const rng = SeededRandom('motion::' + spell.seed + '::' + i);  // bound glitches
      const t = i;
      ctx.fillStyle = DARK;
      ctx.fillRect(0, 0, SIZE, SIZE);
      const phase = phaseFor(i);
      const pulse = 1 + Math.sin(i * (Math.PI * 2 / FRAMES) * 2) * 0.025; // loops cleanly

      drawAura(ctx, spell.house, spell.houseColor, SIZE / 2, SIZE / 2, t);
      if (phase === 'variant' && glyphImg) {
        // the sealed blessing's first glyph, chromatically doubled
        const g = 300;
        ctx.globalAlpha = 0.28;
        ctx.drawImage(glyphImg, (SIZE - g) / 2 + 4, (SIZE - g) / 2 + 3, g, g);
        ctx.globalAlpha = 0.9;
        ctx.drawImage(glyphImg, (SIZE - g) / 2, (SIZE - g) / 2, g, g);
        ctx.globalAlpha = 1;
        drawSigilNeon(ctx, model, spell.houseColor, SIZE / 2, SIZE / 2, 190 * pulse, t, Math.PI / 4);
      } else {
        drawSigilNeon(ctx, model, spell.houseColor, SIZE / 2, SIZE / 2, 300 * pulse, t, 0);
      }

      if (phase === 'glitch') drawGlitch(ctx, canvas, rng, spell.houseColor, t);
      else if (rng() < 0.08) drawGlitch(ctx, canvas, rng, spell.houseColor, t); // stray flickers

      drawOverlay(ctx, spell, markImg, dateStr);
      frames.push(ctx.getImageData(0, 0, SIZE, SIZE));
      onProgress(0.4 * (i + 1) / FRAMES);
      if (i % 6 === 5) await yieldNow();
    }

    // encode — synchronous per frame, chunked so progress can paint
    const gif = GIFEncoder();
    for (let i = 0; i < frames.length; i++) {
      const { data, width, height } = frames[i];
      const palette = quantize(data, 256);
      const index = applyPalette(data, palette);
      gif.writeFrame(index, width, height, { palette, delay: 100 });
      onProgress(0.4 + 0.6 * (i + 1) / frames.length);
      if (i % 4 === 3) await yieldNow();
    }
    gif.finish();

    const blob = new Blob([gif.bytes()], { type: 'image/gif' });
    return {
      url: URL.createObjectURL(blob),
      blob: blob,
      sizeKB: Math.round(blob.size / 1024),
      filename: 'BLEXX_SEAL_' + spell.registry.label.replace(/\//g, '-') + '.gif',
    };
  }

  // animate(canvas, spell) — the living sigil, running in-page at the seal's
  // cadence. Same renderer as the GIF (aura + neon sigil + seeded glitches),
  // drawn in 500-space and scaled to the canvas. Returns a stop() function.
  function animate(canvas, spell) {
    const ctx = canvas.getContext('2d');
    const model = sigilModel(spell.seed);
    const k = canvas.width / SIZE;
    let t = 0, raf = null, last = 0;

    function drawOnce() {
      const i = t % FRAMES;
      const rng = SeededRandom('motion::' + spell.seed + '::' + i);
      ctx.save();
      ctx.scale(k, k);
      ctx.fillStyle = DARK;
      ctx.fillRect(0, 0, SIZE, SIZE);
      drawAura(ctx, spell.house, spell.houseColor, SIZE / 2, SIZE / 2, t);
      const pulse = 1 + Math.sin(i * (Math.PI * 2 / FRAMES) * 2) * 0.025;
      drawSigilNeon(ctx, model, spell.houseColor, SIZE / 2, SIZE / 2, 300 * pulse, t, 0);
      if (phaseFor(i) === 'glitch' || rng() < 0.06) {
        drawGlitch(ctx, canvas, rng, spell.houseColor, t);
      }
      ctx.restore();
    }

    function frame(ts) {
      raf = requestAnimationFrame(frame);
      if (ts - last < 95) return;         // ~10fps, the GIF's cadence
      last = ts; t++;
      drawOnce();
    }

    drawOnce();                            // never a blank sigil box
    raf = requestAnimationFrame(frame);
    // rAF pauses entirely in hidden tabs; a slow heartbeat keeps the sigil
    // alive there (browsers clamp hidden-tab intervals to ~1s — fine).
    const heartbeat = setInterval(() => {
      if (document.hidden) { t++; drawOnce(); }
    }, 1000);

    return function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      clearInterval(heartbeat);
    };
  }

  // idle(canvas) — the unbound state: a scrying window. Ephemeral sigils
  // compose, hold, glitch, and dissolve, cycling through the three houses'
  // colors and aura geometry. Nothing here is a real spell — the models are
  // drawn from a rolling epoch seed and discarded.
  function idle(canvas) {
    const ctx = canvas.getContext('2d');
    const k = canvas.width / SIZE;
    const HOUSES = [
      ['chance', '#ED2024'],
      ['devotion', '#882782'],
      ['manifestation', '#405EAB'],
    ];
    const P = 40;                          // ticks per apparition
    let t = 0, raf = null, last = 0;
    let epoch = -1, model = null;

    function drawOnce() {
      const cyc = t % P;
      const e = Math.floor(t / P);
      if (e !== epoch) { epoch = e; model = sigilModel('await::' + epoch); }
      const [houseKey, color] = HOUSES[epoch % 3];

      // fade in, hold, dissolve
      const fade = cyc < 6 ? cyc / 6 : cyc > P - 8 ? Math.max(0, (P - cyc) / 8) : 1;

      ctx.save();
      ctx.scale(k, k);
      ctx.fillStyle = DARK;
      ctx.fillRect(0, 0, SIZE, SIZE);

      ctx.globalAlpha = 0.4 + fade * 0.25;
      drawAura(ctx, houseKey, color, SIZE / 2, SIZE / 2, t);

      ctx.globalAlpha = fade;
      drawSigilNeon(ctx, model, color, SIZE / 2, SIZE / 2, 280, t, (epoch % 8) * Math.PI / 8);
      ctx.globalAlpha = 1;

      const rng = SeededRandom('idle::' + t);
      if (cyc > P - 6 || rng() < 0.05) drawGlitch(ctx, canvas, rng, color, t);
      ctx.restore();
    }

    function frame(ts) {
      raf = requestAnimationFrame(frame);
      if (ts - last < 95) return;
      last = ts; t++;
      drawOnce();
    }

    drawOnce();
    raf = requestAnimationFrame(frame);
    const heartbeat = setInterval(() => {
      if (document.hidden) { t++; drawOnce(); }
    }, 1000);

    return function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      clearInterval(heartbeat);
    };
  }

  return { compile, animate, idle };
})();
