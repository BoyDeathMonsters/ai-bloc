// Helpers d'interface : icônes, sheets, toasts, dates, illustrations
import { me } from './store.js';
import { toV } from './data.js';

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const P = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/>',
  book: '<path d="M2.5 5.5C5 4 8.5 4 12 6c3.5-2 7-2 9.5-.5V19c-2.5-1.5-6-1.5-9.5.5-3.5-2-7-2-9.5-.5z"/><path d="M12 6v13.5"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  coach: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14.3c2 .8 3.5 2.8 3.5 5.7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  heart: '<path d="M12 20s-7-4.4-9-8.6C1.6 8.3 3.6 5 7 5c2 0 3.3 1 5 3 1.7-2 3-3 5-3 3.4 0 5.4 3.3 4 6.4-2 4.2-9 8.6-9 8.6z"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  chevL: '<path d="m15 6-6 6 6 6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M2.5 12h3M18.5 12h3M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  arrow: '<path d="M7 17 17 7M8 7h9v9"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.5v.7"/><path d="M12 17h.01"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  download: '<path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 16V5m-5 5 5-5 5 5M5 20h14"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  skip: '<path d="M6 5l10 7-10 7zM18 5v14"/>',
  bell: '<path d="M6 16v-5a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  sparkle: '<path d="M12 3c.6 4.4 2.6 6.4 7 7-4.4.6-6.4 2.6-7 7-.6-4.4-2.6-6.4-7-7 4.4-.6 6.4-2.6 7-7z"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  note: '<path d="M5 4h14v16H5z"/><path d="M9 9h6M9 13h6M9 17h3"/>',
  flame: '<path d="M12 21c-4 0-7-2.7-7-6.5 0-3 2-5 3.5-6.5.3 2 1.3 3 2.5 3.5C11 8 12 5 14.5 3c.3 3 4.5 5.5 4.5 11 0 4-3 7-7 7z"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
  share: '<path d="M12 15V3m-4 4 4-4 4 4"/><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/>',
  apple: '<path d="M16.5 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.9-3-.8C7 7.4 5.6 8.3 4.8 9.7c-1.6 2.8-.4 6.9 1.2 9.1.8 1.1 1.7 2.3 2.8 2.3s1.6-.7 3-.7 1.8.7 3 .7 2-1.1 2.8-2.2c.9-1.3 1.2-2.5 1.2-2.6 0 0-2.3-.9-2.3-3.7zM14.3 5.8c.6-.8 1-1.8.9-2.8-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.7-.9 2.7 1 .1 2-.5 2.6-1.3z"/>',
  google: '<path d="M21 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.1a4.4 4.4 0 0 1-1.9 2.9v2.4h3c1.8-1.6 2.8-4 2.8-7z"/><path d="M12 21.5c2.6 0 4.7-.9 6.2-2.3l-3-2.4c-.8.6-1.9.9-3.2.9-2.5 0-4.6-1.7-5.3-3.9H3.6v2.4a9.4 9.4 0 0 0 8.4 5.3z"/><path d="M6.7 13.8a5.6 5.6 0 0 1 0-3.6V7.8H3.6a9.4 9.4 0 0 0 0 8.4z"/><path d="M12 6.3c1.4 0 2.6.5 3.6 1.4l2.7-2.7A9.1 9.1 0 0 0 12 2.5a9.4 9.4 0 0 0-8.4 5.3l3.1 2.4C7.4 8 9.5 6.3 12 6.3z"/>',
};
const FILLED = new Set(['play', 'star', 'sparkle', 'apple', 'google']);
export const icon = (name, cls = '') => `<svg class="ic ${FILLED.has(name) ? 'fill' : ''} ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[name] || ''}</svg>`;

export const LOGO = `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 44c2.5-10 8.5-18 15.5-19.5 3-5.5 10-7.3 14.5-3.3-3.3 7-4.2 14.5-7.3 22.3-6.4-3.9-14.5-4.5-22.7.5z" fill="none" stroke="#1F1A17" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/><path d="M29.5 24.5c-.8 5.6-.3 11.2 2 16.2" fill="none" stroke="#1F1A17" stroke-width="3.2" stroke-linecap="round"/></svg>`;

// ---------- Toast ----------
let toastEl, toastTimer;
export function toast(msg, ms = 2600) {
  if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
  toastEl.textContent = msg;
  requestAnimationFrame(() => toastEl.classList.add('in'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('in'), ms);
}

// ---------- Sheet ----------
const openSheets = new Set();
export function sheet({ title = '', body = '', onMount, onClose }) {
  const layers = document.getElementById('layers');
  const scrim = document.createElement('div');
  scrim.className = 'scrim';
  const el = document.createElement('div');
  el.className = 'sheet';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.innerHTML = `<div class="grab"></div>${title ? `<div class="sheet-title"><h2 class="h2">${title}</h2><button class="icon-btn plain" data-close aria-label="Fermer">${icon('x')}</button></div>` : ''}<div class="sheet-body">${body}</div>`;
  layers.append(scrim, el);
  requestAnimationFrame(() => { scrim.classList.add('in'); el.classList.add('in'); });
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    openSheets.delete(close);
    scrim.classList.remove('in'); el.classList.remove('in');
    setTimeout(() => { scrim.remove(); el.remove(); }, 260);
    onClose && onClose();
  };
  scrim.addEventListener('click', close);
  el.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
  openSheets.add(close);
  onMount && onMount(el, close);
  return close;
}
export function closeAllSheets() { [...openSheets].forEach(c => c()); }

export function confirmSheet({ title, text = '', ok = 'Confirmer', cancel = 'Annuler', danger = false }) {
  return new Promise(resolve => {
    let answered = false;
    sheet({
      title,
      body: `<p class="muted">${text}</p><button class="btn block ${danger ? 'danger' : ''} mt-24" data-ok>${ok}</button><button class="btn block ghost mt-12" data-close>${cancel}</button>`,
      onMount(el, close) { el.querySelector('[data-ok]').addEventListener('click', () => { answered = true; resolve(true); close(); }); },
      onClose() { if (!answered) resolve(false); },
    });
  });
}

// ---------- Format ----------
const dfDay = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' });
const dfWeekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const dfShort = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
const dfMonth = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
const dfMonthShort = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
export const fmt = {
  day: d => dfDay.format(new Date(d)),
  weekday: d => cap(dfWeekday.format(new Date(d))),
  short: d => dfShort.format(new Date(d)),
  month: d => cap(dfMonth.format(new Date(d))),
  monthShort: d => dfMonthShort.format(new Date(d)).replace('.', '').toUpperCase(),
  ago(d) {
    const a = new Date(d); const n = new Date();
    const diff = Math.round((new Date(n.getFullYear(), n.getMonth(), n.getDate()) - new Date(a.getFullYear(), a.getMonth(), a.getDate())) / 864e5);
    if (diff <= 0) return "Aujourd'hui";
    if (diff === 1) return 'Hier';
    if (diff < 30) return `Il y a ${diff} jours`;
    return 'Le ' + dfDay.format(a);
  },
  agoShort(d) {
    const a = new Date(d); const n = new Date();
    const diff = Math.round((new Date(n.getFullYear(), n.getMonth(), n.getDate()) - new Date(a.getFullYear(), a.getMonth(), a.getDate())) / 864e5);
    return diff <= 0 ? "aujourd'hui" : diff === 1 ? 'hier' : `${diff} jours`;
  },
  euro: n => (n === 0 ? 'Inclus' : `${n} €`),
};
export const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
export const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;
export function grade(g) {
  const u = me();
  return u && u.settings && u.settings.scale === 'v' ? toV(g) : g;
}
export const initials = name => String(name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
export function avatarHTML(u, cls = '') {
  return `<div class="avatar ${cls}">${u.avatar ? `<img src="${u.avatar}" alt="">` : esc(initials(u.name).slice(0, cls === 'xl' ? 2 : 1))}</div>`;
}
export const firstName = u => esc(String(u.name || '').split(/\s+/)[0] || 'grimpeur');

// ---------- Illustrations de bloc ----------
export const HOLD_COLORS = ['#F47B20', '#F2856D', '#6ACFC7', '#F2C94C', '#6BB3F0'];

export function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

function fitBox(holds, W, H, ar) {
  if (!holds.length) {
    let w = W, h = W / ar;
    if (h > H) { h = H; w = H * ar; }
    return [(W - w) / 2, (H - h) / 2, w, h];
  }
  const xs = holds.map(p => p.x * W), ys = holds.map(p => p.y * H);
  const pad = 30 + 0.06 * Math.max(W, H);
  let x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
  let w = x1 - x0, h = y1 - y0;
  if (w / h < ar) { const nw = h * ar; x0 -= (nw - w) / 2; w = nw; } else { const nh = w / ar; y0 -= (nh - h) / 2; h = nh; }
  if (w <= W) x0 = Math.min(Math.max(x0, 0), W - w);
  if (h <= H) y0 = Math.min(Math.max(y0, 0), H - h);
  return [x0, y0, w, h];
}

// Dessin d'une voie : mur (ou photo), trajet, prises.
export function routeSVG(a, { ar = 4 / 3, ring = true, hs = 1.2 } = {}) {
  const [W, H] = a.aspect || [390, 560];
  const holds = a.holds || [];
  const [bx, by, bw, bh] = fitBox(holds, W, H, ar);
  const k = (bw / 320) * hs;
  const step = W / 4;
  let grid = '';
  for (let x = step; x < W; x += step) grid += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
  for (let y = step; y < H; y += step) grid += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
  const pts = holds.map(p => [p.x * W, p.y * H]);
  const ellipses = pts.map((p, i) => `<ellipse cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" rx="${(13 * k).toFixed(1)}" ry="${(9.5 * k).toFixed(1)}" fill="${HOLD_COLORS[i % HOLD_COLORS.length]}" transform="rotate(-18 ${p[0].toFixed(1)} ${p[1].toFixed(1)})"/>`).join('');
  const mid = pts[Math.floor((pts.length - 1) / 2)];
  return `<svg viewBox="${bx.toFixed(1)} ${by.toFixed(1)} ${bw.toFixed(1)} ${bh.toFixed(1)}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect x="${Math.min(bx, 0) - 10}" y="${Math.min(by, 0) - 10}" width="${Math.max(bw, W) + 20 + Math.abs(Math.min(bx, 0))}" height="${Math.max(bh, H) + 20 + Math.abs(Math.min(by, 0))}" fill="var(--wall)"/>
    ${a.thumb ? `<image href="${a.thumb}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>` : `<g stroke="var(--wall-line)" stroke-width="${(2.5 * k).toFixed(1)}">${grid}</g>`}
    ${pts.length > 1 ? `<path d="${smoothPath(pts)}" fill="none" stroke="#F47B20" stroke-width="${(3 * k).toFixed(1)}" stroke-linecap="round"/>` : ''}
    ${ellipses}
    ${ring && mid && pts.length > 2 ? `<circle cx="${mid[0].toFixed(1)}" cy="${mid[1].toFixed(1)}" r="${(20 * k).toFixed(1)}" fill="none" stroke="#F47B20" stroke-width="${(2.5 * k).toFixed(1)}"/>` : ''}
  </svg>`;
}

// Illustration générique (exercices, accueil)
export function artSVG(seed = 1, { ar = 4 / 3, n = 5, hs = 1.4 } = {}) {
  let s = seed * 9301 + 49297;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const W = 320, H = W / ar;
  const holds = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    holds.push({ x: (0.2 + t * 0.6 + (r() - 0.5) * 0.12), y: (0.82 - t * 0.64 + (r() - 0.5) * 0.12) });
  }
  return routeSVG({ aspect: [W, H], holds }, { ar, hs, ring: false });
}
