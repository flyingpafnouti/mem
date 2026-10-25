// Visualiseur 3D des fiches anatomiques : scène Three.js par couches et étiquettes HTML.
// Chaque couche est découpée en structures (un muscle, un os, une artère, d'un côté du corps).
// Une passe hors écran dessine le numéro de chaque structure : on sait ainsi lesquelles sont
// visibles, sur combien de pixels, et laquelle est sous le pointeur. Les étiquettes ne sont
// posées que sur les structures assez grandes à l'écran : zoomer fait apparaître les détails.
// L'application masque les étiquettes comme n'importe quel texte.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const FOV = 30;
const MIN_AREA = 150;      // pixels visibles avant qu'une structure reçoive son étiquette
const MAX_LABELS = 70;
const SETTLE_MS = 120;     // les étiquettes se recalculent quand la vue s'arrête
const HIGHLIGHT = [255, 200, 40];

export async function createViewer(container, manifest, baseUrl) {
  const root = document.createElement('div');
  root.className = 'viewer3d';
  const labelLayer = document.createElement('div');
  labelLayer.className = 'labels3d';
  container.replaceChildren(root);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  root.append(renderer.domElement, labelLayer);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.005, 50);
  scene.add(camera);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7f70, 1.6));
  // La lumière suit la caméra : la face regardée est toujours éclairée
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(0.5, 0.8, 1);
  camera.add(key);

  // Structures numérotées à partir de 1 sur l'ensemble des couches (0 = fond)
  const { centre, half } = manifest;
  const items = [null];
  const layers = [...manifest.layers].sort((a, b) => a.depth - b.depth).map(spec => {
    const layer = { spec, name: spec.name, depth: spec.depth, weight: 0, mesh: null, firstItem: items.length };
    for (const [vStart, vCount, iStart, iCount, label] of spec.items) items.push({ layer, vStart, vCount, iStart, iCount, label });
    return layer;
  });

  // Fichier d'une couche : positions Int16 quantifiées sur la boîte englobante, couleurs RGB,
  // indices Uint16 relatifs au premier sommet de chaque structure
  function buildLayer(layer, buffer) {
    const { spec } = layer;
    const q = new Int16Array(buffer, spec.positions, spec.vertexCount * 3);
    const pos = new Float32Array(q.length);
    for (let i = 0; i < q.length; i++) pos[i] = centre[i % 3] + q[i] / 32767 * half[i % 3];
    const colors = new Uint8Array(buffer, spec.colors, spec.vertexCount * 3).slice();
    const local = new Uint16Array(buffer, spec.indices, spec.indexCount);
    const index = new Uint32Array(spec.indexCount);
    const pid = new Float32Array(spec.vertexCount);
    spec.items.forEach(([vStart, vCount, iStart, iCount], k) => {
      for (let i = iStart; i < iStart + iCount; i++) index[i] = local[i] + vStart;
      pid.fill(layer.firstItem + k, vStart, vStart + vCount);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3, true));
    geometry.setAttribute('pid', new THREE.BufferAttribute(pid, 1));
    geometry.setIndex(new THREE.BufferAttribute(index, 1));
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, metalness: 0 });
    layer.mesh = new THREE.Mesh(geometry, material);
    layer.original = colors.slice();
    applyWeight(layer);
    scene.add(layer.mesh);
  }

  let disposed = false;
  async function loadLayer(layer) {
    const res = await fetch(new URL(layer.spec.file, baseUrl));
    if (!res.ok) throw new Error(`${layer.spec.file} : ${res.status}`);
    const buffer = await res.arrayBuffer();
    if (disposed) return;
    buildLayer(layer, buffer);
    if (selected && items[selected].layer === layer) paint(selected, true);
    requestRender();
    scheduleLabels();
  }
  // Vue de face, corps entier
  const target = new THREE.Vector3(centre[0], centre[1], centre[2]);
  const home = target.clone().add(new THREE.Vector3(0, 0, half[1] * 1.2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2))));
  camera.position.copy(home);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(target);
  controls.enableDamping = true;
  controls.minDistance = 0.05;
  controls.maxDistance = home.distanceTo(target) * 2.5;
  controls.update();

  // La molette parcourt le corps de haut en bas à zoom constant (le zoom passe par les
  // boutons, le pincement ou Ctrl + molette) ; Maj + molette ou défilement horizontal :
  // déplacement latéral
  const pan = new THREE.Vector3();
  const right = new THREE.Vector3();
  root.addEventListener('wheel', e => {
    if (e.ctrlKey) return;
    e.preventDefault();
    e.stopPropagation();
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? root.clientHeight : 1;
    let dx = e.deltaX * unit, dy = e.deltaY * unit;
    if (e.shiftKey && !dx) [dx, dy] = [dy, 0];
    // Un pixel de défilement déplace la vue d'un pixel à l'écran, quel que soit le zoom
    const perPixel = 2 * camera.position.distanceTo(controls.target) * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) / root.clientHeight;
    right.setFromMatrixColumn(camera.matrix, 0).setY(0).normalize();
    pan.copy(right).multiplyScalar(dx * perPixel);
    pan.y = -dy * perPixel;
    // La cible reste dans la boîte du corps
    const next = controls.target.clone().add(pan);
    for (let i = 0; i < 3; i++) next.setComponent(i, THREE.MathUtils.clamp(next.getComponent(i), centre[i] - half[i], centre[i] + half[i]));
    pan.subVectors(next, controls.target);
    controls.target.add(pan);
    camera.position.add(pan);
    requestRender();
    scheduleLabels();
  }, { capture: true, passive: false });

  // ── Passe des numéros ──────────────────────────────────────────────────────
  const idMaterial = new THREE.ShaderMaterial({
    vertexShader: 'attribute float pid; varying float vPid; void main() { vPid = pid; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'varying float vPid; void main() { float id = floor(vPid + 0.5); gl_FragColor = vec4(mod(id, 256.0) / 255.0, floor(id / 256.0) / 255.0, 0.0, 1.0); }',
  });
  const idTarget = new THREE.WebGLRenderTarget(1, 1);
  let idPixels = new Uint8Array(4), idW = 0, idH = 0;

  // Seule la couche dominante (poids ≥ 0,5) compte pour les étiquettes et le pointage
  function renderIds() {
    const w = root.clientWidth, h = root.clientHeight;
    if (!w || !h) return false;
    if (idTarget.width !== w || idTarget.height !== h) idTarget.setSize(w, h);
    if (idPixels.length !== w * h * 4) idPixels = new Uint8Array(w * h * 4);
    const shown = layers.map(l => l.mesh?.visible);
    for (const l of layers) if (l.mesh) l.mesh.visible = l.weight >= 0.5;
    scene.overrideMaterial = idMaterial;
    renderer.setRenderTarget(idTarget);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    scene.overrideMaterial = null;
    layers.forEach((l, i) => { if (l.mesh) l.mesh.visible = shown[i]; });
    renderer.readRenderTargetPixels(idTarget, 0, 0, w, h, idPixels);
    idW = w; idH = h;
    return true;
  }
  // Numéro de la structure au pixel (x, y) de l'écran ; la lecture GPU est à l'envers
  const idAt = (x, y) => { const o = ((idH - 1 - y) * idW + x) * 4; return idPixels[o] | idPixels[o + 1] << 8; };

  // Point 3D de la structure sous un pixel : rayon contre ses seuls triangles
  const raycaster = new THREE.Raycaster();
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), hit = new THREE.Vector3();
  function pointOn(id, x, y) {
    const it = items[id];
    const geometry = it.layer.mesh.geometry;
    const pos = geometry.attributes.position.array, index = geometry.index.array;
    raycaster.setFromCamera({ x: (x + 0.5) / idW * 2 - 1, y: 1 - (y + 0.5) / idH * 2 }, camera);
    let best = null, bestD = Infinity;
    for (let i = it.iStart; i < it.iStart + it.iCount; i += 3) {
      a.fromArray(pos, index[i] * 3); b.fromArray(pos, index[i + 1] * 3); c.fromArray(pos, index[i + 2] * 3);
      if (!raycaster.ray.intersectTriangle(a, b, c, false, hit)) continue;
      const d = hit.distanceToSquared(raycaster.ray.origin);
      if (d < bestD) { bestD = d; best = hit.clone(); }
    }
    return best;
  }

  // ── Étiquettes ─────────────────────────────────────────────────────────────
  const labels = manifest.labels.map(l => {
    const el = document.createElement('div');
    el.className = 'label3d';
    el.hidden = true;
    const text = document.createElement('span');
    text.textContent = l.name;
    el.append(text);
    labelLayer.append(el);
    return { el, text, name: l.name };
  });
  const measure = document.createElement('canvas').getContext('2d');
  let shown = [];   // { label, item, at, left }

  function updateLabels() {
    if (disposed || !renderIds()) return;
    const n = items.length;
    const count = new Uint32Array(n), sx = new Float64Array(n), sy = new Float64Array(n);
    for (let y = 0; y < idH; y++) for (let x = 0; x < idW; x++) {
      const id = idAt(x, y);
      if (id) { count[id]++; sx[id] += x; sy[id] += y; }
    }
    // Ancre : pixel de la structure le plus proche de son barycentre visible
    const best = new Float64Array(n).fill(Infinity), bx = new Int32Array(n), by = new Int32Array(n);
    const wanted = id => items[id] && items[id].label >= 0 && (count[id] >= MIN_AREA || id === selected && count[id] > 0);
    for (let y = 0; y < idH; y++) for (let x = 0; x < idW; x++) {
      const id = idAt(x, y);
      if (!id || !wanted(id)) continue;
      const d = (x - sx[id] / count[id]) ** 2 + (y - sy[id] / count[id]) ** 2;
      if (d < best[id]) { best[id] = d; bx[id] = x; by[id] = y; }
    }
    const candidates = [];
    for (let id = 1; id < n; id++) if (count[id] && wanted(id)) candidates.push(id);
    candidates.sort((p, q) => (q === selected) - (p === selected) || count[q] - count[p]);

    // Les plus grandes structures d'abord ; un nom n'apparaît qu'une fois, sans chevauchement
    measure.font = getComputedStyle(labelLayer.firstChild ?? labelLayer).font;
    const boxes = [], used = new Set(), next = [];
    for (const id of candidates) {
      if (next.length >= MAX_LABELS) break;
      const label = labels[items[id].label];
      if (used.has(label)) continue;
      const w = measure.measureText(label.name).width + 10, h = 16;
      const left = bx[id] + 8 + w > idW;
      const box = { x0: left ? bx[id] - 8 - w : bx[id] - 4, x1: left ? bx[id] + 4 : bx[id] + 8 + w, y0: by[id] - h / 2, y1: by[id] + h / 2 };
      if (id !== selected && boxes.some(o => box.x0 < o.x1 && o.x0 < box.x1 && box.y0 < o.y1 && o.y0 < box.y1)) continue;
      const at = pointOn(id, bx[id], by[id]);
      if (!at) continue;
      boxes.push(box);
      used.add(label);
      next.push({ label, item: items[id], at, left });
    }
    for (const s of shown) if (!used.has(s.label)) s.label.el.hidden = true;
    shown = next;
    for (const s of shown) {
      s.label.el.hidden = false;
      s.label.el.classList.toggle('left', s.left);
      s.label.el.classList.toggle('selected', s.item === items[selected]);
    }
    placeLabels();
  }
  let labelTimer = 0;
  const scheduleLabels = () => { clearTimeout(labelTimer); labelTimer = setTimeout(updateLabels, SETTLE_MS); };

  const v = new THREE.Vector3();
  function placeLabels() {
    const w = renderer.domElement.clientWidth, h = renderer.domElement.clientHeight;
    for (const s of shown) {
      v.copy(s.at).project(camera);
      const x = (v.x + 1) / 2 * w, y = (1 - v.y) / 2 * h;
      const opacity = v.z > 1 ? 0 : s.item.layer.weight;
      s.label.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      s.label.el.style.opacity = opacity;
      s.label.el.style.visibility = opacity > 0.02 ? '' : 'hidden';
    }
  }

  // ── Sélection d'une structure au clic ──────────────────────────────────────
  let selected = 0;
  function paint(id, on) {
    const it = items[id];
    const attr = it.layer.mesh?.geometry.attributes.color;
    if (!attr) return;
    const from = it.vStart * 3, to = (it.vStart + it.vCount) * 3;
    for (let i = from; i < to; i++) attr.array[i] = on ? Math.round(it.layer.original[i] * 0.35 + HIGHLIGHT[i % 3] * 0.65) : it.layer.original[i];
    attr.needsUpdate = true;
  }
  function select(id) {
    if (selected) paint(selected, false);
    selected = id === selected ? 0 : id;
    if (selected) paint(selected, true);
    requestRender();
    updateLabels();
  }
  function idUnder(e) {
    if (!renderIds()) return 0;
    const r = renderer.domElement.getBoundingClientRect();
    const x = Math.floor(e.clientX - r.left), y = Math.floor(e.clientY - r.top);
    return x < 0 || y < 0 || x >= idW || y >= idH ? 0 : idAt(x, y);
  }
  let down = null;
  renderer.domElement.addEventListener('pointerdown', e => { down = e.isPrimary ? { x: e.clientX, y: e.clientY } : null; });
  renderer.domElement.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
    down = null;
    select(idUnder(e));
  });

  // Double-clic : la structure est retirée pour voir ce qu'elle recouvre (muscles profonds…).
  // Ses triangles sont aplatis sur un sommet, le bouton les rétablit.
  const hidden = new Map();
  const restore = document.createElement('button');
  restore.className = 'file-btn viewer3d-restore';
  restore.hidden = true;
  root.append(restore);
  function updateRestore() {
    restore.hidden = !hidden.size;
    restore.textContent = `Réafficher (${hidden.size})`;
  }
  renderer.domElement.addEventListener('dblclick', e => {
    const id = idUnder(e);
    if (!id || hidden.has(id)) return;
    const it = items[id], index = it.layer.mesh.geometry.index;
    hidden.set(id, index.array.slice(it.iStart, it.iStart + it.iCount));
    index.array.fill(it.vStart, it.iStart, it.iStart + it.iCount);
    index.needsUpdate = true;
    if (selected === id) { paint(id, false); selected = 0; }
    updateRestore();
    requestRender();
    updateLabels();
  });
  restore.addEventListener('click', () => {
    for (const [id, saved] of hidden) {
      const it = items[id], index = it.layer.mesh.geometry.index;
      index.array.set(saved, it.iStart);
      index.needsUpdate = true;
    }
    hidden.clear();
    updateRestore();
    requestRender();
    updateLabels();
  });

  // ── Rendu ──────────────────────────────────────────────────────────────────
  // Rendu à la demande : seulement quand la vue bouge
  let frame = 0;
  const requestRender = () => { if (!frame) frame = requestAnimationFrame(tick); };
  function tick() {
    frame = 0;
    if (controls.update()) requestRender();
    renderer.render(scene, camera);
    placeLabels();
  }
  controls.addEventListener('change', () => { requestRender(); scheduleLabels(); });

  const resize = new ResizeObserver(() => {
    const w = root.clientWidth, h = root.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    requestRender();
    scheduleLabels();
  });
  resize.observe(root);

  // t = 0 : première couche nette ; entre deux crans, les couches voisines se fondent
  function applyWeight(layer) {
    const m = layer.mesh?.material;
    if (!m) return;
    m.opacity = layer.weight;
    m.transparent = layer.weight < 1;
    // Une couche en fondu ne doit pas masquer celle qui apparaît derrière elle
    m.depthWrite = layer.weight >= 1;
    layer.mesh.visible = layer.weight > 0.01;
  }

  // La première couche est attendue, les autres arrivent en arrière-plan
  try {
    await loadLayer(layers[0]);
  } catch (err) {
    renderer.dispose();
    throw err;
  }
  for (const layer of layers.slice(1)) loadLayer(layer).catch(err => console.warn(err));

  return {
    layerNames: layers.map(l => l.name),
    setLabels(htmlList) {
      htmlList.forEach((html, i) => { if (labels[i]) labels[i].text.innerHTML = html; });
    },
    setDepth(t) {
      for (const l of layers) {
        l.weight = Math.max(0, 1 - Math.abs(t - l.depth));
        applyWeight(l);
      }
      requestRender();
      scheduleLabels();
    },
    // factor > 1 rapproche la caméra, < 1 l'éloigne
    zoom(factor) {
      const offset = camera.position.clone().sub(controls.target).divideScalar(factor);
      const d = THREE.MathUtils.clamp(offset.length(), controls.minDistance, controls.maxDistance);
      camera.position.copy(controls.target).add(offset.setLength(d));
      requestRender();
      scheduleLabels();
    },
    reset() {
      controls.target.copy(target);
      camera.position.copy(home);
      requestRender();
      scheduleLabels();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      clearTimeout(labelTimer);
      resize.disconnect();
      controls.dispose();
      for (const l of layers) if (l.mesh) { l.mesh.geometry.dispose(); l.mesh.material.dispose(); }
      idMaterial.dispose();
      idTarget.dispose();
      renderer.dispose();
      root.remove();
    },
  };
}
