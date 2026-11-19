'use strict';
/* Neon Coast Cover Studio — Vice City Cover Studio.
   Original code. Lettering: Anton + Pacifico, SIL OFL, shipped in app/fonts/.
   No Rockstar logo, artwork or fonts. Photos stay on the user's machine. */

const SAMPLES = ['samples/woman-car.jpg', 'samples/man-rooftop.jpg', 'samples/friends-neon.jpg'];
const SAMPLE_NAMES = ['Boulevard', 'Rooftop', 'Neon Street'];

const GRADES = [
  { id: 'sunset', name: 'Vice Sunset', stops: [[0, 26, 8, 46], [0.35, 146, 32, 92], [0.65, 255, 110, 60], [1, 255, 214, 130]] },
  { id: 'neon', name: 'Neon Pink', stops: [[0, 12, 6, 38], [0.35, 120, 20, 110], [0.65, 255, 46, 150], [1, 255, 150, 220]] },
  { id: 'teal', name: 'Teal Dusk', stops: [[0, 4, 26, 40], [0.35, 16, 90, 110], [0.65, 40, 200, 180], [1, 220, 255, 230]] },
  { id: 'gold', name: 'Golden Hour', stops: [[0, 30, 16, 8], [0.35, 130, 70, 20], [0.65, 245, 150, 50], [1, 255, 235, 170]] },
  { id: 'purple', name: 'Purple Haze', stops: [[0, 18, 6, 44], [0.35, 90, 30, 140], [0.65, 190, 80, 220], [1, 255, 170, 255]] },
  { id: 'noir', name: 'Noir Nights', stops: [[0, 5, 5, 8], [0.4, 60, 60, 70], [0.75, 170, 170, 180], [1, 250, 250, 255]] },
  { id: 'miami', name: 'Miami Nights', stops: [[0, 10, 4, 40], [0.35, 150, 30, 120], [0.65, 255, 120, 90], [1, 120, 240, 255]] },
];

/* Nine layouts. Each returns panels as fractions of the cover: x,y,w,h + rotation. */
const LAYOUTS = [
  { id: 'hero', name: 'Hero Grid', panels: (W, H) => [
    { x: 0, y: 0, w: 0.62, h: 1, rot: 0 }, { x: 0.62, y: 0, w: 0.38, h: 0.5, rot: 0 }, { x: 0.62, y: 0.5, w: 0.38, h: 0.5, rot: 0 }] },
  { id: 'nine', name: 'Nine-Panel Grid', panels: (W, H) => {
    const out = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
      out.push({ x: c / 3, y: r / 3, w: 1 / 3, h: 1 / 3, rot: 0 }); return out; } },
  { id: 'tilted', name: 'Tilted Snapshots', panels: (W, H) => [
    { x: 0.04, y: 0.06, w: 0.52, h: 0.60, rot: -6 }, { x: 0.48, y: 0.04, w: 0.48, h: 0.54, rot: 4 }, { x: 0.24, y: 0.52, w: 0.56, h: 0.40, rot: -2 }] },
  { id: 'bleed', name: 'Full-Bleed + Strip', panels: (W, H) => [
    { x: 0, y: 0, w: 1, h: 0.76, rot: 0 }, { x: 0, y: 0.76, w: 0.333, h: 0.24, rot: 0 },
    { x: 0.333, y: 0.76, w: 0.334, h: 0.24, rot: 0 }, { x: 0.667, y: 0.76, w: 0.333, h: 0.24, rot: 0 }] },
  { id: 'duo', name: 'Split Duo', panels: (W, H) => [
    { x: 0, y: 0, w: 0.5, h: 1, rot: 0 }, { x: 0.5, y: 0, w: 0.5, h: 1, rot: 0 }] },
  { id: 'triptych', name: 'Triptych', panels: (W, H) => [
    { x: 0, y: 0, w: 0.333, h: 1, rot: 0 }, { x: 0.333, y: 0, w: 0.334, h: 1, rot: 0 }, { x: 0.667, y: 0, w: 0.333, h: 1, rot: 0 }] },
  { id: 'comic', name: 'Comic Band', panels: (W, H) => [
    { x: 0, y: 0, w: 1, h: 0.55, rot: 0 }, { x: 0, y: 0.55, w: 0.333, h: 0.45, rot: 0 },
    { x: 0.333, y: 0.55, w: 0.334, h: 0.45, rot: 0 }, { x: 0.667, y: 0.55, w: 0.333, h: 0.45, rot: 0 }] },
  { id: 'stack', name: 'Portrait Stack', panels: (W, H) => [
    { x: 0, y: 0, w: 1, h: 0.5, rot: 0 }, { x: 0, y: 0.5, w: 1, h: 0.5, rot: 0 }] },
  { id: 'slash', name: 'Diagonal Slash', panels: (W, H) => [
    { x: 0, y: 0, w: 0.56, h: 1, rot: 0, slash: 'left' }, { x: 0.44, y: 0, w: 0.56, h: 1, rot: 0, slash: 'right' }] },
];

const SIZES = { '1080x1080': [1080, 1080], '1080x1350': [1080, 1350], '1920x1080': [1920, 1080], '1080x1920': [1080, 1920] };

const state = {
  layout: 'hero', grade: 'sunset', title: 'NEON SHORE', subtitle: 'Vice City nights',
  badge: '★ HEAT 5 — VICE CITY', titleSize: 110, titlePos: 'bottom', titleStyle: 'gradient',
  size: '1080x1350', grain: true, vignette: true, halftone: true, borders: true,
  photos: [],           // {img, src, name}
  assign: [0, 1, 2, 0, 1, 2, 0, 1, 2],  // photo index per panel
  crops: {},             // panel index -> {z, px, py}
  sel: 0,
};
let undoStack = [], redoStack = [];

function snapshot() {
  return JSON.stringify({ ...state, photos: state.photos.map(p => ({ src: p.src, name: p.name })) });
}
function pushUndo() { undoStack.push(snapshot()); if (undoStack.length > 40) undoStack.shift(); redoStack = []; syncUndoButtons(); }
function restore(json) {
  const s = JSON.parse(json);
  const oldPhotos = state.photos;
  Object.assign(state, s);
  state.photos = s.photos.map(p => { const old = oldPhotos.find(o => o.src === p.src); return old || { ...p, img: null }; });
  state.photos.forEach(p => { if (!p.img) { p.img = new Image(); p.img.src = p.src; p.img.onload = render; } });
  syncAllControls(); render();
}
function undo() { if (!undoStack.length) return; redoStack.push(snapshot()); restore(undoStack.pop()); syncUndoButtons(); }
function redo() { if (!redoStack.length) return; undoStack.push(snapshot()); restore(redoStack.pop()); syncUndoButtons(); }
function syncUndoButtons() {
  const u = document.getElementById('undoBtn'), r = document.getElementById('redoBtn');
  if (u) u.disabled = !undoStack.length; if (r) r.disabled = !redoStack.length;
}

function gradeOf(id) { return GRADES.find(g => g.id === id) || GRADES[0]; }
function layoutOf(id) { return LAYOUTS.find(l => l.id === id) || LAYOUTS[0]; }
function cropFor(i) { return state.crops[i] || (state.crops[i] = { z: 1, px: 0, py: 0 }); }

/* Gradient-map a photo onto a temp canvas, then draw it cover-fit into the panel. */
function drawGradedPhoto(ctx, img, px, py, pw, ph, crop) {
  const scale = Math.min(pw / 600, 1);
  const tw = Math.max(2, Math.round(pw * scale)), th = Math.max(2, Math.round(ph * scale));
  const tmp = drawGradedPhoto.tmp || (drawGradedPhoto.tmp = document.createElement('canvas'));
  tmp.width = tw; tmp.height = th;
  const tctx = tmp.getContext('2d');
  tctx.fillStyle = '#241133'; tctx.fillRect(0, 0, tw, th);
  // cover-fit with zoom + pan
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const base = Math.max(tw / iw, th / ih) * crop.z;
  const dw = iw * base, dh = ih * base;
  const dx = (tw - dw) / 2 + (crop.px / 100) * tw * 0.4;
  const dy = (th - dh) / 2 + (crop.py / 100) * th * 0.4;
  tctx.drawImage(img, dx, dy, dw, dh);
  // gradient map by luminance
  const grade = gradeOf(state.grade);
  const data = tctx.getImageData(0, 0, tw, th), d = data.data;
  const stops = grade.stops;
  for (let i = 0; i < d.length; i += 4) {
    const lum = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
    let a = stops[0], b = stops[stops.length - 1];
    for (let s = 0; s < stops.length - 1; s++) {
      if (lum >= stops[s][0] && lum <= stops[s + 1][0]) { a = stops[s]; b = stops[s + 1]; break; }
    }
    const t = b[0] === a[0] ? 0 : (lum - a[0]) / (b[0] - a[0]);
    const mix = 0.72; // keep some of the photo's own colour
    d[i] = d[i] * (1 - mix) + (a[1] + (b[1] - a[1]) * t) * mix;
    d[i + 1] = d[i + 1] * (1 - mix) + (a[2] + (b[2] - a[2]) * t) * mix;
    d[i + 2] = d[i + 2] * (1 - mix) + (a[3] + (b[3] - a[3]) * t) * mix;
  }
  tctx.putImageData(data, 0, 0);
  ctx.drawImage(tmp, px, py, pw, ph);
}

function drawPlaceholder(ctx, px, py, pw, ph, label) {
  const g = ctx.createLinearGradient(px, py, px + pw, py + ph);
  g.addColorStop(0, '#3a1c5e'); g.addColorStop(0.55, '#7a2050'); g.addColorStop(1, '#ff7a3d');
  ctx.fillStyle = g; ctx.fillRect(px, py, pw, ph);
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.font = `${Math.max(14, pw * 0.055)}px Anton, 'Arial Black', sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, px + pw / 2, py + ph / 2);
}

function drawPanel(ctx, panel, i, W, H) {
  const px = panel.x * W, py = panel.y * H, pw = panel.w * W, ph = panel.h * H;
  const gap = state.borders ? Math.max(3, W * 0.004) : 0;
  ctx.save();
  if (panel.rot) { ctx.translate(px + pw / 2, py + ph / 2); ctx.rotate(panel.rot * Math.PI / 180); ctx.translate(-pw / 2, -ph / 2); }
  else ctx.translate(px, py);
  // slash clip
  ctx.beginPath();
  if (panel.slash === 'left') { ctx.moveTo(0, 0); ctx.lineTo(pw, 0); ctx.lineTo(pw * 0.82, ph); ctx.lineTo(0, ph); }
  else if (panel.slash === 'right') { ctx.moveTo(pw * 0.18, 0); ctx.lineTo(pw, 0); ctx.lineTo(pw, ph); ctx.lineTo(0, ph); }
  else ctx.rect(0, 0, pw, ph);
  ctx.closePath(); ctx.clip();
  const photo = state.photos[state.assign[i] ?? 0];
  if (photo && photo.img && photo.img.complete && photo.img.naturalWidth) drawGradedPhoto(ctx, photo.img, 0, 0, pw, ph, cropFor(i));
  else drawPlaceholder(ctx, 0, 0, pw, ph, photo ? 'LOADING…' : '+ ADD PHOTO');
  // inner shading so panels read as poster art
  const shade = ctx.createLinearGradient(0, 0, 0, ph);
  shade.addColorStop(0, 'rgba(255,120,60,0.10)'); shade.addColorStop(1, 'rgba(10,0,30,0.28)');
  ctx.fillStyle = shade; ctx.fillRect(0, 0, pw, ph);
  ctx.restore();
  if (state.borders) {
    ctx.save();
    if (panel.rot) { ctx.translate(px + pw / 2, py + ph / 2); ctx.rotate(panel.rot * Math.PI / 180); ctx.translate(-pw / 2, -ph / 2); }
    else ctx.translate(px, py);
    ctx.lineWidth = gap * 1.4; ctx.strokeStyle = '#fff';
    ctx.strokeRect(gap / 2, gap / 2, pw - gap, ph - gap);
    ctx.lineWidth = gap * 0.7; ctx.strokeStyle = '#12081f';
    ctx.strokeRect(gap * 1.4, gap * 1.4, pw - gap * 2.8, ph - gap * 2.8);
    ctx.restore();
  }
  if (i === state.sel && !document.body.classList.contains('shot')) {
    ctx.save(); ctx.strokeStyle = '#ffd23d'; ctx.lineWidth = Math.max(3, W * 0.004); ctx.setLineDash([14, 8]);
    ctx.strokeRect(px + 4, py + 4, pw - 8, ph - 8); ctx.restore();
  }
}

function drawHalftone(ctx, x, y, w, h) {
  ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.16)';
  const step = Math.max(9, w * 0.014);
  for (let yy = y + step / 2; yy < y + h; yy += step)
    for (let xx = x + step / 2; xx < x + w; xx += step) {
      const r = step * 0.22 * (1 - (yy - y) / h * 0.7);
      ctx.beginPath(); ctx.arc(xx, yy, Math.max(1, r), 0, Math.PI * 2); ctx.fill();
    }
  ctx.restore();
}

function drawGrain(ctx, W, H) {
  const n = Math.floor(W * H / 2600);
  ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let i = 0; i < n; i++) ctx.fillRect(Math.random() * W, Math.random() * H, 1.6, 1.6);
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (let i = 0; i < n; i++) ctx.fillRect(Math.random() * W, Math.random() * H, 1.6, 1.6);
  ctx.restore();
}

function drawTitleBlock(ctx, W, H) {
  const fs = (state.titleSize / 100) * W * 0.115;
  const bandH = fs * 1.9;
  let by = H - bandH;
  if (state.titlePos === 'top') by = 0;
  if (state.titlePos === 'hero') {
    const hero = layoutOf(state.layout).panels(W, H)[0];
    by = hero.y * H + hero.h * H - bandH;
  }
  // band
  ctx.save();
  const bg = ctx.createLinearGradient(0, by, 0, by + bandH);
  bg.addColorStop(0, 'rgba(14,4,32,0.92)'); bg.addColorStop(1, 'rgba(40,8,60,0.94)');
  ctx.fillStyle = bg; ctx.fillRect(0, by, W, bandH);
  ctx.fillStyle = '#ff2e88'; ctx.fillRect(0, by, W, Math.max(4, H * 0.004));
  ctx.fillStyle = '#ffd23d'; ctx.fillRect(0, by + bandH - Math.max(4, H * 0.004), W, Math.max(4, H * 0.004));
  if (state.halftone) drawHalftone(ctx, 0, by, W, bandH);
  // badge ribbon, top-right of band
  if (state.badge.trim()) {
    ctx.font = `${Math.max(13, W * 0.016)}px Anton, 'Arial Black', sans-serif`;
    const bw = ctx.measureText(state.badge).width + W * 0.05;
    const bh = Math.max(24, W * 0.032), bx = W - bw - W * 0.02, byy = by - bh / 2;
    ctx.save(); ctx.translate(bx + bw / 2, byy + bh / 2); ctx.rotate(-2 * Math.PI / 180);
    ctx.fillStyle = '#ffd23d'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
    ctx.fillStyle = '#12081f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(state.badge, 0, 1); ctx.restore();
  }
  // title
  const cx = W / 2, cy = by + bandH * 0.46;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${fs}px Anton, 'Arial Black', Impact, sans-serif`;
  const title = (state.title || 'NEON SHORE').toUpperCase();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#12081f'; ctx.lineWidth = fs * 0.09;
  ctx.strokeText(title, cx, cy);
  if (state.titleStyle === 'gradient') {
    const tg = ctx.createLinearGradient(0, cy - fs * 0.5, 0, cy + fs * 0.5);
    tg.addColorStop(0, '#fff7d6'); tg.addColorStop(0.45, '#ffb347'); tg.addColorStop(0.75, '#ff2e88'); tg.addColorStop(1, '#7b5cff');
    ctx.fillStyle = tg;
  } else if (state.titleStyle === 'neon') {
    ctx.fillStyle = '#12081f'; ctx.strokeStyle = '#2de2c5'; ctx.lineWidth = fs * 0.03;
    ctx.shadowColor = '#ff2e88'; ctx.shadowBlur = fs * 0.25;
  } else ctx.fillStyle = '#ffffff';
  ctx.fillText(title, cx, cy);
  ctx.shadowBlur = 0;
  // subtitle in script
  if (state.subtitle.trim()) {
    ctx.font = `${fs * 0.34}px Pacifico, cursive`;
    ctx.fillStyle = '#2de2c5'; ctx.strokeStyle = '#12081f'; ctx.lineWidth = fs * 0.02;
    ctx.strokeText(state.subtitle, cx, by + bandH * 0.84);
    ctx.fillText(state.subtitle, cx, by + bandH * 0.84);
  }
  ctx.restore();
}

function drawCover(ctx, W, H) {
  // sunset sky backdrop (shows through tilted/slash gaps)
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#2b1055'); sky.addColorStop(0.5, '#c94b7c'); sky.addColorStop(0.8, '#ff7a3d'); sky.addColorStop(1, '#ffd23d');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  // sun disc
  ctx.save(); ctx.fillStyle = 'rgba(255,240,180,0.9)';
  ctx.beginPath(); ctx.arc(W * 0.78, H * 0.22, Math.min(W, H) * 0.09, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  const panels = layoutOf(state.layout).panels(W, H);
  panels.forEach((p, i) => drawPanel(ctx, p, i, W, H));
  drawTitleBlock(ctx, W, H);
  if (state.vignette) {
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(8,0,20,0.45)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }
  if (state.grain) drawGrain(ctx, W, H);
  // heat meter, bottom-left corner
  ctx.save(); ctx.font = `${Math.max(13, W * 0.018)}px Anton, sans-serif`;
  ctx.fillStyle = '#ffd23d'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
  ctx.fillText('★★★★★', W * 0.02, H - H * 0.012); ctx.restore();
}

/* ---------------- editor wiring ---------------- */
const canvas = document.getElementById('cover');
const ctx = canvas.getContext('2d');
let renderQueued = false;
function render() {
  if (renderQueued) return; renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    const [W, H] = SIZES[state.size] || [1080, 1350];
    canvas.width = W; canvas.height = H;
    drawCover(ctx, W, H);
    const meta = document.getElementById('previewMeta');
    if (meta) meta.textContent = `Live preview · ${W} × ${H} · ${layoutOf(state.layout).name} · ${gradeOf(state.grade).name}`;
  });
}

function loadPhoto(src, name) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve({ img, src, name });
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
async function addPhotos(files) {
  for (const f of files) {
    if (state.photos.length >= 4) break;
    const url = URL.createObjectURL(f);
    const p = await loadPhoto(url, f.name || 'Your photo');
    if (p) state.photos.push(p);
  }
  if (!state.photos.length) return;
  pushUndo(); syncPhotoStrip(); render();
}
async function loadSamples() {
  pushUndo();
  state.photos = [];
  for (let i = 0; i < SAMPLES.length; i++) {
    const p = await loadPhoto(SAMPLES[i], SAMPLE_NAMES[i]);
    if (p) state.photos.push(p);
  }
  state.assign = [0, 1, 2, 0, 1, 2, 0, 1, 2];
  syncPhotoStrip(); render();
  setStatus('Samples loaded — pick a layout, tweak the caption, export.');
}
function syncPhotoStrip() {
  const strip = document.getElementById('photoStrip'); if (!strip) return;
  strip.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const d = document.createElement('div');
    d.className = 'slot' + (state.photos[i] ? ' filled' : '');
    if (state.photos[i]) d.style.backgroundImage = `url("${state.photos[i].src}")`;
    d.innerHTML = `<span class="num">${i + 1}</span>` + (state.photos[i] ? `<button class="rm" title="Remove">×</button>` : '<span class="num" style="left:50%;top:50%;transform:translate(-50%,-50%);background:none;font-size:22px;color:#c9b8e8">+</span>');
    d.onclick = e => {
      if (e.target.classList.contains('rm')) { pushUndo(); state.photos.splice(i, 1); syncPhotoStrip(); render(); return; }
      if (!state.photos[i]) document.getElementById('fileInput').click();
      else { pushUndo(); state.assign[state.sel] = i; syncPanelPhoto(); render(); }
    };
    strip.appendChild(d);
  }
  syncPanelPhoto();
}
function syncPanelPhoto() {
  const sel = document.getElementById('panelPhoto'); if (!sel) return;
  sel.innerHTML = state.photos.map((p, i) => `<option value="${i}">${i + 1}. ${p.name}</option>`).join('') || '<option value="0">No photos yet</option>';
  sel.value = String(state.assign[state.sel] ?? 0);
  const label = document.getElementById('panelLabel');
  if (label) label.textContent = `Panel ${state.sel + 1} of ${layoutOf(state.layout).panels(100, 100).length} — click the preview to pick one`;
  const c = cropFor(state.sel);
  const zs = document.getElementById('zoomSlider'); if (zs) zs.value = Math.round(c.z * 100);
  const zv = document.getElementById('zoomVal'); if (zv) zv.textContent = Math.round(c.z * 100) + '%';
  const px = document.getElementById('panX'); if (px) px.value = c.px;
  const py = document.getElementById('panY'); if (py) py.value = c.py;
}
function syncAllControls() {
  const g = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  g('titleInput', state.title); g('subtitleInput', state.subtitle); g('badgeInput', state.badge);
  g('titleSize', state.titleSize); g('titlePos', state.titlePos); g('titleStyle', state.titleStyle);
  g('sizeSelect', state.size);
  const t = (id, v) => { const el = document.getElementById(id); if (el) el.checked = v; };
  t('grainToggle', state.grain); t('vignetteToggle', state.vignette); t('halftoneToggle', state.halftone); t('borderToggle', state.borders);
  document.querySelectorAll('.layout-btn').forEach(b => b.classList.toggle('active', b.dataset.id === state.layout));
  document.querySelectorAll('.grade-btn').forEach(b => b.classList.toggle('active', b.dataset.id === state.grade));
  const ln = document.getElementById('layoutName'); if (ln) ln.textContent = layoutOf(state.layout).name;
  syncPhotoStrip();
}
function setStatus(msg) { const el = document.getElementById('statusLine'); if (el) el.textContent = msg; }

function buildPickers() {
  const lg = document.getElementById('layoutGrid');
  LAYOUTS.forEach(l => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'layout-btn' + (l.id === state.layout ? ' active' : ''); b.dataset.id = l.id;
    b.innerHTML = `<span class="thumb"></span>${l.name}`;
    b.onclick = () => { pushUndo(); state.layout = l.id; state.sel = 0; syncAllControls(); render(); };
    lg.appendChild(b);
  });
  const gg = document.getElementById('gradeGrid');
  GRADES.forEach(gr => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'grade-btn' + (gr.id === state.grade ? ' active' : ''); b.dataset.id = gr.id;
    const css = `linear-gradient(90deg, rgb(${gr.stops[0].slice(1).join(',')}), rgb(${gr.stops[2].slice(1).join(',')}), rgb(${gr.stops[3].slice(1).join(',')}))`;
    b.innerHTML = `<span class="sw" style="background:${css}"></span>${gr.name}`;
    b.onclick = () => { pushUndo(); state.grade = gr.id; syncAllControls(); render(); };
    gg.appendChild(b);
  });
}

function bindControls() {
  document.getElementById('fileInput').addEventListener('change', e => addPhotos([...e.target.files]));
  document.getElementById('sampleBtn').onclick = loadSamples;
  document.getElementById('clearBtn').onclick = () => { pushUndo(); state.photos = []; state.assign = [0, 1, 2, 0, 1, 2, 0, 1, 2]; syncPhotoStrip(); render(); };
  const onText = (id, key) => document.getElementById(id).addEventListener('input', e => { state[key] = e.target.value; render(); });
  onText('titleInput', 'title'); onText('subtitleInput', 'subtitle'); onText('badgeInput', 'badge');
  document.getElementById('titleInput').addEventListener('change', pushUndo);
  document.getElementById('subtitleInput').addEventListener('change', pushUndo);
  document.getElementById('badgeInput').addEventListener('change', pushUndo);
  document.getElementById('titleSize').addEventListener('input', e => { state.titleSize = +e.target.value; render(); });
  document.getElementById('titleSize').addEventListener('change', pushUndo);
  document.getElementById('titlePos').addEventListener('change', e => { pushUndo(); state.titlePos = e.target.value; render(); });
  document.getElementById('titleStyle').addEventListener('change', e => { pushUndo(); state.titleStyle = e.target.value; render(); });
  document.getElementById('sizeSelect').addEventListener('change', e => { pushUndo(); state.size = e.target.value; render(); });
  const onToggle = (id, key) => document.getElementById(id).addEventListener('change', e => { pushUndo(); state[key] = e.target.checked; render(); });
  onToggle('grainToggle', 'grain'); onToggle('vignetteToggle', 'vignette'); onToggle('halftoneToggle', 'halftone'); onToggle('borderToggle', 'borders');
  document.getElementById('panelPhoto').addEventListener('change', e => { pushUndo(); state.assign[state.sel] = +e.target.value; render(); });
  document.getElementById('fillAllBtn').onclick = () => { pushUndo(); const v = state.assign[state.sel]; state.assign = state.assign.map(() => v); render(); setStatus('All panels now use the same photo.'); };
  document.getElementById('zoomSlider').addEventListener('input', e => { cropFor(state.sel).z = +e.target.value / 100; document.getElementById('zoomVal').textContent = e.target.value + '%'; render(); });
  document.getElementById('zoomSlider').addEventListener('change', pushUndo);
  document.getElementById('panX').addEventListener('input', e => { cropFor(state.sel).px = +e.target.value; render(); });
  document.getElementById('panY').addEventListener('input', e => { cropFor(state.sel).py = +e.target.value; render(); });
  document.getElementById('panX').addEventListener('change', pushUndo);
  document.getElementById('panY').addEventListener('change', pushUndo);
  document.getElementById('undoBtn').onclick = undo;
  document.getElementById('redoBtn').onclick = redo;
  document.getElementById('shuffleBtn').onclick = () => {
    pushUndo();
    state.layout = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)].id;
    state.grade = GRADES[Math.floor(Math.random() * GRADES.length)].id;
    state.assign = state.assign.map(() => Math.floor(Math.random() * Math.max(1, state.photos.length)));
    state.titlePos = ['bottom', 'top', 'hero'][Math.floor(Math.random() * 3)];
    syncAllControls(); render(); setStatus('Shuffled — ' + layoutOf(state.layout).name + ' · ' + gradeOf(state.grade).name);
  };
  document.getElementById('exportBtn').onclick = exportPNG;
  // click a panel to select it; drag to pan its photo; wheel to zoom
  let drag = null;
  canvas.addEventListener('pointerdown', e => {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    const panels = layoutOf(state.layout).panels(1, 1);
    const i = panels.findIndex(p => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h);
    if (i >= 0) { state.sel = i; syncPanelPhoto(); render(); drag = { x: e.clientX, y: e.clientY, px: cropFor(i).px, py: cropFor(i).py }; canvas.setPointerCapture(e.pointerId); }
  });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    const r = canvas.getBoundingClientRect();
    cropFor(state.sel).px = Math.max(-100, Math.min(100, drag.px + (e.clientX - drag.x) / r.width * 160));
    cropFor(state.sel).py = Math.max(-100, Math.min(100, drag.py + (e.clientY - drag.y) / r.height * 160));
    syncPanelPhoto(); render();
  });
  canvas.addEventListener('pointerup', () => { if (drag) { drag = null; pushUndo(); } });
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const c = cropFor(state.sel);
    c.z = Math.max(1, Math.min(3, c.z - Math.sign(e.deltaY) * 0.1));
    syncPanelPhoto(); render();
  }, { passive: false });
}

async function exportPNG() {
  const [W, H] = SIZES[state.size];
  const off = document.createElement('canvas'); off.width = W; off.height = H;
  drawCover(off.getContext('2d'), W, H);
  setStatus('Exporting…');
  off.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `neon-coast-cover-${state.size}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    setStatus(`Exported ${W}×${H} PNG — check your downloads.`);
    document.querySelectorAll('.steps li').forEach(li => li.classList.toggle('active', li.dataset.step === '3'));
  }, 'image/png');
  return off;
}

/* ?shot=cover mode: full-frame exported cover for screenshots, driven by the app itself. */
async function shotMode() {
  const q = new URLSearchParams(location.search);
  if (q.get('shot') !== 'cover') return false;
  document.body.classList.add('shot');
  if (q.get('layout')) state.layout = q.get('layout');
  if (q.get('grade')) state.grade = q.get('grade');
  if (q.get('size') && SIZES[q.get('size')]) state.size = q.get('size');
  if (q.get('title')) state.title = q.get('title');
  if (q.get('subtitle')) state.subtitle = q.get('subtitle');
  await loadSamples();
  // spread the three samples across panels in rotation for a full cover
  const n = layoutOf(state.layout).panels(1, 1).length;
  state.assign = Array.from({ length: 9 }, (_, i) => i % Math.max(1, state.photos.length));
  await document.fonts.ready;
  render();
  await new Promise(r => setTimeout(r, 350));
  window.__coverReady = true;
  return true;
}

async function init() {
  buildPickers(); bindControls(); syncPhotoStrip(); syncUndoButtons();
  const shot = await shotMode();
  if (!shot) { await document.fonts.ready.catch(() => {}); render(); }
}
init();
