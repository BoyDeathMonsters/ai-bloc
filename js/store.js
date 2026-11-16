// Stockage local : comptes, données utilisateur, vidéos (IndexedDB)
import { GRADES, BLOC_NAMES, EXERCISES } from './data.js';

const KEY = 'aibloc:v1';
export const DEMO_EMAIL = 'demo@aibloc.app';

const DEFAULT_SETTINGS = { reminders: true, news: false, coachMsgs: true, privacy: 'private', aiConsent: false, feedback: 'simple', scale: 'fr' };

let state = read();
function read() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.users) return s;
  } catch (e) { /* stockage indisponible */ }
  return { users: {}, session: null };
}
export function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
  catch (e) { console.warn('Sauvegarde impossible', e); return false; }
}

export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-5);
const norm = e => String(e || '').trim().toLowerCase();
export const monthStr = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
export const dayStr = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

async function hash(pw, salt) {
  const data = new TextEncoder().encode(salt + ':' + pw);
  if (window.crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 2166136261;
  for (const b of data) { h ^= b; h = Math.imul(h, 16777619); }
  return 'f' + (h >>> 0).toString(16);
}

function newUser({ name, email, level }) {
  return {
    id: uid(), email: norm(email), name: String(name || '').trim(), level: level || '5a',
    since: monthStr(new Date()), avatar: null, plan: 'free', createdAt: new Date().toISOString(),
    settings: { ...DEFAULT_SETTINGS }, attempts: [], bookings: [], favorites: [], done: [],
  };
}

export async function register({ name, email, password, level }) {
  const e = norm(email);
  if (state.users[e]) throw new Error('Un compte existe déjà avec cet e-mail sur cet appareil.');
  const u = newUser({ name, email: e, level });
  u.salt = uid();
  u.pass = await hash(password, u.salt);
  state.users[e] = u;
  state.session = e;
  if (!persist()) throw new Error("Impossible d'enregistrer ton compte (stockage du navigateur désactivé ?).");
  return u;
}

export async function login(email, password) {
  const u = state.users[norm(email)];
  if (!u) throw new Error('Aucun compte avec cet e-mail sur cet appareil.');
  if (await hash(password, u.salt) !== u.pass) throw new Error('Mot de passe incorrect.');
  state.session = u.email;
  persist();
  return u;
}

export async function resetPassword(email, password) {
  const u = state.users[norm(email)];
  if (!u) throw new Error('Aucun compte avec cet e-mail sur cet appareil.');
  u.salt = uid();
  u.pass = await hash(password, u.salt);
  persist();
}

export function logout() { state.session = null; persist(); }
export function me() { return state.session ? state.users[state.session] || null : null; }
export function update(fn) {
  const u = me();
  if (!u) return false;
  fn(u);
  return persist();
}
export async function deleteAccount() {
  const u = me();
  if (!u) return;
  try { await media.clearPrefix(u.id + ':'); } catch (e) { /* ignore */ }
  delete state.users[u.email];
  state.session = null;
  persist();
}
export function exportData() {
  const u = me();
  if (!u) return null;
  const { pass, salt, ...rest } = u;
  return rest;
}

// ---------- Thème ----------
export function getTheme() { try { return localStorage.getItem('aibloc:theme') || 'auto'; } catch (e) { return 'auto'; } }
export function setTheme(t) {
  try { localStorage.setItem('aibloc:theme', t); } catch (e) { /* ignore */ }
  if (t === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
}

// ---------- Vidéos (IndexedDB) ----------
const DB = 'aibloc-media', ST = 'videos';
function openDB() {
  return new Promise((res, rej) => {
    if (!window.indexedDB) return rej(new Error('IndexedDB indisponible'));
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(ST);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function tx(mode, fn) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const t = db.transaction(ST, mode);
    const req = fn(t.objectStore(ST));
    t.oncomplete = () => res(req ? req.result : undefined);
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error);
  });
}
export const media = {
  put: (k, blob) => tx('readwrite', s => s.put(blob, k)),
  get: k => tx('readonly', s => s.get(k)),
  del: k => tx('readwrite', s => s.delete(k)),
  async clearPrefix(prefix) {
    const db = await openDB();
    return new Promise(res => {
      const t = db.transaction(ST, 'readwrite');
      const r = t.objectStore(ST).openCursor();
      r.onsuccess = () => { const c = r.result; if (c) { if (String(c.key).startsWith(prefix)) c.delete(); c.continue(); } };
      t.oncomplete = res; t.onerror = res;
    });
  },
};
export const videoKey = (u, attemptId) => `${u.id}:${attemptId}`;

// ---------- Compte démo ----------
function rng(seed) { let s = seed >>> 0; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) + 0x6D2B79F5 >>> 0) / 4294967296); }
export function genHolds(seed, n) {
  const r = rng(seed);
  const pts = [];
  let x = 0.25 + r() * 0.2;
  for (let i = 0; i < n; i++) {
    const y = 0.88 - (i / (n - 1)) * 0.74 + (r() - 0.5) * 0.05;
    x = Math.min(0.82, Math.max(0.18, x + (r() - 0.5) * 0.42));
    pts.push({ x: +x.toFixed(3), y: +y.toFixed(3) });
  }
  return pts;
}

export async function loginDemo() {
  if (!state.users[DEMO_EMAIL]) {
    const u = newUser({ name: 'Léa Moreau', email: DEMO_EMAIL, level: '5c' });
    u.salt = uid(); u.pass = await hash(uid() + uid(), u.salt);
    const now = new Date();
    const since = new Date(now.getFullYear(), now.getMonth() - 8, 1);
    u.since = monthStr(since);
    u.favorites = ['ines'];
    const plan = [[5, ['4b', '4c', '4c']], [4, ['5a', '4c', '5a']], [3, ['5a', '5b', '4c']], [2, ['5b', '5c', '5b']], [1, ['5c', '6a', '5c', '6a']]];
    const r = rng(42);
    let n = 0;
    const add = (date, name, grade, tries, top) => {
      n++;
      u.attempts.push({ id: uid(), date: date.toISOString(), name, grade, tries, top, holds: genHolds(n * 7 + 3, 5 + (n % 3)), aspect: [390, 560], thumb: null, hasVideo: false, notes: '' });
    };
    plan.forEach(([ago, grades]) => {
      grades.forEach((g, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - ago, 3 + i * 7 + Math.floor(r() * 3), 18, 30);
        add(d, BLOC_NAMES[1 + (n % (BLOC_NAMES.length - 1))], g, 1 + Math.floor(r() * 4), true);
      });
    });
    // série de 4 jours la semaine dernière + projet du moment
    const day = k => { const d = new Date(now); d.setDate(d.getDate() - k); d.setHours(18, 45, 0, 0); return d; };
    add(day(9), 'La dalle bleue', '6a', 2, true);
    add(day(8), 'Le toit jaune', '6a+', 4, true);
    add(day(7), 'Réglettes vertes', '6b', 6, true);
    add(day(6), 'La traversée rose', '6a', 1, true);
    add(day(5), 'Le surplomb orange', '6b+', 3, false);
    add(day(2), 'Le surplomb orange', '6b+', 2, false);
    u.done = [{ id: 'echauffement', date: day(2).toISOString() }, { id: 'pieds-dalle', date: day(5).toISOString() }, { id: 'echauffement', date: day(7).toISOString() }];
    state.users[DEMO_EMAIL] = u;
  }
  state.session = DEMO_EMAIL;
  persist();
}

// ---------- Statistiques ----------
export const gi = g => GRADES.indexOf(g);
const blocKey = a => a.name.trim().toLowerCase();

export function stats(u) {
  const list = [...u.attempts].sort((a, b) => (a.date < b.date ? -1 : 1));
  const days = [...new Set(list.map(a => dayStr(new Date(a.date))))].sort();
  let streak = 0, cur = 0, prev = null;
  days.forEach(d => { const t = Date.parse(d); cur = prev !== null && t - prev === 864e5 ? cur + 1 : 1; streak = Math.max(streak, cur); prev = t; });
  const topped = list.filter(a => a.top);
  const blocs = new Set(topped.map(blocKey)).size;
  const maxIdx = arr => arr.reduce((m, a) => Math.max(m, gi(a.grade)), -1);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const declared = gi(u.level);
  const bestTop = maxIdx(topped);
  const recent = topped.filter(a => now - new Date(a.date) < 60 * 864e5);
  const current = Math.max(maxIdx(recent), declared);
  const before = Math.max(maxIdx(topped.filter(a => new Date(a.date).getTime() < monthStart)), declared);
  const thisMonth = maxIdx(topped.filter(a => new Date(a.date).getTime() >= monthStart));
  return {
    sessions: days.length, blocs, streak,
    level: GRADES[current] || u.level, best: GRADES[Math.max(bestTop, declared)] || u.level,
    bestTop, gain: thisMonth > before ? thisMonth - before : 0,
    monthAttempts: list.filter(a => new Date(a.date).getTime() >= monthStart).length,
  };
}

export function projects(u) {
  const map = new Map();
  [...u.attempts].sort((a, b) => (a.date < b.date ? -1 : 1)).forEach(a => {
    const k = blocKey(a);
    const p = map.get(k) || { name: a.name, tries: 0, top: false, count: 0 };
    p.tries += a.tries; p.top = p.top || a.top; p.count++;
    p.grade = a.grade; p.last = a.date; p.lastId = a.id; p.name = a.name;
    map.set(k, p);
  });
  return [...map.values()].sort((a, b) => (a.last < b.last ? 1 : -1));
}
export function currentProject(u) {
  const p = projects(u);
  return p.find(x => !x.top) || p[0] || null;
}

export function levelHistory(u, months = 6) {
  const now = new Date();
  const topped = u.attempts.filter(a => a.top);
  const out = [];
  let carry = -1;
  const startFirst = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  topped.forEach(a => { if (new Date(a.date) < startFirst) carry = Math.max(carry, gi(a.grade)); });
  for (let i = months - 1; i >= 0; i--) {
    const s = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const e = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const inMonth = topped.filter(a => { const d = new Date(a.date); return d >= s && d < e; });
    const m = inMonth.reduce((mx, a) => Math.max(mx, gi(a.grade)), -1);
    if (m >= 0) carry = Math.max(carry, m);
    out.push({ month: s, idx: m >= 0 ? m : carry });
  }
  const declared = gi(u.level);
  return out.map(p => ({ ...p, idx: p.idx >= 0 ? p.idx : declared }));
}

export function badges(u) {
  const s = stats(u);
  const projDone = projects(u).some(p => p.top && p.tries >= 5);
  return [
    { label: '1er bloc', on: s.blocs >= 1 },
    { label: '1er 6a', on: s.bestTop >= gi('6a') },
    { label: '1er 6b', on: s.bestTop >= gi('6b') },
    { label: '10 séances', on: s.sessions >= 10 },
    { label: 'Projet fini', on: projDone },
    { label: 'Série 3 jours', on: s.streak >= 3 },
    { label: '1er coach', on: u.bookings.length >= 1 },
    { label: '5 exercices', on: u.done.length >= 5 },
  ];
}

export const exercisesTotal = EXERCISES.length;
