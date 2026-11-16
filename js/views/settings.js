import * as S from '../store.js';
import { GRADES, PLANS } from '../data.js';
import { icon, esc, toast, confirmSheet, sheet, avatarHTML, grade } from '../ui.js';
import { showTerms } from './auth.js';

const ITEMS = [
  ['profile', 'user', 'Profil personnel', 'Nom, photo, niveau'],
  ['notifications', 'bell', 'Notifications', 'Rappels et nouveautés'],
  ['privacy', 'camera', 'Confidentialité des vidéos', 'Qui peut voir tes vidéos ?'],
  ['analysis', 'sun', 'Préférences d’analyse', 'Feedback et cotation'],
  ['appearance', 'moon', 'Apparence', 'Clair, sombre ou automatique'],
  ['subscription', 'book', 'Abonnement', 'Gérer mon offre'],
  ['help', 'heart', 'Aide et sécurité', 'Questions fréquentes, conditions'],
];

export function index(root, { go }) {
  const u = S.me();
  root.innerHTML = `
    <a class="back" href="#/profile">${icon('chevL', 'sm')} Profil</a>
    <h1 class="h1">Paramètres</h1>
    <p class="sub">Gère ton compte et tes préférences</p>
    <p class="eyebrow mt-24" style="margin-bottom:12px">Compte</p>
    ${ITEMS.map(([id, ic, t, s]) => `<a class="card set-item click" href="#/settings/${id}"><span class="set-ic">${icon(ic)}</span><span class="grow"><span class="h3" style="display:block">${t}</span><span class="small muted">${s}</span></span>${icon('chev', 'chev sm')}</a>`).join('')}
    <div class="card soft mt-24"><p class="h3">Ton espace grimpe</p><p class="small muted mt-8">Version bêta · AI Bloc · connecté en tant que ${esc(u.email)}</p></div>
    <button class="btn block mt-24" id="logout" style="background:transparent;color:var(--danger)">Se déconnecter</button>
  `;
  root.querySelector('#logout').addEventListener('click', async () => {
    if (!(await confirmSheet({ title: 'Se déconnecter ?', text: 'Tes données restent sur cet appareil, tu les retrouveras en te reconnectant.', ok: 'Se déconnecter' }))) return;
    S.logout();
    go('login');
  });
}

const head = (title, sub = '') => `<a class="back" href="#/settings">${icon('chevL', 'sm')} Paramètres</a><h1 class="h1">${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}`;
const toggleRow = (key, title, sub, on) => `<div class="set-row"><div class="grow"><p class="h3" style="font-size:15px">${title}</p><p class="small muted">${sub}</p></div><label class="toggle"><input type="checkbox" data-k="${key}" ${on ? 'checked' : ''} aria-label="${title}"><span></span></label></div>`;

function resizeImage(file, size = 256) {
  return new Promise((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const s = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Image illisible')); };
    img.src = url;
  });
}

export function section(root, { params, go, rerender }) {
  const u = S.me();
  const set = (k, v) => S.update(x => { x.settings[k] = v; });
  const sec = params.section;

  if (sec === 'profile') {
    root.innerHTML = `${head('Profil personnel')}
      <div class="row mt-24" style="gap:18px">${avatarHTML(u, 'xl')}<div class="stack" style="margin:0">
        <label class="btn sm soft" style="cursor:pointer">${icon('camera', 'sm')} Changer la photo<input type="file" accept="image/*" id="photo" hidden></label>
        ${u.avatar ? `<button class="link danger small" id="rmPhoto" style="display:block">Retirer la photo</button>` : ''}</div></div>
      <form id="pf" novalidate>
        <label class="field"><span>Prénom et nom</span><input class="input" id="name" value="${esc(u.name)}" maxlength="50" autocomplete="name"></label>
        <label class="field"><span>E-mail</span><input class="input" value="${esc(u.email)}" disabled></label>
        <label class="field"><span>Niveau déclaré</span><select class="select" id="level">${GRADES.slice(0, 20).map(g => `<option value="${g}" ${g === u.level ? 'selected' : ''}>${esc(grade(g))}${grade(g) !== g ? ` (${g})` : ''}</option>`).join('')}</select></label>
        <label class="field"><span>Je grimpe depuis</span><input class="input" type="month" id="since" value="${esc(u.since)}" max="${S.monthStr(new Date())}"></label>
        <p class="form-error" id="err"></p>
        <button class="btn block mt-12" type="submit">Enregistrer</button>
      </form>`;
    root.querySelector('#photo').addEventListener('change', async e => {
      const f = e.target.files[0];
      if (!f) return;
      try { const data = await resizeImage(f); if (!S.update(x => { x.avatar = data; })) throw new Error(); toast('Photo mise à jour'); rerender(); }
      catch (err) { toast('Impossible d’utiliser cette image.'); }
    });
    const rm = root.querySelector('#rmPhoto');
    if (rm) rm.addEventListener('click', () => { S.update(x => { x.avatar = null; }); rerender(); });
    root.querySelector('#pf').addEventListener('submit', e => {
      e.preventDefault();
      const name = root.querySelector('#name').value.trim();
      if (name.length < 2) { root.querySelector('#err').textContent = 'Indique ton prénom.'; return; }
      S.update(x => { x.name = name; x.level = root.querySelector('#level').value; x.since = root.querySelector('#since').value || x.since; });
      toast('Profil enregistré ✓');
      go('profile');
    });
    return;
  }

  if (sec === 'notifications') {
    const st = u.settings;
    const perm = 'Notification' in window ? Notification.permission : 'unsupported';
    root.innerHTML = `${head('Notifications', 'Choisis ce que tu veux recevoir.')}
      <div class="card mt-24">
        ${toggleRow('reminders', 'Rappels de séance', 'Un petit rappel les jours où tu grimpes d’habitude', st.reminders)}
        ${toggleRow('coachMsgs', 'Réservations coach', 'Confirmation et rappel 24 h avant ton cours', st.coachMsgs)}
        ${toggleRow('news', 'Nouveautés AI Bloc', 'Nouvelles fonctionnalités et exercices', st.news)}
      </div>
      ${perm === 'unsupported' ? '<p class="small muted mt-16">Sur iPhone, ajoute AI Bloc à l’écran d’accueil pour recevoir des notifications.</p>' : `<button class="btn ghost block mt-16" id="perm">${icon('bell', 'sm')} ${perm === 'granted' ? 'Envoyer une notification test' : 'Autoriser les notifications'}</button>`}`;
    root.querySelectorAll('[data-k]').forEach(i => i.addEventListener('change', () => { set(i.dataset.k, i.checked); toast('Préférence enregistrée'); }));
    const p = root.querySelector('#perm');
    if (p) p.addEventListener('click', async () => {
      try {
        const r = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
        if (r === 'granted') { new Notification('AI Bloc', { body: 'Les notifications sont activées. À toi de grimper !', icon: 'assets/icon-192.png' }); rerender(); }
        else toast('Notifications refusées dans le navigateur.');
      } catch (e) { toast('Notifications non disponibles ici.'); }
    });
    return;
  }

  if (sec === 'privacy') {
    const st = u.settings;
    const n = u.attempts.filter(a => a.hasVideo).length;
    const opt = (v, t, s) => `<label class="radio-card"><input type="radio" name="pv" value="${v}" ${st.privacy === v ? 'checked' : ''}><span class="grow"><span class="h3" style="display:block;font-size:15px">${t}</span><span class="small muted">${s}</span></span></label>`;
    root.innerHTML = `${head('Confidentialité des vidéos', 'Qui peut voir tes vidéos ?')}
      <div class="mt-24">${opt('private', 'Moi uniquement', 'Tes vidéos restent sur ton téléphone.')}${opt('coaches', 'Mes coachs', 'Partagées avec les coachs que tu réserves.')}${opt('community', 'Communauté AI Bloc', 'Visibles par les grimpeurs de ta salle.')}</div>
      <div class="card mt-16">${toggleRow('aiConsent', 'Aider à entraîner l’IA', 'Autoriser l’usage anonymisé de mes vidéos pour améliorer l’analyse (consentement révocable).', st.aiConsent)}</div>
      <p class="eyebrow mt-32" style="margin-bottom:12px">Mes données (RGPD)</p>
      <button class="btn ghost block" id="export">${icon('download', 'sm')} Exporter mes données</button>
      <button class="btn ghost block mt-12" id="wipe" ${n ? '' : 'disabled'}>${icon('trash', 'sm')} Supprimer mes ${n} vidéo${n > 1 ? 's' : ''}</button>
      <button class="btn block mt-12" id="del" style="background:transparent;color:var(--danger)">Supprimer mon compte</button>`;
    root.querySelectorAll('[name=pv]').forEach(r => r.addEventListener('change', () => { set('privacy', r.value); toast('Préférence enregistrée'); }));
    root.querySelectorAll('[data-k]').forEach(i => i.addEventListener('change', () => { set(i.dataset.k, i.checked); toast(i.checked ? 'Merci pour ton aide 🙏' : 'Consentement retiré'); }));
    root.querySelector('#export').addEventListener('click', () => {
      const url = URL.createObjectURL(new Blob([JSON.stringify(S.exportData(), null, 2)], { type: 'application/json' }));
      const a = document.createElement('a'); a.href = url; a.download = 'mes-donnees-ai-bloc.json';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
    });
    root.querySelector('#wipe').addEventListener('click', async () => {
      if (!(await confirmSheet({ title: 'Supprimer tes vidéos ?', text: 'Tes essais et tes prises sont conservés, seules les vidéos sont effacées de cet appareil.', ok: 'Supprimer les vidéos', danger: true }))) return;
      try { await S.media.clearPrefix(u.id + ':'); } catch (e) { /* ignore */ }
      S.update(x => x.attempts.forEach(a => { a.hasVideo = false; }));
      toast('Vidéos supprimées'); rerender();
    });
    root.querySelector('#del').addEventListener('click', async () => {
      if (!(await confirmSheet({ title: 'Supprimer ton compte ?', text: 'Ton compte, tes essais, tes vidéos et tes réservations seront définitivement effacés de cet appareil. Cette action est irréversible.', ok: 'Supprimer définitivement', danger: true }))) return;
      await S.deleteAccount();
      toast('Compte supprimé'); go('login');
    });
    return;
  }

  if (sec === 'analysis') {
    const st = u.settings;
    root.innerHTML = `${head('Préférences d’analyse', 'Comment veux-tu tes retours ?')}
      <div class="field"><span>Niveau de détail des conseils</span><div class="seg" id="fb"><button data-v="simple" class="${st.feedback === 'simple' ? 'on' : ''}">Simple</button><button data-v="detail" class="${st.feedback === 'detail' ? 'on' : ''}">Détaillé</button></div></div>
      <div class="field"><span>Système de cotation</span><div class="seg" id="sc"><button data-v="fr" class="${st.scale === 'fr' ? 'on' : ''}">Française (6a)</button><button data-v="v" class="${st.scale === 'v' ? 'on' : ''}">Américaine (V3)</button></div></div>
      <div class="card ai-card mt-24"><div class="row">${icon('sparkle')}<p class="h3">Analyse IA</p></div><p class="small muted mt-8">Ces préférences s’appliqueront aux conseils de l’IA dès sa sortie. La cotation est déjà utilisée partout dans l’app.</p></div>`;
    const seg = (id, key) => root.querySelectorAll(`#${id} button`).forEach(b => b.addEventListener('click', () => {
      set(key, b.dataset.v);
      root.querySelectorAll(`#${id} button`).forEach(x => x.classList.toggle('on', x === b));
      toast('Préférence enregistrée');
    }));
    seg('fb', 'feedback'); seg('sc', 'scale');
    return;
  }

  if (sec === 'appearance') {
    const cur = S.getTheme();
    const opt = (v, t) => `<label class="radio-card"><input type="radio" name="th" value="${v}" ${cur === v ? 'checked' : ''}><span class="h3 grow" style="font-size:15px">${t}</span></label>`;
    root.innerHTML = `${head('Apparence')}<div class="mt-24">${opt('auto', 'Automatique (comme le téléphone)')}${opt('light', 'Clair')}${opt('dark', 'Sombre')}</div>`;
    root.querySelectorAll('[name=th]').forEach(r => r.addEventListener('change', () => S.setTheme(r.value)));
    return;
  }

  if (sec === 'subscription') {
    const s = S.stats(u);
    root.innerHTML = `${head('Abonnement', 'Un modèle freemium en trois formules.')}
      <div class="mt-24">${PLANS.map(p => `
        <div class="plan ${p.id === 'premium' && u.plan !== 'premium' ? '' : ''} ${u.plan === p.id ? 'cur' : ''}">
          ${u.plan === p.id ? '<span class="pill tagcur">Ton offre</span>' : p.id === 'premium' ? '<span class="badge-new tagcur">Populaire</span>' : ''}
          <p class="h3">${p.name}</p>
          <p class="price">${p.price}<span class="small muted" style="font-weight:600">${p.per}</span></p>
          <ul>${p.perks.map(k => `<li><span class="orange">${icon('check', 'xs')}</span>${k}</li>`).join('')}</ul>
          ${u.plan === p.id ? '' : `<button class="btn sm block mt-16 ${p.id === 'free' ? 'ghost' : ''}" data-plan="${p.id}">${p.id === 'free' ? 'Revenir à Free' : `Passer à ${p.name}`}</button>`}
        </div>`).join('')}</div>
      ${u.plan === 'free' ? `<p class="small muted mt-16">Ce mois-ci : ${s.monthAttempts} essai${s.monthAttempts > 1 ? 's' : ''} enregistré${s.monthAttempts > 1 ? 's' : ''}.</p>` : ''}
      <p class="tiny faint mt-16">Bêta : aucun paiement n’est demandé, tu peux tester chaque formule librement.</p>`;
    root.querySelectorAll('[data-plan]').forEach(b => b.addEventListener('click', async () => {
      const p = PLANS.find(x => x.id === b.dataset.plan);
      const ok = await confirmSheet({ title: p.id === 'free' ? 'Revenir à Free ?' : `Passer à ${p.name} ?`, text: p.id === 'free' ? 'Tu gardes toutes tes données.' : `${p.price}${p.per} — en version bêta, l’abonnement est gratuit et sans engagement.`, ok: 'Confirmer' });
      if (!ok) return;
      S.update(x => { x.plan = p.id; });
      toast(p.id === 'free' ? 'Tu es repassé·e en Free' : `Bienvenue en ${p.name} ✨`);
      rerender();
    }));
    return;
  }

  if (sec === 'help') {
    const faq = [
      ['Comment marquer les prises ?', 'Sur l’écran caméra, touche chaque prise du bloc dans l’ordre, du départ au top. Touche une prise déjà marquée pour l’enlever.'],
      ['Où sont stockées mes vidéos ?', 'En version bêta, uniquement sur ton téléphone, dans le navigateur. Rien n’est envoyé sur un serveur. Tu peux les supprimer dans Confidentialité.'],
      ['Quand arrive l’analyse IA ?', 'Elle est en développement : détection des prises, lecture du squelette puis conseils validés par des coachs. Tes essais enregistrés pourront être analysés.'],
      ['Comment installer l’app ?', 'Sur iPhone : bouton Partager puis « Sur l’écran d’accueil ». Sur Android : menu ⋮ puis « Installer l’application ».'],
      ['Je change de téléphone, je perds mes données ?', 'En bêta, les données sont liées à l’appareil. Exporte-les depuis Confidentialité avant de changer.'],
    ];
    root.innerHTML = `${head('Aide et sécurité')}
      <div class="card soft mt-24"><div class="row">${icon('heart')}<p class="h3">Grimpe en sécurité</p></div><p class="small muted mt-8">AI Bloc ne remplace pas un coach diplômé ni un professionnel de santé, et n’affirme pas prévenir les blessures. Échauffe-toi, respecte tes limites et les consignes de ta salle. En cas de douleur, arrête-toi.</p></div>
      <p class="eyebrow mt-24" style="margin-bottom:12px">Questions fréquentes</p>
      ${faq.map(([q, a]) => `<details class="faq"><summary>${q}</summary><p>${a}</p></details>`).join('')}
      <button class="btn ghost block mt-24" id="terms">${icon('note', 'sm')} Conditions d’utilisation</button>
      <button class="btn ghost block mt-12" id="share">${icon('share', 'sm')} Partager AI Bloc</button>
      <p class="tiny faint center mt-24">AI Bloc · version bêta · Projet ICAM Toulouse</p>`;
    root.querySelector('#terms').addEventListener('click', showTerms);
    root.querySelector('#share').addEventListener('click', async () => {
      const data = { title: 'AI Bloc', text: 'Le coach de bloc dans ta poche', url: location.origin + location.pathname };
      try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(data.url); toast('Lien copié !'); } } catch (e) { /* annulé */ }
    });
    return;
  }

  go('settings');
}
