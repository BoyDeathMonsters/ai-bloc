import * as S from '../store.js';
import { GRADES } from '../data.js';
import { icon, esc, fmt, grade, plural, routeSVG, sheet, toast, confirmSheet } from '../ui.js';

// Feuille d'enregistrement / modification d'un essai
export function openAttemptSheet({ holds = [], aspect = [390, 560], thumb = null, blob = null, project = '', existing = null, onSaved }) {
  const u = S.me();
  const names = S.projects(u).map(p => p.name);
  const lastOfProject = project && S.projects(u).find(p => p.name.toLowerCase() === project.toLowerCase());
  const g0 = existing ? existing.grade : lastOfProject ? lastOfProject.grade : u.level;
  let top = existing ? existing.top : false;
  let tries = existing ? existing.tries : 1;
  sheet({
    title: existing ? 'Modifier ton essai' : 'Enregistrer ton essai',
    body: `<form id="af" novalidate>
      ${blob ? `<p class="small muted">${icon('video', 'xs')} Vidéo prête · ${holds.length ? plural(holds.length, 'prise marquée', 'prises marquées') : 'aucune prise marquée'}</p>` : ''}
      <label class="field"><span>Nom du bloc</span><input class="input" id="an" list="anl" placeholder="Ex. Le surplomb orange" value="${esc(existing ? existing.name : project)}" maxlength="60" required><datalist id="anl">${names.map(n => `<option value="${esc(n)}">`).join('')}</datalist></label>
      <label class="field"><span>Niveau du bloc</span><select class="select" id="ag">${GRADES.slice(0, 20).map(g => `<option value="${g}" ${g === g0 ? 'selected' : ''}>${esc(grade(g))}${grade(g) !== g ? ` (${g})` : ''}</option>`).join('')}</select></label>
      <div class="field"><span>Résultat</span><div class="seg" id="atop"><button type="button" data-v="1" class="${top ? 'on' : ''}">Top ✓</button><button type="button" data-v="0" class="${top ? '' : 'on'}">Pas encore</button></div></div>
      <div class="field"><span>Nombre d'essais</span><div class="stepper"><button type="button" data-d="-1" aria-label="Moins">−</button><output id="at">${tries}</output><button type="button" data-d="1" aria-label="Plus">+</button></div></div>
      <p class="form-error" id="aerr"></p>
      <button class="btn block mt-12" type="submit">${existing ? 'Enregistrer les modifications' : 'Enregistrer'}</button>
    </form>`,
    onMount(el, close) {
      el.querySelectorAll('#atop button').forEach(b => b.addEventListener('click', () => {
        top = b.dataset.v === '1';
        el.querySelectorAll('#atop button').forEach(x => x.classList.toggle('on', x === b));
      }));
      el.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => {
        tries = Math.min(99, Math.max(1, tries + Number(b.dataset.d)));
        el.querySelector('#at').textContent = tries;
      }));
      el.querySelector('#af').addEventListener('submit', async e => {
        e.preventDefault();
        const name = el.querySelector('#an').value.trim();
        if (!name) { el.querySelector('#aerr').textContent = 'Donne un nom à ton bloc.'; return; }
        const g = el.querySelector('#ag').value;
        if (existing) {
          S.update(x => { const a = x.attempts.find(y => y.id === existing.id); if (a) Object.assign(a, { name, grade: g, top, tries }); });
          close(); toast('Essai modifié'); onSaved && onSaved(existing.id); return;
        }
        const a = { id: S.uid(), date: new Date().toISOString(), name, grade: g, tries, top, holds, aspect, thumb, hasVideo: false, notes: '' };
        let ok = S.update(x => x.attempts.push(a));
        if (!ok && a.thumb) { a.thumb = null; ok = S.persist(); }
        if (!ok) { el.querySelector('#aerr').textContent = 'Stockage plein : supprime quelques vidéos dans Paramètres.'; return; }
        if (blob) {
          try {
            await S.media.put(S.videoKey(u, a.id), blob);
            S.update(() => { a.hasVideo = true; });
          } catch (err) { console.warn(err); toast('Vidéo trop lourde pour être gardée — essai enregistré sans vidéo.', 3500); }
        }
        close();
        toast(top ? 'Bravo pour le top ! 🎉' : 'Essai enregistré 💪');
        if (onSaved) onSaved(a.id); else location.hash = '#/attempt/' + a.id;
      });
    },
  });
}

export async function playVideo(u, a) {
  let blob;
  try { blob = await S.media.get(S.videoKey(u, a.id)); } catch (e) { blob = null; }
  if (!blob) { toast('Vidéo introuvable sur cet appareil.'); return; }
  const url = URL.createObjectURL(blob);
  sheet({
    title: esc(a.name),
    body: `<video src="${url}" controls playsinline autoplay></video><a class="btn ghost block mt-12" href="${url}" download="ai-bloc-${a.id}.${blob.type.includes('mp4') ? 'mp4' : 'webm'}">${icon('download', 'sm')} Télécharger la vidéo</a>`,
    onClose: () => setTimeout(() => URL.revokeObjectURL(url), 1000),
  });
}

export function attempt(root, { params, rerender }) {
  const u = S.me();
  const a = u.attempts.find(x => x.id === params.id);
  if (!a) { root.innerHTML = `<a class="back" href="#/home">${icon('chevL', 'sm')} Accueil</a><div class="card empty">${icon('target')}<p class="h3">Essai introuvable</p></div>`; return; }
  const sameBloc = u.attempts.filter(x => x.name.trim().toLowerCase() === a.name.trim().toLowerCase()).sort((x, y) => (x.date < y.date ? -1 : 1));
  const idx = sameBloc.findIndex(x => x.id === a.id) + 1;
  const totalTries = sameBloc.slice(0, idx).reduce((s, x) => s + x.tries, 0);

  root.innerHTML = `
    <a class="back" href="#/history">${icon('chevL', 'sm')} Mes blocs</a>
    <div class="page-head"><div class="grow"><h1 class="h1">Analyse de ton bloc</h1><p class="sub">${esc(a.name)} · ${fmt.day(a.date)}</p></div>
      <button class="icon-btn" id="edit" aria-label="Modifier">${icon('edit', 'sm')}</button></div>
    <div class="route-card"><div class="route-frame">${routeSVG(a, { ar: 4 / 3 })}<span class="pill">SÉANCE ${String(idx).padStart(2, '0')}</span></div></div>

    <div class="section-head"><h2 class="h2">Ton essai en bref</h2></div>
    <div class="card"><div class="stats3" style="margin-top:0">
      <div><span class="lbl">Bloc</span><b class="orange" style="font-size:28px">${esc(grade(a.grade))}</b></div>
      <div><span class="lbl">Réussite</span><b style="font-size:24px">${a.top ? 'Top' : 'En cours'}</b></div>
      <div><span class="lbl">Essais</span><b style="font-size:24px">${totalTries}</b></div>
    </div></div>

    <div class="section-head"><h2 class="h2">Pistes d'observation</h2>${a.hasVideo ? '<button class="link" id="vid">Voir la vidéo</button>' : ''}</div>
    <div class="card ai-card">
      <div class="row">${icon('sparkle')}<p class="h3">Analyse IA en préparation</p></div>
      <p class="small muted mt-8">Bientôt, AI Bloc détectera les prises et lira ton squelette pour te proposer des pistes validées par des coachs (placement des hanches, bras tendus, pieds…). Ton essai ${a.hasVideo ? 'et ta vidéo sont gardés' : 'est gardé'} pour être analysé dès que la fonction sera disponible.</p>
    </div>
    <div class="card mt-12">
      <div class="row"><span class="num">${icon('note', 'xs')}</span><p class="h3">Mes notes</p></div>
      <textarea class="textarea mt-12" id="notes" placeholder="Ce qui a marché, ce qui bloque, la méthode…" maxlength="1000">${esc(a.notes || '')}</textarea>
      <p class="tiny faint mt-8" id="saved">&nbsp;</p>
    </div>

    <a class="btn block mt-24" href="#/coaches">Comparer avec un coach</a>
    <div class="grid2 mt-12">
      <a class="btn ghost" href="#/capture?project=${encodeURIComponent(a.name)}">${icon('camera', 'sm')} Nouvel essai</a>
      <button class="btn ghost" id="del" style="color:var(--danger)">${icon('trash', 'sm')} Supprimer</button>
    </div>
  `;
  const v = root.querySelector('#vid');
  if (v) v.addEventListener('click', () => playVideo(u, a));
  root.querySelector('#edit').addEventListener('click', () => openAttemptSheet({ existing: a, onSaved: () => rerender() }));
  let t;
  root.querySelector('#notes').addEventListener('input', e => {
    clearTimeout(t);
    t = setTimeout(() => { S.update(() => { a.notes = e.target.value; }); root.querySelector('#saved').textContent = 'Notes enregistrées ✓'; }, 400);
  });
  root.querySelector('#del').addEventListener('click', async () => {
    if (!(await confirmSheet({ title: 'Supprimer cet essai ?', text: 'L’essai et sa vidéo seront supprimés de cet appareil.', ok: 'Supprimer', danger: true }))) return;
    S.update(x => { x.attempts = x.attempts.filter(y => y.id !== a.id); });
    try { await S.media.del(S.videoKey(u, a.id)); } catch (e) { /* ignore */ }
    toast('Essai supprimé');
    location.hash = '#/history';
  });
  const notesEl = root.querySelector('#notes');
  return () => { if (t) { clearTimeout(t); S.update(() => { a.notes = notesEl.value; }); } };
}
