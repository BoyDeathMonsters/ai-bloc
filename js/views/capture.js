import * as S from '../store.js';
import { icon, esc, toast, sheet, HOLD_COLORS, smoothPath } from '../ui.js';
import { openAttemptSheet } from './attempt.js';

const MAX_SECONDS = 120;
const MAX_IMPORT_MB = 300;

function pickMime() {
  if (!window.MediaRecorder) return null;
  const c = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  return c.find(m => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || '';
}

// Capture une image de la vidéo recadrée comme à l'écran (object-fit: cover)
function grabFrame(video, W, H) {
  const vw = video.videoWidth, vh = video.videoHeight;
  if (!vw || !vh || !W || !H) return null;
  const outW = 300, outH = Math.round(300 * H / W);
  const c = document.createElement('canvas');
  c.width = outW; c.height = outH;
  const scale = Math.max(outW / vw, outH / vh);
  const dw = vw * scale, dh = vh * scale;
  try {
    c.getContext('2d').drawImage(video, (outW - dw) / 2, (outH - dh) / 2, dw, dh);
    return c.toDataURL('image/jpeg', 0.62);
  } catch (e) { return null; }
}

export function capture(root, { query }) {
  const project = query.project || '';
  let holds = [];
  let marking = true;
  let stream = null, rec = null, chunks = [], blob = null, thumb = null;
  let mode = 'init'; // init | live | recording | imported | nocam
  let timer = null, t0 = 0, importUrl = null, disposed = false;

  root.innerHTML = `<div class="capture">
    <div class="stage" id="stage">
      <video id="cam" playsinline muted autoplay></video>
      <svg class="overlay" id="ov"></svg>
      <p class="cap-msg" id="msg"></p>
      <div class="cap-top">
        <a class="icon-btn" href="#/home" aria-label="Fermer">${icon('x')}</a>
        <div class="cap-pill"><span class="dot" id="dot"></span><span id="pillTxt">CADRAGE</span></div>
        <button class="icon-btn dark" id="help" aria-label="Aide">${icon('help', 'sm')}</button>
      </div>
    </div>
    <div class="cap-sheet">
      <h2 class="h3" style="font-size:19px" id="title">Préparation…</h2>
      <p class="small muted mt-8" id="sub">${project ? `Nouvel essai sur « ${esc(project)} »` : 'On prépare la caméra.'}</p>
      <button class="soft-row on" id="mark">${icon('pin')}<span class="grow" id="markTxt">Marquage des prises activé</span><span class="small muted" id="count">0</span></button>
      <div class="rec-row">
        <button class="rec-side" id="import">${icon('upload')}<span>Importer</span></button>
        <button class="rec-btn" id="rec" aria-label="Démarrer l’enregistrement"><i></i></button>
        <button class="rec-side" id="nolog">${icon('note')}<span>Sans vidéo</span></button>
      </div>
      <p class="rec-label" id="recLbl">DÉMARRER</p>
      <div class="tip" id="tip">Astuce : pose ton téléphone en sécurité, loin du passage.</div>
      <input type="file" id="file" accept="video/*" hidden>
    </div>
  </div>`;

  const $ = s => root.querySelector(s);
  const stage = $('#stage'), video = $('#cam'), ov = $('#ov');
  const setText = (title, sub) => { $('#title').textContent = title; if (sub !== undefined) $('#sub').textContent = sub; };

  function dims() { const r = stage.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }

  function draw() {
    const [W, H] = dims();
    ov.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const pts = holds.map(p => [p.x * W, p.y * H]);
    const last = pts[pts.length - 1];
    let html = '';
    if (pts.length > 1) html += `<path d="${smoothPath(pts)}" fill="none" stroke="#F47B20" stroke-width="3" stroke-linecap="round"/>`;
    html += pts.map((p, i) => `<ellipse cx="${p[0]}" cy="${p[1]}" rx="15" ry="11" fill="${HOLD_COLORS[i % HOLD_COLORS.length]}" stroke="rgba(255,255,255,.7)" stroke-width="1.5" transform="rotate(-18 ${p[0]} ${p[1]})"/>`).join('');
    if (last) {
      html += `<circle cx="${last[0]}" cy="${last[1]}" r="24" fill="none" stroke="#F47B20" stroke-width="3"/>`;
      const lx = Math.min(last[0] + 30, W - 120), ly = Math.max(last[1] - 16, 70);
      html += `<g transform="translate(${lx} ${ly})"><rect width="110" height="32" rx="16" fill="rgba(255,255,255,.92)"/><text x="55" y="21" text-anchor="middle" font-size="12" font-weight="700" fill="#F47B20" font-family="Inter, sans-serif" letter-spacing=".5">PRISE ${holds.length} / ${holds.length}</text></g>`;
    }
    ov.innerHTML = html;
    $('#count').textContent = holds.length;
  }

  ov.addEventListener('click', e => {
    if (!marking) return;
    const r = stage.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const hit = holds.findIndex(p => Math.hypot(p.x * r.width - x, p.y * r.height - y) < 26);
    if (hit >= 0) holds.splice(hit, 1);
    else holds.push({ x: +(x / r.width).toFixed(4), y: +(y / r.height).toFixed(4) });
    draw();
    if (navigator.vibrate) navigator.vibrate(8);
  });

  $('#mark').addEventListener('click', () => {
    if (holds.length && marking) {
      sheet({
        title: 'Prises marquées',
        body: `<p class="muted">Touche une prise sur l’image pour l’enlever, ou touche ailleurs pour en ajouter.</p>
          <button class="btn block mt-24" data-act="stop">Terminer le marquage</button>
          <button class="btn ghost block mt-12" data-act="undo">Annuler la dernière prise</button>
          <button class="btn ghost block mt-12" data-act="clear" style="color:var(--danger)">Effacer toutes les prises</button>`,
        onMount(el, close) {
          el.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
            const act = b.dataset.act;
            if (act === 'undo') holds.pop();
            if (act === 'clear') holds = [];
            if (act === 'stop') marking = false;
            draw(); syncMark(); close();
          }));
        },
      });
      return;
    }
    marking = !marking;
    syncMark();
  });
  function syncMark() {
    $('#mark').classList.toggle('on', marking);
    $('#markTxt').textContent = marking ? 'Marquage des prises activé' : 'Ajouter / corriger les prises';
  }

  function setPill(txt, dot) { $('#pillTxt').textContent = txt; $('#dot').className = 'dot ' + (dot || ''); }

  async function startCam() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return noCam('Caméra non disponible sur ce navigateur.');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      if (disposed) { s.getTracks().forEach(t => t.stop()); return; }
      stream = s;
      video.srcObject = stream;
      stage.classList.add('has-video');
      await video.play().catch(() => {});
      mode = 'live';
      setPill('CADRAGE', 'live');
      setText('Cadrage prêt', project ? `Nouvel essai sur « ${project} ». Marque les prises puis démarre.` : 'Touche l’écran pour marquer les prises, puis démarre.');
      $('#msg').textContent = '';
    } catch (e) {
      console.warn(e);
      noCam(e && e.name === 'NotAllowedError' ? 'Accès à la caméra refusé.' : 'Caméra indisponible.');
    }
  }
  function noCam(reason) {
    mode = 'nocam';
    setPill('SANS CAMÉRA', '');
    setText(reason, 'Tu peux filmer avec l’appareil photo, importer une vidéo, ou noter ton bloc sans vidéo.');
    $('#msg').textContent = 'Touche le mur pour marquer les prises';
    $('#recLbl').textContent = 'FILMER';
  }
  function stopCam() { if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; } }

  function startRec() {
    const mime = pickMime();
    if (mime === null) { toast('Enregistrement non supporté ici : utilise « Importer ».'); return; }
    const [W, H] = dims();
    thumb = grabFrame(video, W, H);
    chunks = [];
    try { rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 2500000 } : undefined); }
    catch (e) { rec = new MediaRecorder(stream); }
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      if (disposed) return;
      blob = new Blob(chunks, { type: rec.mimeType || mime || 'video/webm' });
      finishRecUI();
      save();
    };
    rec.start(1000);
    mode = 'recording';
    t0 = Date.now();
    $('#rec').classList.add('recording');
    $('#rec').setAttribute('aria-label', 'Arrêter');
    setPill('REC 00:00', 'rec');
    setText('Enregistrement…', 'Grimpe ! Touche le bouton pour arrêter.');
    timer = setInterval(() => {
      const s = Math.floor((Date.now() - t0) / 1000);
      setPill(`REC ${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`, 'rec');
      if (s >= MAX_SECONDS) stopRec();
    }, 250);
    $('#recLbl').textContent = 'ARRÊTER';
  }
  function stopRec() { clearInterval(timer); if (rec && rec.state !== 'inactive') rec.stop(); }
  function finishRecUI() {
    mode = 'live';
    $('#rec').classList.remove('recording');
    $('#recLbl').textContent = 'DÉMARRER';
    setPill('CADRAGE', 'live');
    setText('Cadrage prêt', 'Touche l’écran pour marquer les prises, puis démarre.');
  }

  function loadFile(file) {
    if (!file) return;
    if (!file.type.startsWith('video/')) { toast('Choisis un fichier vidéo.'); return; }
    const tooBig = file.size > MAX_IMPORT_MB * 1024 * 1024;
    stopCam();
    if (importUrl) URL.revokeObjectURL(importUrl);
    importUrl = URL.createObjectURL(file);
    video.srcObject = null;
    video.src = importUrl;
    video.loop = true;
    stage.classList.add('has-video');
    blob = tooBig ? null : file;
    if (tooBig) toast(`Vidéo de plus de ${MAX_IMPORT_MB} Mo : elle ne sera pas gardée, seules tes prises le seront.`, 4000);
    video.addEventListener('loadeddata', () => {
      try { video.currentTime = Math.min(0.2, (video.duration || 1) / 2); } catch (e) { /* ignore */ }
      video.play().catch(() => {});
    }, { once: true });
    video.addEventListener('seeked', () => { const [W, H] = dims(); thumb = grabFrame(video, W, H) || thumb; }, { once: true });
    mode = 'imported';
    setPill('VIDÉO IMPORTÉE', 'live');
    setText('Vidéo prête', 'Marque les prises sur l’image, puis valide.');
    $('#msg').textContent = '';
    $('#rec').classList.add('validate');
    $('#rec').innerHTML = icon('check', 'lg');
    $('#recLbl').textContent = 'VALIDER';
  }

  function save() {
    const [W, H] = dims();
    if (mode === 'imported' && !thumb) thumb = grabFrame(video, W, H);
    openAttemptSheet({ holds: [...holds], aspect: [W, H], thumb, blob, project });
  }

  $('#rec').addEventListener('click', () => {
    if (mode === 'live') startRec();
    else if (mode === 'recording') stopRec();
    else if (mode === 'imported') save();
    else if (mode === 'nocam') { $('#file').setAttribute('capture', 'environment'); $('#file').click(); }
  });
  $('#import').addEventListener('click', () => { $('#file').removeAttribute('capture'); $('#file').click(); });
  $('#file').addEventListener('change', e => { loadFile(e.target.files[0]); e.target.value = ''; });
  $('#nolog').addEventListener('click', () => {
    if (mode === 'recording') return;
    const [W, H] = dims();
    const t = mode === 'live' || mode === 'imported' ? grabFrame(video, W, H) : null;
    openAttemptSheet({ holds: [...holds], aspect: [W, H], thumb: t, project });
  });
  $('#help').addEventListener('click', () => sheet({
    title: 'Comment ça marche ?',
    body: `<div class="steps">
      <div class="step"><span class="num">1</span><div><p class="h3">Cadre le bloc</p><p class="small muted">Pose ton téléphone à 2–3 m, tout le bloc dans l’image.</p></div></div>
      <div class="step"><span class="num">2</span><div><p class="h3">Marque les prises d’un tap</p><p class="small muted">Touche chaque prise dans l’ordre, du départ au top. Touche une prise pour l’enlever.</p></div></div>
      <div class="step"><span class="num">3</span><div><p class="h3">Démarre et grimpe</p><p class="small muted">Jusqu’à 2 min de vidéo. Pas de caméra ? Importe une vidéo ou note le bloc sans vidéo.</p></div></div>
      <div class="step"><span class="num">4</span><div><p class="h3">Suis ta progression</p><p class="small muted">Chaque essai alimente ton niveau, tes séances et tes badges.</p></div></div>
    </div>
    <p class="tiny faint mt-16">La détection automatique des prises et l’analyse du mouvement par IA arrivent dans une prochaine version.</p>
    <button class="btn block mt-16" data-close>C’est parti</button>`,
  }));

  const onResize = () => draw();
  window.addEventListener('resize', onResize);
  draw();
  startCam();

  return () => {
    disposed = true;
    clearInterval(timer);
    if (rec && rec.state !== 'inactive') { try { rec.stop(); } catch (e) { /* ignore */ } }
    stopCam();
    if (importUrl) setTimeout(() => URL.revokeObjectURL(importUrl), 2000);
    window.removeEventListener('resize', onResize);
  };
}
