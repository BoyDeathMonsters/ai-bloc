// Routeur et coque de l'application
import { me } from './store.js';
import { icon, closeAllSheets } from './ui.js';
import * as auth from './views/auth.js';
import * as home from './views/home.js';
import * as capture from './views/capture.js';
import * as attempt from './views/attempt.js';
import * as exercises from './views/exercises.js';
import * as coaches from './views/coaches.js';
import * as profile from './views/profile.js';
import * as settings from './views/settings.js';

const ROUTES = [
  ['login', auth.login, { public: true }],
  ['register', auth.register, { public: true }],
  ['forgot', auth.forgot, { public: true }],
  ['home', home.home, { tab: 'home' }],
  ['history', home.history, { tab: 'home' }],
  ['capture', capture.capture, { full: true }],
  ['attempt/:id', attempt.attempt, { tab: 'home' }],
  ['exercises', exercises.list, { tab: 'exercises' }],
  ['exercise/:id', exercises.detail, { tab: 'exercises' }],
  ['coaches', coaches.list, { tab: 'coaches' }],
  ['book/:id', coaches.book, { tab: 'coaches' }],
  ['profile', profile.profile, { tab: 'profile' }],
  ['settings', settings.index, { tab: 'profile' }],
  ['settings/:section', settings.section, { tab: 'profile' }],
];

const view = document.getElementById('view');
const tabbar = document.getElementById('tabbar');
let cleanup = null;

export function go(path) {
  const target = '#/' + path.replace(/^#?\/?/, '');
  if (location.hash === target) render(); else location.hash = target;
}
export const rerender = () => render(true);

function match(path) {
  for (const [pattern, fn, opts] of ROUTES) {
    const a = pattern.split('/'), b = path.split('/');
    if (a.length !== b.length) continue;
    const params = {};
    if (a.every((seg, i) => (seg.startsWith(':') ? ((params[seg.slice(1)] = decodeURIComponent(b[i])), true) : seg === b[i]))) return { fn, opts, params };
  }
  return null;
}

function renderTabbar(active) {
  const t = (id, label, ic) => `<a class="tab ${active === id ? 'on' : ''}" href="#/${id}" ${active === id ? 'aria-current="page"' : ''}>${icon(ic)}<span>${label}</span></a>`;
  tabbar.innerHTML = `${t('home', 'Accueil', 'home')}${t('exercises', 'Exercices', 'book')}<a class="tab-fab" href="#/capture" aria-label="Analyser un bloc">${icon('camera')}</a>${t('coaches', 'Coachs', 'coach')}${t('profile', 'Profil', 'user')}`;
}

function render(keepScroll = false) {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  const query = Object.fromEntries(new URLSearchParams(qs || ''));
  const user = me();
  let m = match(path || '');
  if (!m) { location.replace(user ? '#/home' : '#/login'); return; }
  if (!m.opts.public && !user) { location.replace('#/login'); return; }
  if (m.opts.public && user) { location.replace('#/home'); return; }

  closeAllSheets();
  if (cleanup) { try { cleanup(); } catch (e) { console.warn(e); } cleanup = null; }
  const y = window.scrollY;
  view.className = 'view' + (m.opts.full ? ' full' : '') + (m.opts.tab ? '' : ' no-tab');
  if (m.opts.tab) { tabbar.hidden = false; renderTabbar(m.opts.tab); } else tabbar.hidden = true;
  try {
    cleanup = m.fn(view, { params: m.params, query, go, rerender }) || null;
  } catch (e) {
    console.error(e);
    view.innerHTML = `<div class="empty"><p class="h3">Oups, un souci d'affichage.</p><p class="muted mt-8">${String(e.message || e)}</p><a class="btn mt-24" href="#/home">Retour à l'accueil</a></div>`;
  }
  window.scrollTo(0, keepScroll ? y : 0);
}

window.addEventListener('hashchange', () => render());
render();
