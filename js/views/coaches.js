import * as S from '../store.js';
import { COACHES, SESSION_TYPES, coachById } from '../data.js';
import { icon, esc, fmt, toast, sheet, confirmSheet, cap } from '../ui.js';
import { upcomingBookings } from './home.js';

const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const wd = d => ((d.getDay() + 6) % 7) + 1; // 1 = lundi
const ds = d => S.dayStr(d);
const today0 = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
let filter = 'near', query = '', favOnly = false;

function slotsFor(u, coach, dateStr) {
  const now = new Date();
  return coach.slots.map(t => {
    const at = new Date(`${dateStr}T${t}:00`);
    const taken = u.bookings.some(b => b.date === dateStr && b.time === t);
    return { t, ok: at > now && !taken };
  });
}
function nextAvailable(u, coach) {
  const d = today0();
  for (let k = 0; k < 60; k++) {
    if (coach.days.includes(wd(d)) && slotsFor(u, coach, ds(d)).some(s => s.ok)) {
      const s = slotsFor(u, coach, ds(d)).find(x => x.ok);
      return { date: new Date(d), time: s.t };
    }
    d.setDate(d.getDate() + 1);
  }
  return null;
}
const nextLabel = n => {
  if (!n) return 'Complet';
  const diff = Math.round((n.date - today0()) / 864e5);
  const day = diff === 0 ? "Aujourd'hui" : diff === 1 ? 'Demain' : cap(new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(n.date));
  return `${day} · ${n.time}`;
};

function coachCard(u, c) {
  const fav = u.favorites.includes(c.id);
  return `<div class="card coach-card">
    <div class="top">
      <div class="coach-av" style="background:${c.color}">${c.initials}</div>
      <div class="grow"><p class="h3" style="font-size:19px">${esc(c.name)}</p><p class="small muted mt-8">${esc(c.specialty)}</p><p class="rating">★ ${c.rating.toFixed(1).replace('.', ',')} · ${String(c.km).replace('.', ',')} km</p></div>
      <button class="heart ${fav ? 'on' : ''}" data-fav="${c.id}" aria-label="${fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}" aria-pressed="${fav}">${icon('heart')}</button>
    </div>
    <div class="bottom"><div><p class="tiny muted">Prochaine dispo</p><p class="h3 mt-8">${nextLabel(nextAvailable(u, c))}</p></div><a class="btn sm" href="#/book/${c.id}">Réserver</a></div>
  </div>`;
}

export function list(root, { rerender }) {
  const u = S.me();
  const upcoming = upcomingBookings(u);
  root.innerHTML = `
    <h1 class="h1">Trouver un coach</h1>
    <p class="sub">Des pros pour t’aider à franchir un cap</p>
    <div class="search mt-16">${icon('search')}<input class="input" id="q" type="search" placeholder="Nom, salle ou spécialité…" value="${esc(query)}" aria-label="Rechercher un coach"></div>
    <div class="row mt-16" style="gap:8px">
      <div class="chips grow" style="margin-right:0;padding-right:0">
        <button class="chip ${filter === 'near' ? 'on' : ''}" data-f="near">À proximité</button>
        <button class="chip ${filter === 'bloc' ? 'on' : ''}" data-f="bloc">Bloc</button>
        <button class="chip ${filter === 'debutant' ? 'on' : ''}" data-f="debutant">Débutant</button>
        <button class="chip ${filter === 'top' ? 'on' : ''}" data-f="top">Mieux notés</button>
      </div>
      <button class="icon-btn soft ${favOnly ? 'on' : ''}" id="fav" aria-pressed="${favOnly}" aria-label="Afficher mes favoris" style="${favOnly ? 'background:var(--primary);color:var(--on-primary)' : ''}">${icon('heart', 'sm')}</button>
    </div>
    ${upcoming.length ? `<div class="section-head"><h2 class="h2">Mes réservations</h2></div>
      ${upcoming.map(b => { const c = coachById(b.coachId); const t = SESSION_TYPES.find(x => x.id === b.type); return `
        <div class="card tight booking">
          <div class="datebox"><b>${b.at.getDate()}</b><span>${fmt.monthShort(b.at)}</span></div>
          <div class="grow"><p class="h3 ellipsis">${esc(c.name)} · ${b.time}</p><p class="small muted ellipsis">${esc(t ? t.label : '')} · ${esc(c.gym)}</p><p class="small orange">${b.price === 0 ? 'Inclus Premium+' : `${b.price} € à régler sur place`}</p></div>
          <button class="link danger small" data-cancel="${b.id}">Annuler</button>
        </div>`; }).join('')}` : ''}
    <div class="section-head"><h2 class="h2" id="lt">Coachs recommandés</h2></div>
    <div id="list"></div>
    <div class="card soft mt-16 small" style="font-weight:600">${icon('heart', 'xs')} Suis tes coachs favoris pour les retrouver ici.</div>
  `;
  const renderList = () => {
    const q = query.trim().toLowerCase();
    let items = COACHES.filter(c => (!q || `${c.name} ${c.gym} ${c.specialty}`.toLowerCase().includes(q)) && (!favOnly || u.favorites.includes(c.id)));
    if (filter === 'bloc' || filter === 'debutant') items = items.filter(c => c.tags.includes(filter));
    items.sort(filter === 'top' ? (a, b) => b.rating - a.rating : (a, b) => a.km - b.km);
    root.querySelector('#lt').textContent = favOnly ? 'Mes coachs favoris' : 'Coachs recommandés';
    root.querySelector('#list').innerHTML = items.length ? items.map(c => coachCard(u, c)).join('<div style="height:12px"></div>') : `<div class="card empty">${icon(favOnly ? 'heart' : 'search')}<p class="h3">${favOnly ? 'Pas encore de favori' : 'Aucun coach trouvé'}</p><p class="small muted mt-8">${favOnly ? 'Touche le cœur d’un coach pour le suivre.' : 'Essaie un autre mot-clé.'}</p></div>`;
    root.querySelectorAll('[data-fav]').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.fav;
      const on = !u.favorites.includes(id);
      S.update(x => { x.favorites = on ? [...x.favorites, id] : x.favorites.filter(f => f !== id); });
      toast(on ? 'Ajouté à tes favoris ♥' : 'Retiré de tes favoris');
      renderList();
    }));
  };
  root.querySelector('#q').addEventListener('input', e => { query = e.target.value; renderList(); });
  root.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => {
    filter = b.dataset.f;
    root.querySelectorAll('[data-f]').forEach(x => x.classList.toggle('on', x === b));
    renderList();
  }));
  root.querySelector('#fav').addEventListener('click', () => { favOnly = !favOnly; rerender(); });
  root.querySelectorAll('[data-cancel]').forEach(b => b.addEventListener('click', async () => {
    const bk = upcoming.find(x => x.id === b.dataset.cancel);
    const late = bk.at - new Date() < 24 * 3600e3;
    const ok = await confirmSheet({ title: 'Annuler la réservation ?', text: late ? 'Le cours a lieu dans moins de 24 h : en conditions réelles, il pourrait être dû.' : 'Annulation sans frais (plus de 24 h avant le cours).', ok: 'Annuler le cours', cancel: 'Garder', danger: true });
    if (!ok) return;
    S.update(x => { x.bookings = x.bookings.filter(y => y.id !== bk.id); });
    toast('Réservation annulée');
    rerender();
  }));
  renderList();
}

export function book(root, { params, go }) {
  const u = S.me();
  const c = coachById(params.id);
  if (!c) { root.innerHTML = `<a class="back" href="#/coaches">${icon('chevL', 'sm')} Coachs</a><div class="card empty"><p class="h3">Coach introuvable</p></div>`; return; }
  const first = nextAvailable(u, c);
  let view = first ? new Date(first.date.getFullYear(), first.date.getMonth(), 1) : new Date(today0().getFullYear(), today0().getMonth(), 1);
  let sel = first ? ds(first.date) : null;
  let slot = first ? first.time : null;
  let type = 'solo';
  const limit = new Date(today0()); limit.setDate(limit.getDate() + 60);
  const isPlus = u.plan === 'premiumplus';
  const includedUsed = () => sel && u.bookings.some(b => b.price === 0 && b.date.slice(0, 7) === sel.slice(0, 7));

  const render = () => {
    const fav = u.favorites.includes(c.id);
    const y = view.getFullYear(), m = view.getMonth();
    const firstDow = (new Date(y, m, 1).getDay() + 6) % 7;
    const daysIn = new Date(y, m + 1, 0).getDate();
    const t0 = today0();
    let cells = DOW.map(d => `<span class="dow">${d}</span>`).join('') + '<span></span>'.repeat(firstDow);
    for (let d = 1; d <= daysIn; d++) {
      const date = new Date(y, m, d);
      const key = ds(date);
      const avail = date >= t0 && date <= limit && c.days.includes(wd(date)) && slotsFor(u, c, key).some(s => s.ok);
      cells += `<button data-d="${key}" class="${avail ? 'avail' : ''} ${key === sel ? 'sel' : ''}" ${avail ? '' : 'disabled'} aria-label="${fmt.weekday(date)}">${d}</button>`;
    }
    const canPrev = new Date(y, m, 1) > new Date(t0.getFullYear(), t0.getMonth(), 1);
    const canNext = new Date(y, m + 1, 1) <= limit;
    const slots = sel ? slotsFor(u, c, sel) : [];
    const t = SESSION_TYPES.find(x => x.id === type);
    const price = isPlus && !includedUsed() ? 0 : t.price;
    root.innerHTML = `
      <a class="back" href="#/coaches">${icon('chevL', 'sm')} Coachs</a>
      <h1 class="h1">Réserver une séance</h1>
      <p class="sub">Choisis le créneau qui te convient</p>
      <div class="card mt-16 coach-card" style="padding:14px 16px">
        <div class="top" style="align-items:center">
          <div class="coach-av sm" style="background:${c.color}">${c.initials}</div>
          <div class="grow"><p class="h3" style="font-size:18px">${esc(c.name)}</p><p class="small muted">${esc(c.title)} · ${esc(c.gym)}</p><p class="rating" style="margin-top:2px">★ ${c.rating.toFixed(1).replace('.', ',')} · ${c.reviews} avis</p></div>
          <button class="heart ${fav ? 'on' : ''}" id="fav" aria-label="Favori" style="margin:0">${icon('heart')}</button>
        </div>
        <p class="small muted mt-12">${esc(c.bio)}</p>
      </div>
      <div class="cal-head"><h2 class="h2">${fmt.month(view)}</h2><div class="row" style="gap:4px">
        <button class="icon-btn plain" id="prev" ${canPrev ? '' : 'disabled style="opacity:.3"'} aria-label="Mois précédent">${icon('chevL', 'sm')}</button>
        <button class="icon-btn plain" id="next" ${canNext ? '' : 'disabled style="opacity:.3"'} aria-label="Mois suivant">${icon('chev', 'sm')}</button></div></div>
      <div class="cal" id="cal">${cells}</div>
      ${sel ? `
        <h2 class="h3 mt-24" style="font-size:18px">${fmt.weekday(sel + 'T12:00:00')} · Créneaux libres</h2>
        <div class="slots mt-12">${slots.map(s => `<button class="slot ${s.t === slot ? 'on' : ''}" data-s="${s.t}" ${s.ok ? '' : 'disabled'}>${s.t}</button>`).join('')}</div>
      ` : `<p class="muted mt-24">Aucun créneau libre ce mois-ci, regarde le mois suivant.</p>`}
      <label class="field"><span>Type de séance</span><select class="select" id="type">${SESSION_TYPES.map(x => `<option value="${x.id}" ${x.id === type ? 'selected' : ''}>${x.label} · ${x.detail} · ${x.price} €${x.per || ''}</option>`).join('')}</select></label>
      ${isPlus ? `<p class="small orange mt-8">${includedUsed() ? 'Ton cours Premium+ du mois est déjà utilisé.' : '✓ Inclus dans ton abonnement Premium+ (1 cours / mois).'}</p>` : ''}
      <p class="tiny muted mt-16">Tu peux annuler sans frais jusqu’à 24 h avant. Paiement sur place — aucun paiement n’est demandé dans l’app.</p>
      <button class="btn block mt-16" id="confirm" ${sel && slot ? '' : 'disabled'}>Confirmer la réservation${sel && slot ? ` · ${fmt.euro(price)}` : ''}</button>
    `;
    root.querySelector('#fav').addEventListener('click', () => { S.update(x => { x.favorites = fav ? x.favorites.filter(f => f !== c.id) : [...x.favorites, c.id]; }); render(); });
    root.querySelector('#prev').addEventListener('click', () => { view = new Date(y, m - 1, 1); render(); });
    root.querySelector('#next').addEventListener('click', () => { view = new Date(y, m + 1, 1); render(); });
    root.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => {
      sel = b.dataset.d;
      const s = slotsFor(u, c, sel).find(x => x.ok);
      slot = s ? s.t : null;
      render();
    }));
    root.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => { slot = b.dataset.s; render(); }));
    root.querySelector('#type').addEventListener('change', e => { type = e.target.value; render(); });
    root.querySelector('#confirm').addEventListener('click', () => {
      if (!sel || !slot) return;
      const bk = { id: S.uid(), coachId: c.id, date: sel, time: slot, type, price, createdAt: new Date().toISOString() };
      S.update(x => x.bookings.push(bk));
      sheet({
        body: `<p class="confetti">✅</p><h2 class="h2 center mt-8">C’est réservé !</h2>
          <p class="muted center mt-8">${esc(c.name)} t’attend ${fmt.weekday(sel + 'T12:00:00').toLowerCase()} à ${slot}, ${esc(c.gym)}.</p>
          <p class="tiny faint center mt-8">Réservation de démonstration (bêta) — aucun paiement.</p>
          <button class="btn block mt-24" id="ok">Voir mes réservations</button>
          <button class="btn ghost block mt-12" id="cal">${icon('calendar', 'sm')} Ajouter au calendrier</button>`,
        onMount(el, close) {
          el.querySelector('#ok').addEventListener('click', close);
          el.querySelector('#cal').addEventListener('click', () => downloadICS(c, bk));
        },
        onClose() { if (location.hash.startsWith('#/book/')) go('coaches'); },
      });
    });
  };
  render();
}

function downloadICS(c, b) {
  const t = SESSION_TYPES.find(x => x.id === b.type);
  const start = new Date(`${b.date}T${b.time}:00`);
  const end = new Date(start.getTime() + (b.type === 'duo' ? 60 : b.type === 'remote' ? 20 : 45) * 60000);
  const f = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AI Bloc//FR', 'BEGIN:VEVENT', `UID:${b.id}@aibloc`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`, `SUMMARY:${t.label} avec ${c.name}`, `LOCATION:${c.gym}`, 'DESCRIPTION:Réservé avec AI Bloc', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'seance-ai-bloc.ics';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
