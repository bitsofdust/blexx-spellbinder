// BLEXX SPELLBINDER — CIPHER v0
// Renders text in the Blexx alphabet using the SVGs extracted from
// BLEXX_Alphabet.pdf (tools/extract_alphabet.py → assets/alphabet/a-z.svg).
// Glyphs are inlined (not <img>) so currentColor inks them.

const CIPHER = (function () {
  const cache = {};

  async function glyph(letter) {
    if (typeof EMBEDDED_ASSETS !== 'undefined' && EMBEDDED_ASSETS.alphabet[letter]) {
      return EMBEDDED_ASSETS.alphabet[letter];
    }
    if (!cache[letter]) {
      cache[letter] = fetch('assets/alphabet/' + letter + '.svg')
        .then(r => { if (!r.ok) throw new Error('missing glyph ' + letter); return r.text(); });
    }
    return cache[letter];
  }

  // Render `text` into `el` as a row of Blexx glyphs.
  // Non-letters become word gaps. Decodes to the hidden blessing.
  async function render(el, text) {
    el.innerHTML = '';
    el.setAttribute('data-decodes-to', text);
    for (const ch of text.toLowerCase()) {
      if (ch >= 'a' && ch <= 'z') {
        const span = document.createElement('span');
        span.className = 'glyph';
        try {
          span.innerHTML = await glyph(ch);
        } catch (e) {
          span.textContent = ch; // degrade to plain letter, never break
        }
        el.appendChild(span);
      } else {
        const gap = document.createElement('span');
        gap.className = 'glyph-gap';
        el.appendChild(gap);
      }
    }
  }

  return { render, glyph };
})();
