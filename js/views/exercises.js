import * as S from '../store.js';
import { EXERCISES, CATEGORIES, exById, exerciseMinutes } from '../data.js';
import { icon, esc, artSVG, toast, sheet, plural } from '../ui.js';

const seedOf = id => [...id].reduce((s, c) => s + c.charCodeAt(0), 0);
let lastCat = 'Tout', lastQuery = '', lastGoal = null;

const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function list(root) {
  const u = S.me();
  const doneIds = new Set(u.done.map(d => d.id));
  const featured = EXERCISES.find(e => e.featured);

  root.innerHTML = `
    <h1 class="h1">Exercices</h1>
    <p class="sub">Des conseils de coach pour ta prochaine séance</p>
    <div class="search mt-16">${icon('search')}<input class="input" id="q" type="search" placeholder="Mouvement, niveau, coach…" value="${esc(lastQuery)}" aria-label="Rechercher un exercice"></div>
    <div class="chips mt-16" id="chips">${CATEGORIES.map(c => `<button class="chip ${c === lastCat ? 'on' : ''}" data-cat="${c}">${c}</button>`).join('')}</div>
    <div id="featured">
      <div class="section-head"><h2 class="h2">À la une</h2></div>
      <a class="feature click" href="#/exercise/${featured.id}" style="display:block">
        <div class="media">${artSVG(seedOf(featured.id), { ar: 2 })}<span class="pill">AVEC COACH</span><span class="play-over">${icon('play')}</span></div>
        <p class="h3 mt-16" style="font-size:19px">${esc(featured.title)}</p>
        <p class="small muted mt-8">Coach ${esc(featured.coach)} · ${exerciseMinutes(featured)} min · ${esc(featured.level)}</p>
      </a>
      <div class="section-head"><h2 class="h2">Choisis ton objectif</h2></div>
      <div class="grid2">
        <button class="card goal ${lastGoal === 'pousser' ? 'on' : ''}" data-goal="pousser"><p class="t">${icon('arrow', 'sm')}Mieux pousser</p><p class="small muted mt-8">Pieds + jambes</p></button>
        <button class="card goal ${lastGoal === 'equilibre' ? 'on' : ''}" data-goal="equilibre"><p class="t">${icon('target', 'sm')}Gagner en équilibre</p><p class="small muted mt-8">Placement</p></button>
      </div>
    </div>
    <div class="section-head"><h2 class="h2" id="listTitle">Vidéos populaires</h2><span class="small muted" id="listCount"></span></div>
    <div id="list"></div>
  `;

  const renderList = () => {
    const q = norm(lastQuery.trim());
    let items = EXERCISES.filter(e => (lastCat === 'Tout' || e.cat === lastCat) && (!lastGoal || e.goal === lastGoal));
    if (q) items = items.filter(e => norm(`${e.title} ${e.coach} ${e.cat} ${e.level} ${e.summary}`).includes(q));
    const filtering = q || lastCat !== 'Tout' || lastGoal;
    root.querySelector('#featured').style.display = q ? 'none' : '';
    root.querySelector('#listTitle').textContent = filtering ? 'Résultats' : 'Vidéos populaires';
    root.querySelector('#listCount').textContent = filtering ? plural(items.length, 'exercice', 'exercices') : '';
    root.querySelector('#list').innerHTML = items.length ? items.map(e => `
      <a class="card ex-row click" href="#/exercise/${e.id}">
        <div class="thumb">${artSVG(seedOf(e.id), { ar: 92 / 66, hs: 2.6 })}<span class="play-over sm">${icon('play')}</span></div>
        <div class="grow"><p class="h3">${esc(e.title)}</p><p class="small muted mt-8">Coach ${esc(e.coach)} · ${exerciseMinutes(e)} min</p>${doneIds.has(e.id) ? `<p class="tag-done mt-8">${icon('check', 'xs')} Déjà fait</p>` : ''}</div>
        ${icon('chev', 'chev sm')}
      </a>`).join('') : `<div class="card empty">${icon('search')}<p class="h3">Aucun exercice trouvé</p><p class="small muted mt-8">Essaie un autre mot-clé.</p></div>`;
  };

  root.querySelector('#q').addEventListener('input', e => { lastQuery = e.target.value; renderList(); });
  root.querySelectorAll('[data-cat]').forEach(b => b.addEventListener('click', () => {
    lastCat = b.dataset.cat;
    root.querySelectorAll('[data-cat]').forEach(x => x.classList.toggle('on', x === b));
    renderList();
  }));
  root.querySelectorAll('[data-goal]').forEach(b => b.addEventListener('click', () => {
    lastGoal = lastGoal === b.dataset.goal ? null : b.dataset.goal;
    root.querySelectorAll('[data-goal]').forEach(x => x.classList.toggle('on', x.dataset.goal === lastGoal));
    renderList();
    root.querySelector('#listTitle').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  renderList();
}

export function detail(root, { params }) {
  const ex = exById(params.id);
  if (!ex) { root.innerHTML = `<a class="back" href="#/exercises">${icon('chevL', 'sm')} Exercices</a><div class="card empty"><p class="h3">Exercice introuvable</p></div>`; return; }
  const u = S.me();
  const count = u.done.filter(d => d.id === ex.id).length;
  let i = -1, left = 0, running = false, tick = null, wakeLock = null;
  const total = ex.steps.reduce((s, x) => s + x[1], 0);

  root.innerHTML = `
    <a class="back" href="#/exercises">${icon('chevL', 'sm')} Exercices</a>
    <div class="feature">
      <div class="media" id="media">${artSVG(seedOf(ex.id), { ar: 2 })}<span class="pill">${esc(ex.cat.toUpperCase())}</span><button class="play-over" id="bigPlay" aria-label="Lancer la séance guidée">${icon('play')}</button></div>
      <h1 class="h2 mt-16">${esc(ex.title)}</h1>
      <p class="small muted mt-8">Coach ${esc(ex.coach)} · ${exerciseMinutes(ex)} min · ${esc(ex.level)}${count ? ` · fait ${count}×` : ''}</p>
    </div>
    <div id="player"></div>
    <p class="mt-24">${esc(ex.summary)}</p>
    <div class="card soft mt-16"><p class="eyebrow orange">Conseil de coach</p><p class="mt-8">${esc(ex.tip)}</p></div>
    <div class="section-head"><h2 class="h2">Déroulé</h2><span class="small muted">${plural(ex.steps.length, 'étape', 'étapes')}</span></div>
    <div class="card steps" id="steps">${ex.steps.map((s, k) => `
      <div class="step" data-k="${k}"><span class="num">${k + 1}</span><div class="grow"><p class="h3" style="font-size:15px">${esc(s[0])}</p>${s[2] ? `<p class="small muted">${esc(s[2])}</p>` : ''}</div><span class="small muted">${s[1] >= 60 ? `${Math.floor(s[1] / 60)} min${s[1] % 60 ? ` ${s[1] % 60}` : ''}` : `${s[1]} s`}</span></div>`).join('')}</div>
    <button class="btn block mt-24" id="start">${icon('play', 'sm')} Lancer la séance guidée</button>
    <button class="btn ghost block mt-12" id="markDone">${icon('check', 'sm')} Marquer comme fait</button>
    <p class="tiny faint center mt-16">Arrête-toi en cas de douleur. Ces exercices ne remplacent pas l’avis d’un professionnel de santé.</p>
  `;
  const player = root.querySelector('#player');
  const C = 2 * Math.PI * 96;

  const beep = () => { try { const a = new (window.AudioContext || window.webkitAudioContext)(); const o = a.createOscillator(); const g = a.createGain(); o.frequency.value = 880; g.gain.value = .08; o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + .15); setTimeout(() => a.close(), 300); } catch (e) { /* ignore */ } if (navigator.vibrate) navigator.vibrate(120); };

  function renderPlayer() {
    if (i < 0) { player.innerHTML = ''; return; }
    const st = ex.steps[i];
    const pct = left / st[1];
    const elapsed = ex.steps.slice(0, i).reduce((s, x) => s + x[1], 0) + (st[1] - left);
    player.innerHTML = `<div class="card mt-16 player">
      <p class="eyebrow orange">Étape ${i + 1} / ${ex.steps.length}</p>
      <p class="h2 mt-8">${esc(st[0])}</p>
      ${st[2] ? `<p class="small muted mt-8">${esc(st[2])}</p>` : ''}
      <div class="ring"><svg viewBox="0 0 220 220"><circle cx="110" cy="110" r="96" fill="none" stroke="var(--soft)" stroke-width="14"/><circle cx="110" cy="110" r="96" fill="none" stroke="var(--primary)" stroke-width="14" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${(C * (1 - pct)).toFixed(1)}"/></svg>
        <div class="t"><b>${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}</b><span class="small muted">${i + 1 < ex.steps.length ? `Ensuite : ${esc(ex.steps[i + 1][0])}` : 'Dernière étape'}</span></div></div>
      <div class="row" style="justify-content:center;gap:14px">
        <button class="icon-btn" id="pStop" aria-label="Arrêter">${icon('x')}</button>
        <button class="btn" id="pToggle" style="min-width:150px">${icon(running ? 'pause' : 'play', 'sm')} ${running ? 'Pause' : 'Reprendre'}</button>
        <button class="icon-btn" id="pSkip" aria-label="Étape suivante">${icon('skip', 'sm')}</button>
      </div>
      <p class="tiny faint mt-16">${Math.round(elapsed / total * 100)} % de la séance</p>
    </div>`;
    player.querySelector('#pToggle').addEventListener('click', () => { running = !running; renderPlayer(); });
    player.querySelector('#pSkip').addEventListener('click', next);
    player.querySelector('#pStop').addEventListener('click', stop);
    root.querySelectorAll('.step').forEach(s => { const k = +s.dataset.k; s.classList.toggle('cur', k === i); s.classList.toggle('past', k < i); });
  }
  function next() {
    i++;
    if (i >= ex.steps.length) { finish(); return; }
    left = ex.steps[i][1];
    renderPlayer();
  }
  async function start() {
    i = -1; running = true; next();
    clearInterval(tick);
    tick = setInterval(() => { if (!running) return; left--; if (left <= 0) { beep(); next(); } else renderPlayer(); }, 1000);
    player.scrollIntoView({ behavior: 'smooth', block: 'start' });
    try { if (navigator.wakeLock) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { /* ignore */ }
  }
  function stop() {
    clearInterval(tick); tick = null; i = -1; running = false; renderPlayer();
    root.querySelectorAll('.step').forEach(s => s.classList.remove('cur', 'past'));
    if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
  }
  function markDone() { S.update(x => x.done.push({ id: ex.id, date: new Date().toISOString() })); }
  function finish() {
    stop(); markDone();
    sheet({ body: `<p class="confetti">🎉</p><h2 class="h2 center mt-8">Séance terminée !</h2><p class="muted center mt-8">« ${esc(ex.title)} » est ajouté à ton historique.</p><a class="btn block mt-24" href="#/exercises" data-close>Voir d’autres exercices</a><button class="btn ghost block mt-12" data-close>Fermer</button>` });
  }
  root.querySelector('#start').addEventListener('click', start);
  root.querySelector('#bigPlay').addEventListener('click', start);
  root.querySelector('#markDone').addEventListener('click', () => { markDone(); toast('Exercice ajouté à ton historique ✓'); });
  return () => { clearInterval(tick); if (wakeLock) wakeLock.release().catch(() => {}); };
}
