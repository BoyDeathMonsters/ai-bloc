import * as S from '../store.js';
import { coachById, exById, exerciseMinutes } from '../data.js';
import { icon, esc, fmt, grade, plural, avatarHTML, firstName, routeSVG, artSVG } from '../ui.js';
import { openAttemptSheet } from './attempt.js';

export function upcomingBookings(u) {
  const now = new Date();
  return u.bookings
    .map(b => ({ ...b, at: new Date(`${b.date}T${b.time}:00`) }))
    .filter(b => b.at > now)
    .sort((a, b) => a.at - b.at);
}

export function home(root) {
  const u = S.me();
  const s = S.stats(u);
  const proj = S.currentProject(u);
  const next = upcomingBookings(u)[0];
  const coach = next && coachById(next.coachId);
  const warm = exById('echauffement');
  const projAttempt = proj && u.attempts.find(a => a.id === proj.lastId);

  root.innerHTML = `
    <div class="hello">
      <div><h1 class="h1" style="font-size:28px">Salut, ${firstName(u)} 👋</h1><p class="sub">Envie de grimper aujourd'hui ?</p></div>
      <a href="#/profile" aria-label="Mon profil">${avatarHTML(u)}</a>
    </div>

    <section class="hero">
      <div class="copy">
        <p class="eyebrow orange">Ta prochaine séance</p>
        <h2>À toi de jouer.</h2>
        <p class="muted small mt-8">Filme un bloc et marque tes prises pour suivre ton mouvement.</p>
      </div>
      <div class="art">${projAttempt ? routeSVG(projAttempt, { ar: 3 / 4, hs: 2.4 }) : artSVG(3, { ar: 3 / 4, hs: 2.4 })}</div>
      <a class="btn" href="#/capture">${icon('camera')} Analyser un bloc</a>
    </section>

    ${next && coach ? `
    <a class="card click mt-16 booking" href="#/coaches">
      <div class="datebox"><b>${new Date(next.at).getDate()}</b><span>${fmt.monthShort(next.at)}</span></div>
      <div class="grow"><p class="eyebrow orange">Cours réservé</p><p class="h3 mt-8 ellipsis">${esc(coach.name)} · ${next.time}</p><p class="small muted">${esc(coach.gym)} · ${fmt.weekday(next.at)}</p></div>
      ${icon('chev', 'chev')}
    </a>` : ''}

    <div class="section-head"><h2 class="h2">Ta progression</h2><a class="link" href="#/history">Tout voir</a></div>
    <a class="card click" href="#/profile">
      <p class="eyebrow">Niveau actuel</p>
      <div class="stat-big"><b>${esc(grade(s.level))}</b><span class="h3">${s.gain ? `+${plural(s.gain, 'niveau', 'niveaux')} ce mois-ci` : s.monthAttempts ? `${plural(s.monthAttempts, 'bloc', 'blocs')} ce mois-ci` : 'Note ton premier bloc !'}</span></div>
      <div class="stats3">
        <div><span class="lbl">Blocs réussis</span><b>${s.blocs}</b></div>
        <div><span class="lbl">Séances</span><b>${s.sessions}</b></div>
        <div><span class="lbl">Meilleure série</span><b>${plural(s.streak, 'jour', 'jours')}</b></div>
      </div>
    </a>

    <div class="section-head"><h2 class="h2">Reprendre où tu en étais</h2></div>
    ${proj ? `
    <div class="card list-item">
      <a class="thumb" href="#/attempt/${proj.lastId}">${projAttempt ? routeSVG(projAttempt, { ar: 1, ring: false, hs: 2.6 }) : ''}</a>
      <a class="grow" href="#/attempt/${proj.lastId}">
        <p class="small muted">${proj.top ? 'Dernier bloc' : 'Projet du moment'}</p>
        <p class="h3 mt-8 ellipsis" style="font-size:18px">${esc(proj.name)}</p>
        <p class="small muted mt-8">${esc(grade(proj.grade))} · ${plural(proj.tries, 'essai', 'essais')} · ${fmt.agoShort(proj.last)}</p>
      </a>
      <a class="play-btn" href="#/capture?project=${encodeURIComponent(proj.name)}" aria-label="Nouvel essai">${icon('play')}</a>
    </div>` : `
    <div class="card empty">
      ${icon('target')}
      <p class="h3">Aucun bloc pour l'instant</p>
      <p class="muted small mt-8">Filme ton premier bloc ou note-le en quelques secondes.</p>
      <button class="btn sm mt-16" id="quickLog">${icon('plus', 'sm')} Noter un bloc</button>
    </div>`}

    <div class="section-head"><h2 class="h2">Pour ta prochaine séance</h2></div>
    <div class="grid2">
      <a class="card mini click" href="#/exercise/echauffement"><p class="h3"><span class="orange">${icon('bolt', 'xs')}</span>Échauffement</p><p class="small muted mt-8">${exerciseMinutes(warm)} min · mobilité</p></a>
      <a class="card mini click" href="#/exercises"><p class="h3">${icon('play', 'xs')}Voir un exercice</p><p class="small muted mt-8">Conseils de coach</p></a>
    </div>
  `;
  const q = root.querySelector('#quickLog');
  if (q) q.addEventListener('click', () => openAttemptSheet({}));
}

export function history(root) {
  const u = S.me();
  const list = [...u.attempts].sort((a, b) => (a.date < b.date ? 1 : -1));
  const groups = new Map();
  list.forEach(a => { const k = S.dayStr(new Date(a.date)); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(a); });
  root.innerHTML = `
    <a class="back" href="#/home">${icon('chevL', 'sm')} Accueil</a>
    <div class="page-head"><div><h1 class="h1">Mes blocs</h1><p class="sub">${plural(list.length, 'essai enregistré', 'essais enregistrés')}</p></div>
    <button class="icon-btn soft" id="add" aria-label="Noter un bloc">${icon('plus')}</button></div>
    ${list.length ? [...groups.entries()].map(([day, items]) => `
      <p class="eyebrow mt-24" style="margin-bottom:10px">${fmt.weekday(day + 'T12:00:00')}</p>
      ${items.map(a => `
        <a class="card tight click list-item" href="#/attempt/${a.id}">
          <div class="thumb sm">${routeSVG(a, { ar: 1, ring: false, hs: 3 })}</div>
          <div class="grow"><p class="h3 ellipsis">${esc(a.name)}</p><p class="small muted">${esc(grade(a.grade))} · ${plural(a.tries, 'essai', 'essais')}${a.hasVideo ? ' · vidéo' : ''}</p></div>
          ${a.top ? '<span class="pill">Top</span>' : '<span class="pill" style="color:var(--muted)">En cours</span>'}
        </a>`).join('')}
    `).join('') : `<div class="card empty mt-16">${icon('target')}<p class="h3">Rien pour l'instant</p><p class="muted small mt-8">Tes blocs filmés ou notés apparaîtront ici.</p></div>`}
    <div class="grid2 mt-24">
      <a class="btn" href="#/capture">${icon('camera', 'sm')} Filmer</a>
      <button class="btn ghost" id="add2">${icon('note', 'sm')} Noter</button>
    </div>
  `;
  root.querySelector('#add').addEventListener('click', () => openAttemptSheet({}));
  root.querySelector('#add2').addEventListener('click', () => openAttemptSheet({}));
}
