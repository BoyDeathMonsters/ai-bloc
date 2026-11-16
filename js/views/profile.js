import * as S from '../store.js';
import { GRADES } from '../data.js';
import { icon, esc, fmt, grade, plural, avatarHTML, routeSVG } from '../ui.js';

function sinceLabel(u) {
  const [y, m] = (u.since || S.monthStr(new Date())).split('-').map(Number);
  const n = new Date();
  const months = (n.getFullYear() - y) * 12 + (n.getMonth() + 1 - m);
  if (months <= 0) return 'Grimpe depuis ce mois-ci';
  if (months < 12) return `Grimpe depuis ${months} mois`;
  const yrs = Math.floor(months / 12);
  return `Grimpe depuis ${plural(yrs, 'an', 'ans')}`;
}

function chart(u) {
  const pts = S.levelHistory(u, 6);
  const idxs = pts.map(p => p.idx).filter(i => i >= 0);
  let lo = Math.max(0, Math.min(...idxs) - 1), hi = Math.min(GRADES.length - 1, Math.max(...idxs) + 1);
  if (hi - lo < 4) hi = Math.min(GRADES.length - 1, lo + 4);
  const W = 320, H = 190, L = 34, R = 12, T = 14, B = 26;
  const x = i => L + (i * (W - L - R)) / (pts.length - 1);
  const y = v => T + ((hi - v) * (H - T - B)) / (hi - lo);
  const every = hi - lo > 7 ? 2 : 1;
  let grid = '';
  for (let v = lo; v <= hi; v++) {
    if ((v - lo) % every) continue;
    grid += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1"/><text x="2" y="${y(v) + 3.5}">${esc(grade(GRADES[v]))}</text>`;
  }
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.idx).toFixed(1)}`).join(' ');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution de ton niveau sur 6 mois">
    ${grid}
    <path d="${line}" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.idx)}" r="4.5" fill="var(--primary)"><title>${fmt.monthShort(p.month)} : ${esc(grade(GRADES[p.idx]))}</title></circle><text x="${x(i)}" y="${H - 6}" text-anchor="middle">${fmt.monthShort(p.month)}</text>`).join('')}
  </svg>`;
}

export function profile(root) {
  const u = S.me();
  const s = S.stats(u);
  const recent = [...u.attempts].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);
  const badges = S.badges(u);
  const plan = { free: 'Free', premium: 'Premium', premiumplus: 'Premium+' }[u.plan] || 'Free';
  root.innerHTML = `
    <div class="page-head"><h1 class="h1">Mon profil</h1>
      <a class="icon-btn plain" href="#/settings" aria-label="Paramètres">${icon('sun', 'lg')}</a></div>
    <div class="profile-head">
      ${avatarHTML(u, 'xl')}
      <div class="grow"><p class="h2" style="font-size:24px">${esc(u.name)}</p><p class="muted mt-8">${sinceLabel(u)}</p>
        <div class="row mt-12" style="gap:8px;flex-wrap:wrap"><span class="pill">Niveau ${esc(grade(s.level))}</span><a class="pill" href="#/settings/subscription" style="color:var(--muted)">${plan}</a></div></div>
    </div>
    <div class="card mt-24">
      <p class="eyebrow">Ton activité</p>
      <div class="grid2 mt-12" style="grid-template-columns:repeat(3,1fr);text-align:center">
        <div><b class="orange" style="font-size:28px;font-weight:800">${s.sessions}</b><p class="small muted">Séances</p></div>
        <div><b class="orange" style="font-size:28px;font-weight:800">${s.blocs}</b><p class="small muted">Blocs réussis</p></div>
        <div><b class="orange" style="font-size:28px;font-weight:800">${esc(grade(s.best))}</b><p class="small muted">Meilleur niveau</p></div>
      </div>
    </div>
    <div class="section-head"><h2 class="h2">Progression des niveaux</h2><span class="small muted" style="font-weight:700">6 mois</span></div>
    <div class="card">${chart(u)}${u.attempts.some(a => a.top) ? '' : '<p class="tiny faint center mt-8">Ta courbe se remplira avec tes blocs réussis.</p>'}</div>
    <div class="section-head"><h2 class="h2">Badges</h2><span class="small muted">${badges.filter(b => b.on).length}/${badges.length}</span></div>
    <div class="card"><div class="badges">${badges.map(b => `<div class="bdg ${b.on ? '' : 'off'}"><i>${icon(b.on ? 'sparkle' : 'lock', 'sm')}</i>${b.label}</div>`).join('')}</div></div>
    <div class="section-head"><h2 class="h2">Activité récente</h2>${recent.length ? '<a class="link" href="#/history">Tout voir</a>' : ''}</div>
    ${recent.length ? recent.map(a => `
      <a class="card tight click list-item" href="#/attempt/${a.id}">
        <div class="thumb sm">${routeSVG(a, { ar: 1, ring: false, hs: 3 })}</div>
        <div class="grow"><p class="h3 ellipsis">${esc(a.name)} · ${plural(a.tries, 'essai', 'essais')}</p><p class="small muted">${fmt.ago(a.date)} · ${esc(grade(a.grade))}${a.top ? ' · Top' : ''}</p></div>
        ${icon('chev', 'chev sm')}
      </a>`).join('') : `<div class="card empty">${icon('target')}<p class="h3">Pas encore d’activité</p><a class="btn sm mt-16" href="#/capture">${icon('camera', 'sm')} Analyser un bloc</a></div>`}
    <a class="btn ghost block mt-24" href="#/settings">${icon('gear', 'sm')} Paramètres</a>
  `;
}
