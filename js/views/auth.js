import * as S from '../store.js';
import { GRADES } from '../data.js';
import { icon, LOGO, toast, sheet } from '../ui.js';

const header = `<div class="logo-mark">${LOGO}</div><h1 class="brand">AI BLOC</h1><p class="tagline">Progresse, prise après prise.</p>`;
const emailOk = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

function pwField(id, label, ph = '••••••••', auto = 'current-password') {
  return `<label class="field"><span>${label}</span><div class="input-wrap"><input class="input" id="${id}" type="password" placeholder="${ph}" autocomplete="${auto}" required minlength="6"><button type="button" class="eye" data-eye="${id}" aria-label="Afficher le mot de passe">${icon('eye')}</button></div></label>`;
}
function bindEyes(root) {
  root.querySelectorAll('[data-eye]').forEach(b => b.addEventListener('click', () => {
    const inp = root.querySelector('#' + b.dataset.eye);
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    b.innerHTML = icon(show ? 'eyeOff' : 'eye');
  }));
}
const localNote = `<div class="local-note">${icon('lock', 'xs')}<span>Version bêta : ton compte et tes vidéos restent enregistrés sur cet appareil, rien n'est envoyé sur un serveur.</span></div>`;

export function showTerms() {
  sheet({
    title: "Conditions d'utilisation",
    body: `<div class="stack small muted">
      <p><b>AI Bloc est une version bêta</b> développée dans le cadre d'un projet de création d'entreprise (ICAM Toulouse).</p>
      <p>Tes données (compte, séances, vidéos) sont stockées uniquement sur ton appareil, dans le navigateur. Tu peux les exporter ou les supprimer à tout moment depuis Paramètres.</p>
      <p>Les conseils et exercices proposés ne remplacent pas l'avis d'un professionnel de santé ou d'un coach diplômé. AI Bloc n'affirme pas prévenir les blessures : grimpe dans le respect de tes limites et des règles de ta salle.</p>
      <p>Les coachs présentés sont fictifs pour la démonstration ; aucune réservation ni aucun paiement réel n'est effectué.</p>
      <p>Filmer en salle : demande l'accord des personnes présentes à l'image.</p>
    </div><button class="btn block mt-24" data-close>J'ai compris</button>`,
  });
}

export function login(root, { go }) {
  root.innerHTML = `<div class="auth">
    ${header}
    <h2 class="h1 mt-32" style="font-size:28px">Bienvenue</h2>
    <p class="sub">Connecte-toi pour retrouver ta progression.</p>
    <form id="f" novalidate>
      <label class="field"><span>E-mail</span><input class="input" id="email" type="email" inputmode="email" autocomplete="email" placeholder="grimpeur@email.com" required></label>
      ${pwField('pw', 'Mot de passe')}
      <div style="text-align:right;margin-top:12px"><a class="link small" href="#/forgot">Mot de passe oublié ?</a></div>
      <p class="form-error" id="err" role="alert"></p>
      <button class="btn block mt-12" type="submit">Se connecter</button>
    </form>
    <div class="divider">ou continuer avec</div>
    <div class="social">
      <button class="btn ghost" data-soc="Apple">${icon('apple', 'sm')} Apple</button>
      <button class="btn ghost" data-soc="Google">${icon('google', 'sm')} Google</button>
    </div>
    <button class="btn soft block mt-12" id="demo">${icon('sparkle', 'sm')} Essayer avec le compte démo</button>
    <p class="center muted mt-24">Nouveau sur AI Bloc ?</p>
    <p class="center mt-8"><a class="link" href="#/register" style="font-size:16px">Créer un compte</a></p>
    <p class="center tiny faint mt-24"><button class="tiny faint" id="terms" style="text-decoration:underline">En continuant, tu acceptes nos conditions.</button></p>
  </div>`;
  bindEyes(root);
  const err = root.querySelector('#err');
  root.querySelector('#f').addEventListener('submit', async e => {
    e.preventDefault();
    const email = root.querySelector('#email').value, pw = root.querySelector('#pw').value;
    if (!emailOk(email)) { err.textContent = 'Entre une adresse e-mail valide.'; return; }
    if (!pw) { err.textContent = 'Entre ton mot de passe.'; return; }
    try { await S.login(email, pw); go('home'); } catch (ex) { err.textContent = ex.message; }
  });
  root.querySelectorAll('[data-soc]').forEach(b => b.addEventListener('click', () => toast(`Connexion ${b.dataset.soc} bientôt disponible — utilise ton e-mail pour l'instant.`, 3200)));
  root.querySelector('#demo').addEventListener('click', async () => { await S.loginDemo(); toast('Bienvenue dans le compte démo de Léa 👋'); go('home'); });
  root.querySelector('#terms').addEventListener('click', showTerms);
}

export function register(root, { go }) {
  const opts = GRADES.slice(0, 16).map(g => `<option value="${g}" ${g === '5a' ? 'selected' : ''}>${g}</option>`).join('');
  root.innerHTML = `<div class="auth" style="padding-top:calc(var(--safe-t) + 24px)">
    <a class="back" href="#/login">${icon('chevL', 'sm')} Retour</a>
    <div class="row"><div class="logo-mark sm" style="margin:0">${LOGO}</div><div><h1 class="h1" style="font-size:26px">Créer un compte</h1><p class="muted">Gratuit, en 30 secondes.</p></div></div>
    <form id="f" novalidate>
      <label class="field"><span>Prénom et nom</span><input class="input" id="name" autocomplete="name" placeholder="Léa Moreau" required></label>
      <label class="field"><span>E-mail</span><input class="input" id="email" type="email" inputmode="email" autocomplete="email" placeholder="grimpeur@email.com" required></label>
      ${pwField('pw', 'Mot de passe', '6 caractères minimum', 'new-password')}
      <label class="field"><span>Ton niveau actuel en bloc</span><select class="select" id="level">${opts}</select></label>
      <label class="check"><input type="checkbox" id="cgu"><span>J'accepte les <button type="button" class="link small" id="terms">conditions d'utilisation</button> et je comprends que les conseils ne remplacent pas un professionnel.</span></label>
      <p class="form-error" id="err" role="alert"></p>
      <button class="btn block mt-12" type="submit">Créer mon compte</button>
    </form>
    ${localNote}
  </div>`;
  bindEyes(root);
  root.querySelector('#terms').addEventListener('click', showTerms);
  const err = root.querySelector('#err');
  root.querySelector('#f').addEventListener('submit', async e => {
    e.preventDefault();
    const v = id => root.querySelector('#' + id).value;
    if (v('name').trim().length < 2) return (err.textContent = 'Indique ton prénom.');
    if (!emailOk(v('email'))) return (err.textContent = 'Entre une adresse e-mail valide.');
    if (v('pw').length < 6) return (err.textContent = 'Le mot de passe doit faire au moins 6 caractères.');
    if (!root.querySelector('#cgu').checked) return (err.textContent = "Accepte les conditions d'utilisation pour continuer.");
    try {
      await S.register({ name: v('name'), email: v('email'), password: v('pw'), level: v('level') });
      toast('Compte créé, bienvenue ! 🎉');
      go('home');
    } catch (ex) { err.textContent = ex.message; }
  });
}

export function forgot(root, { go }) {
  root.innerHTML = `<div class="auth" style="padding-top:calc(var(--safe-t) + 24px)">
    <a class="back" href="#/login">${icon('chevL', 'sm')} Retour</a>
    <h1 class="h1">Mot de passe oublié</h1>
    <p class="sub">En version bêta, ton compte est stocké sur cet appareil : choisis directement un nouveau mot de passe.</p>
    <form id="f" novalidate>
      <label class="field"><span>E-mail du compte</span><input class="input" id="email" type="email" inputmode="email" autocomplete="email" placeholder="grimpeur@email.com"></label>
      ${pwField('pw', 'Nouveau mot de passe', '6 caractères minimum', 'new-password')}
      ${pwField('pw2', 'Confirme le mot de passe', '', 'new-password')}
      <p class="form-error" id="err" role="alert"></p>
      <button class="btn block mt-12" type="submit">Réinitialiser</button>
    </form>
  </div>`;
  bindEyes(root);
  const err = root.querySelector('#err');
  root.querySelector('#f').addEventListener('submit', async e => {
    e.preventDefault();
    const email = root.querySelector('#email').value, pw = root.querySelector('#pw').value, pw2 = root.querySelector('#pw2').value;
    if (!emailOk(email)) return (err.textContent = 'Entre une adresse e-mail valide.');
    if (pw.length < 6) return (err.textContent = 'Le mot de passe doit faire au moins 6 caractères.');
    if (pw !== pw2) return (err.textContent = 'Les deux mots de passe ne correspondent pas.');
    try { await S.resetPassword(email, pw); toast('Mot de passe mis à jour, connecte-toi.'); go('login'); } catch (ex) { err.textContent = ex.message; }
  });
}
