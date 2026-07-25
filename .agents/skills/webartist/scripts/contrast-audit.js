/*
 * WebArtist — contrast audit.
 * Runs in the page context: paste into the devtools console, or run via
 * Playwright `page.evaluate(...)`. WCAG 2.x relative-luminance contrast.
 *
 * Returns { domFails, overImage }:
 *  - domFails:  text whose color fails against its resolved background-color
 *               (needs >= 4.5 normal, >= 3 for large text).
 *  - overImage: text whose nearest background is transparent down to an element
 *               with a background-IMAGE (or an <img>/<video> behind it). A
 *               DOM-only check can't see those pixels — verify each with
 *               measureOverImage(selectorOrEl), which composites the real image
 *               with any scrim and returns the worst-case contrast.
 */
(() => {
  const parse = (c) => {
    // Handles rgb()/rgba() (0–255) AND color(srgb r g b / a) (0–1 floats),
    // which is what getComputedStyle returns for color-mix(in srgb, …).
    const isFloat = /^color\(/i.test(c);
    const m = (c.match(/-?[\d.]+(?:e-?\d+)?/gi) || [0, 0, 0, 0]).map(Number);
    const a = m[3] === undefined ? 1 : m[3];
    return isFloat
      ? { r: m[0] * 255, g: m[1] * 255, b: m[2] * 255, a }
      : { r: m[0], g: m[1], b: m[2], a };
  };
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = ({ r, g, b }) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const ratio = (a, b) => { const L1 = lum(a), L2 = lum(b); return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); };

  const resolvedBg = (el) => { // first opaque background-color up the tree
    let n = el;
    while (n) { const s = getComputedStyle(n); const c = parse(s.backgroundColor); if (c.a > 0) return { color: c, el: n }; n = n.parentElement; }
    return null;
  };
  const hasImageBehind = (el) => {
    let n = el;
    while (n) {
      const s = getComputedStyle(n);
      if (s.backgroundImage && s.backgroundImage !== 'none') return true;
      if (n.querySelector && n.querySelector(':scope > img, :scope > video, :scope > picture')) return true;
      const c = parse(s.backgroundColor); if (c.a >= 1) return false; // opaque solid: stop
      n = n.parentElement;
    }
    return false;
  };

  const domFails = [], overImage = [];
  document.querySelectorAll('body *').forEach((el) => {
    const text = Array.from(el.childNodes).filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ');
    if (!text) return;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none') return;
    const fg = parse(s.color); if (fg.a === 0) return;
    const fs = parseFloat(s.fontSize), fw = parseInt(s.fontWeight) || 400;
    const min = (fs >= 24 || (fs >= 18.66 && fw >= 700)) ? 3 : 4.5;
    const bg = resolvedBg(el);
    const entry = { text: text.slice(0, 40), color: s.color, fontSize: fs, min };
    if (!bg || hasImageBehind(el)) { overImage.push(entry); return; }
    const cr = ratio(fg, bg.color);
    if (cr < min) domFails.push({ ...entry, bg: getComputedStyle(bg.el).backgroundColor, ratio: +cr.toFixed(2) });
  });

  // Expose a helper to measure text-over-image worst-case contrast.
  // Requires the image to be CORS-readable (Unsplash etc. send ACAO:*).
  window.measureOverImage = async (selOrEl, opts = {}) => {
    const el = typeof selOrEl === 'string' ? document.querySelector(selOrEl) : selOrEl;
    // find the nearest ancestor that contains a background image
    let host = el; while (host && !host.querySelector(':scope > img')) host = host.parentElement;
    const img = host && host.querySelector(':scope > img');
    if (!img) return { error: 'no <img> ancestor found; pass the element that overlays an image' };
    const im = new Image(); im.crossOrigin = 'anonymous'; im.src = img.currentSrc || img.src; await im.decode();
    const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight;
    const ctx = cv.getContext('2d'); ctx.drawImage(im, 0, 0);
    const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
    const hr = host.getBoundingClientRect();
    const scale = Math.max(hr.width / im.naturalWidth, hr.height / im.naturalHeight);
    const offX = (hr.width - im.naturalWidth * scale) / 2, offY = (hr.height - im.naturalHeight * scale) / 2;
    const fg = parse(getComputedStyle(el).color); const fgL = lum(fg);
    const scrimA = opts.scrimAlpha || 0; const plateA = opts.plateAlpha || 0; const dark = opts.darkRGB || 17;
    const tr = el.getBoundingClientRect();
    let worst = Infinity, worstL = 0;
    for (let yy = tr.top; yy <= tr.bottom; yy += 5) for (let xx = tr.left; xx <= tr.right; xx += 10) {
      const px = Math.round((xx - hr.left - offX) / scale), py = Math.round((yy - hr.top - offY) / scale);
      let r = dark, g = dark, b = dark;
      if (px >= 0 && py >= 0 && px < cv.width && py < cv.height) { const i = (py * cv.width + px) * 4; r = data[i]; g = data[i + 1]; b = data[i + 2]; }
      const a = scrimA + plateA - scrimA * plateA; // combined overlay alpha
      r = r * (1 - a) + dark * a; g = g * (1 - a) + dark * a; b = b * (1 - a) + dark * a;
      const L = lum({ r, g, b }); const cr = (Math.max(fgL, L) + 0.05) / (Math.min(fgL, L) + 0.05);
      if (cr < worst) { worst = cr; worstL = L; }
    }
    return { worstContrast: +worst.toFixed(2), worstBgLuminance: +worstL.toFixed(3) };
  };

  return { domFails, overImage };
})();
