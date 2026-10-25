// ── Thème ────────────────────────────────────────────────────────────────────
const html = document.documentElement;
const toggleTrack = document.getElementById('toggleTrack');

const savedTheme = localStorage.getItem('memorize-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
if (savedTheme === 'dark') toggleTrack.classList.add('on');

document.getElementById('themeToggle').addEventListener('click', () => {
  const isDark = html.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  toggleTrack.classList.toggle('on', next === 'dark');
  localStorage.setItem('memorize-theme', next);
});

// ── PRNG déterministe (mulberry32) ───────────────────────────────────────────
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function fisherYates(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Algorithme ───────────────────────────────────────────────────────────────
const WORD_RE   = /[a-zA-ZÀ-ÿ']+|[^a-zA-ZÀ-ÿ']+/g;
const LETTER_RE = /[a-zA-ZÀ-ÿ]/;

function wordComplexity(w) {
  return [...w].filter(c => LETTER_RE.test(c)).length;
}

function blankWord(word, difficulty, wordSeed, hideInitial = false) {
  const chars = [...word];
  const letterDiff = Math.min(difficulty, 1);
  const blankable = chars.map((c, i) => i).filter(i => (hideInitial ? i >= 0 : i > 0) && LETTER_RE.test(chars[i]));
  if (!blankable.length) return { parts: [{ text: word, blank: false }] };

  const nBlank = Math.min(Math.max(1, Math.round(blankable.length * letterDiff)), blankable.length);
  const rng = mulberry32(wordSeed);
  const toBlank = new Set(fisherYates(blankable, rng).slice(0, nBlank));

  const parts = [];
  let cur = '', curBlank = false;
  for (let i = 0; i < chars.length; i++) {
    const isBlank = toBlank.has(i);
    if (isBlank !== curBlank && cur !== '') {
      parts.push({ text: cur, blank: curBlank });
      cur = '';
    }
    cur += isBlank ? '_' : chars[i];
    curBlank = isBlank;
  }
  if (cur) parts.push({ text: cur, blank: curBlank });
  return { parts };
}

// Extrait le texte brut depuis du HTML (pour compter les mots du markdown)
function htmlToPlainText(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent;
}

// Extrait le texte d'une carte SVG : un nœud texte par étiquette, séparés par des espaces
// (textContent collerait « Caroline » et « du Sud », écrits sur deux tspan)
// Mémorisé : une planche anatomique pèse près de 1 Mo et le curseur redemande le texte à chaque pas
let plainCache = { svg: null, text: '' };

function svgToPlainText(svgHtml) {
  if (plainCache.svg === svgHtml) return plainCache.text;
  const tmp = document.createElement('div');
  tmp.innerHTML = svgHtml;
  const walker = document.createTreeWalker(tmp, NodeFilter.SHOW_TEXT);
  const parts = [];
  while (walker.nextNode()) parts.push(walker.currentNode.textContent);
  plainCache = { svg: svgHtml, text: parts.join(' ') };
  return plainCache.text;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

// Applique les blancs sur les nœuds texte d'un arbre DOM (rendu markdown ou carte SVG)
function applyBlankingToNode(node, wordsToBlank, hardcoreWords, difficulty, globalSeed, counter) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    const tokens = text.match(WORD_RE);
    if (!tokens) return;

    // Dans un SVG, un span HTML ne s'affiche pas : il faut un tspan
    const inSvg = node.parentNode.namespaceURI === SVG_NS;
    const tag = inSvg ? 'tspan' : 'span';
    let hasBlank = false;
    let result = '';
    for (const token of tokens) {
      const key = token.toLowerCase();
      if (LETTER_RE.test(token[0]) && wordsToBlank.has(key)) {
        hasBlank = true;
        counter.count++;
        const wordSeed = (globalSeed ^ hashStr(key)) >>> 0;
        const { parts } = blankWord(token, difficulty, wordSeed, hardcoreWords.has(key));
        for (const p of parts)
          result += p.blank ? `<${tag} class="blank">${p.text}</${tag}>` : escHtml(p.text);
      } else {
        result += escHtml(token);
      }
    }
    if (hasBlank) {
      const span = inSvg ? document.createElementNS(SVG_NS, 'tspan') : document.createElement('span');
      span.innerHTML = result;
      node.parentNode.replaceChild(span, node);
    }
  } else if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
    for (const child of [...node.childNodes])
      applyBlankingToNode(child, wordsToBlank, hardcoreWords, difficulty, globalSeed, counter);
  }
}

function buildWordsToBlank(plainText, difficulty) {
  const tokens = plainText.match(WORD_RE) || [];
  const wordTokens = tokens.filter(t => LETTER_RE.test(t[0]));
  const unique = [...new Set(wordTokens.map(w => w.toLowerCase()))];
  unique.sort((a, b) => wordComplexity(a) - wordComplexity(b));

  const clampedDiff  = Math.min(difficulty, 1);
  const hardcoreFactor = Math.max(0, difficulty - 1); // 0→1 pour d ∈ [1,2]

  const nToBlank = Math.round(unique.length * clampedDiff);
  const blankedSlice = unique.slice(unique.length - nToBlank);
  const wordsToBlank = new Set(blankedSlice);

  // Parmi les mots déjà blanqués, les plus complexes perdent aussi leur initiale
  const nHardcore = Math.round(blankedSlice.length * hardcoreFactor);
  const hardcoreWords = new Set(blankedSlice.slice(blankedSlice.length - nHardcore));

  return { wordsToBlank, hardcoreWords, totalWords: wordTokens.length };
}

// ── Maths (MathJax) ──────────────────────────────────────────────────────────
// $$…$$ (bloc) et $…$ (en ligne, sans espace collé aux délimiteurs pour ignorer « 5 $ »)
const MATH_RE = /\$\$([\s\S]+?)\$\$|\$(?!\s)([^$\n]+?)(?<!\s)\$/g;

// Remplace chaque formule par un span vide avant marked, pour que ni marked
// ni le masquage ne touchent au LaTeX
function extractMath(text) {
  const maths = [];
  const out = text.replace(MATH_RE, (_, block, inline) => {
    const display = block !== undefined;
    maths.push({ tex: (display ? block : inline).trim(), display });
    return `<span class="math" data-i="${maths.length - 1}"></span>`;
  });
  return { text: out, maths };
}

const mathCache = new Map();

function mathNode(tex, display) {
  const key = (display ? 'D:' : 'I:') + tex;
  if (!mathCache.has(key)) {
    try {
      mathCache.set(key, MathJax.tex2svg(tex, { display }));
    } catch {
      // Extension TeX à charger en asynchrone : on rend à nouveau une fois prête
      MathJax.tex2svgPromise(tex, { display }).then(node => {
        mathCache.set(key, node);
        render();
      });
      return null;
    }
  }
  return mathCache.get(key).cloneNode(true);
}

function typesetMath(root, maths) {
  const ready = typeof window.MathJax?.tex2svg === 'function';
  for (const el of root.querySelectorAll('.math')) {
    const { tex, display } = maths[el.dataset.i];
    const node = ready ? mathNode(tex, display) : null;
    if (node) el.replaceChildren(node);
    else el.textContent = display ? `$$${tex}$$` : `$${tex}$`;
  }
}

function process(text, difficulty, mode) {
  if (!text.trim()) return { html: '', blankedCount: 0, totalWords: 0 };

  const globalSeed = hashStr(text);

  // Fiche 3D : chaque étiquette est masquée à part, la scène n'est pas reconstruite
  if (mode === '3d') {
    const names = parse3d(text).labels.map(l => l.name);
    const { wordsToBlank, hardcoreWords, totalWords } = buildWordsToBlank(names.join('\n'), difficulty);
    const counter = { count: 0 };
    const labelsHtml = names.map(name => {
      const div = document.createElement('div');
      div.textContent = name;
      applyBlankingToNode(div, wordsToBlank, hardcoreWords, difficulty, globalSeed, counter);
      return div.innerHTML;
    });
    return { labelsHtml, blankedCount: counter.count, totalWords };
  }

  // Carte SVG : seuls les textes des étiquettes sont masqués, les tracés restent intacts
  if (mode === 'svg') {
    const { wordsToBlank, hardcoreWords, totalWords } = buildWordsToBlank(svgToPlainText(text), difficulty);
    const div = document.createElement('div');
    div.innerHTML = text;
    const counter = { count: 0 };
    applyBlankingToNode(div, wordsToBlank, hardcoreWords, difficulty, globalSeed, counter);
    return { html: div.innerHTML, blankedCount: counter.count, totalWords };
  }

  if (mode === 'markdown') {
    const { text: mdText, maths } = extractMath(text);
    const rendered = marked.parse(mdText);
    const plain = htmlToPlainText(rendered);
    const { wordsToBlank, hardcoreWords, totalWords } = buildWordsToBlank(plain, difficulty);

    const div = document.createElement('div');
    div.innerHTML = rendered;
    const counter = { count: 0 };
    applyBlankingToNode(div, wordsToBlank, hardcoreWords, difficulty, globalSeed, counter);
    return { html: div.innerHTML, blankedCount: counter.count, totalWords, maths };
  }

  // Texte brut
  const { wordsToBlank, hardcoreWords, totalWords } = buildWordsToBlank(text, difficulty);
  if (!totalWords) return { html: escHtml(text), blankedCount: 0, totalWords: 0 };

  const tokens = text.match(WORD_RE) || [];
  let html = '', blankedCount = 0;

  for (const token of tokens) {
    const key = token.toLowerCase();
    if (LETTER_RE.test(token[0]) && wordsToBlank.has(key)) {
      blankedCount++;
      const wordSeed = (globalSeed ^ hashStr(key)) >>> 0;
      const { parts } = blankWord(token, difficulty, wordSeed, hardcoreWords.has(key));
      for (const p of parts)
        html += p.blank ? `<span class="blank">${p.text}</span>` : escHtml(p.text);
    } else {
      html += escHtml(token);
    }
  }

  return { html, blankedCount, totalWords };
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── UI ───────────────────────────────────────────────────────────────────────
const slider    = document.getElementById('slider');
const diffVal   = document.getElementById('diffVal');
const inputEl   = document.getElementById('input');
const outputEl  = document.getElementById('output');
const statsIn   = document.getElementById('statsIn');
const statsOut  = document.getElementById('statsOut');
const fileInput = document.getElementById('fileInput');

// 'plain', 'markdown' ou 'svg', d'après l'extension du fichier chargé
let mode = 'plain';

// ── Toggle source ─────────────────────────────────────────────────────────────
const hideSourceBtn = document.getElementById('hideSourceBtn');

hideSourceBtn.addEventListener('click', () => {
  const hidden = document.body.classList.toggle('source-hidden');
  hideSourceBtn.textContent = hidden ? 'Afficher source' : 'Masquer source';
  hideSourceBtn.classList.toggle('active', hidden);
  hideSourceBtn.title = hidden ? 'Afficher le texte source' : 'Masquer le texte source';
});

function updateSliderTrack() {
  // Le slider va de 0 à 200 ; la moitié (100) = difficulté 1
  const pct = slider.value / 2; // 0–100%
  slider.style.setProperty('--pct', pct + '%');
  const hardcore = slider.value > 100;
  slider.classList.toggle('hardcore', hardcore);
}

function render() {
  const difficulty = slider.value / 100;
  const hardcore = difficulty > 1;
  diffVal.textContent = difficulty.toFixed(2);
  diffVal.classList.toggle('hardcore', hardcore);
  updateSliderTrack();

  const text = inputEl.value;
  if (mode === '3d') {
    try {
      parse3d(text);
    } catch (err) {
      // Source modifiée à la main et devenue invalide : on le signale sans casser la vue
      statsIn.textContent = `Fiche 3D illisible : ${err.message}`;
      return;
    }
  }
  // Pour une carte ou une fiche 3D, on ne compte que les étiquettes
  const counted = mode === 'svg' ? svgToPlainText(text)
    : mode === '3d' ? parse3d(text).labels.map(l => l.name).join('\n')
    : text;
  const words = (counted.match(WORD_RE) || []).filter(t => LETTER_RE.test(t[0]));
  statsIn.innerHTML = `<span>${words.length}</span> mots`;

  const { html, labelsHtml, blankedCount, totalWords, maths = [] } = process(text, difficulty, mode);
  outputEl.dataset.mode = mode;
  zoomControls.hidden = mode !== 'svg' && mode !== '3d';
  if (mode === '3d') {
    // La main de déplacement des cartes zoomées ne doit pas intercepter la rotation
    outputEl.classList.remove('zoomed');
    applyDepth();
    show3d(text, labelsHtml);
  } else {
    close3d();
    // Le contenu est remplacé à chaque mouvement du curseur : on garde le zoom et la position
    const { scrollLeft, scrollTop } = outputEl;
    outputEl.innerHTML = html;
    typesetMath(outputEl, maths, difficulty, hashStr(text));
    applyZoom();
    applyDepth();
    outputEl.scrollLeft = scrollLeft;
    outputEl.scrollTop = scrollTop;
  }

  const pct = totalWords ? Math.round(blankedCount / totalWords * 100) : 0;
  statsOut.innerHTML = `<span>${blankedCount}</span> mots masqués sur <span>${totalWords}</span> (${pct}%)`;
}

slider.addEventListener('input', render);
inputEl.addEventListener('input', render);

// ── Zoom des cartes ──────────────────────────────────────────────────────────
const zoomControls = document.getElementById('zoomControls');
const ZOOM_STEP = 1.5;
const ZOOM_MAX = 8;
let zoom = 1;

function applyZoom() {
  const svg = mode === 'svg' && outputEl.querySelector('svg');
  if (svg) svg.style.width = svg.style.height = `${zoom * 100}%`;
  outputEl.classList.toggle('zoomed', Boolean(svg) && zoom > 1);
}

// Change le zoom en gardant fixe le point au centre de la vue
function setZoom(next) {
  next = Math.min(Math.max(next, 1), ZOOM_MAX);
  if (next === zoom) return;
  const cx = (outputEl.scrollLeft + outputEl.clientWidth / 2) / outputEl.scrollWidth;
  const cy = (outputEl.scrollTop + outputEl.clientHeight / 2) / outputEl.scrollHeight;
  zoom = next;
  applyZoom();
  outputEl.scrollLeft = cx * outputEl.scrollWidth - outputEl.clientWidth / 2;
  outputEl.scrollTop = cy * outputEl.scrollHeight - outputEl.clientHeight / 2;
}

// En 3D, les boutons rapprochent ou éloignent la caméra
document.getElementById('zoomIn').addEventListener('click', () =>
  mode === '3d' ? viewer3d?.zoom(ZOOM_STEP) : setZoom(zoom * ZOOM_STEP));
document.getElementById('zoomOut').addEventListener('click', () =>
  mode === '3d' ? viewer3d?.zoom(1 / ZOOM_STEP) : setZoom(zoom / ZOOM_STEP));

// Carte zoomée : on la déplace en la tirant à la souris (au doigt, le défilement natif suffit)
let drag = null;

outputEl.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse' || e.button !== 0 || !outputEl.classList.contains('zoomed')) return;
  drag = { x: e.clientX, y: e.clientY, left: outputEl.scrollLeft, top: outputEl.scrollTop };
  outputEl.setPointerCapture(e.pointerId);
  outputEl.classList.add('dragging');
  e.preventDefault();
});

outputEl.addEventListener('pointermove', e => {
  if (!drag) return;
  outputEl.scrollLeft = drag.left - (e.clientX - drag.x);
  outputEl.scrollTop = drag.top - (e.clientY - drag.y);
});

function endDrag() {
  drag = null;
  outputEl.classList.remove('dragging');
}

outputEl.addEventListener('pointerup', endDrag);
outputEl.addEventListener('pointercancel', endDrag);

// ── Profondeur des planches à calques (organes → os) ─────────────────────────
// Un SVG dont les groupes portent data-depth (0, 1, 2…) se parcourt comme une radio :
// chaque calque est net à sa profondeur et se fond dans ses voisins entre deux crans.
// Les groupes sans data-depth (la silhouette) restent toujours affichés.
const depthControls = document.getElementById('depthControls');
const depthSlider   = document.getElementById('depthSlider');
const depthLabel    = document.getElementById('depthLabel');
const depthTicks    = document.getElementById('depthTicks');

function applyDepth() {
  // Fiche 3D : les couches sont des maillages, le visualiseur gère leur fondu
  if (mode === '3d') {
    const names = viewer3d?.layerNames ?? [];
    depthControls.hidden = names.length < 2;
    if (!viewer3d) return;
    depthSlider.max = (names.length - 1) * 100;
    const t = depthSlider.value / 100;
    viewer3d.setDepth(t);
    showDepthTicks(names, t);
    return;
  }
  const layers = mode === 'svg' ? [...outputEl.querySelectorAll('svg [data-depth]')] : [];
  depthControls.hidden = !layers.length;
  if (!layers.length) return;
  depthSlider.max = (layers.length - 1) * 100;
  const t = depthSlider.value / 100;
  for (const layer of layers) {
    const opacity = Math.max(0, 1 - Math.abs(t - Number(layer.dataset.depth)));
    layer.style.opacity = opacity;
    layer.style.visibility = opacity ? '' : 'hidden';
  }
  const names = [];
  for (const l of layers) names[Number(l.dataset.depth)] = l.dataset.layer ?? '';
  showDepthTicks(names, t);
}

// Une graduation par couche, sous le curseur ; un clic dessus y amène directement
function showDepthTicks(names, t) {
  const key = names.join('|');
  if (depthTicks.dataset.key !== key) {
    depthTicks.dataset.key = key;
    depthTicks.replaceChildren(...names.map((name, i) => {
      const tick = document.createElement('button');
      tick.className = 'depth-tick';
      tick.title = name;
      tick.style.left = `calc(8px + ${names.length > 1 ? i / (names.length - 1) : 0} * (100% - 16px))`;
      tick.addEventListener('click', () => snapDepth(i));
      return tick;
    }));
  }
  const current = Math.round(t);
  [...depthTicks.children].forEach((tick, i) => tick.classList.toggle('current', i === current));
  depthLabel.textContent = names[current] ?? '';
}

// Au relâchement, le curseur glisse jusqu'à la couche la plus proche : jamais d'entre-deux
let snapFrame = 0;
function snapDepth(layer = Math.round(depthSlider.value / 100)) {
  cancelAnimationFrame(snapFrame);
  const from = Number(depthSlider.value), to = layer * 100, start = performance.now();
  const step = now => {
    const k = Math.min(1, (now - start) / 180);
    depthSlider.value = from + (to - from) * (1 - (1 - k) ** 3);
    applyDepth();
    if (k < 1) snapFrame = requestAnimationFrame(step);
  };
  snapFrame = requestAnimationFrame(step);
}

depthSlider.addEventListener('input', () => { cancelAnimationFrame(snapFrame); applyDepth(); });
depthSlider.addEventListener('change', () => snapDepth());
// Flèches : d'une couche à la suivante
depthSlider.addEventListener('keydown', e => {
  const dir = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
  if (!dir) return;
  e.preventDefault();
  const last = Number(depthSlider.max) / 100;
  snapDepth(Math.max(0, Math.min(last, Math.round(depthSlider.value / 100) + dir)));
});

// ── Fiches 3D (anatomie) ─────────────────────────────────────────────────────
// La source est un manifeste JSON (maillage, étiquettes) ; Three.js n'est chargé qu'à
// l'ouverture d'une telle fiche. Le curseur ne change que le texte des étiquettes.
let parsed3d = { text: null, data: null };
let viewer3d = null;
let viewer3dSource = null;   // texte du manifeste affiché (ou en cours de chargement)
let pendingLabels = [];
let sourceName = '';

function parse3d(text) {
  if (parsed3d.text !== text) {
    const data = JSON.parse(text);
    if (!Array.isArray(data.labels)) throw new Error('liste « labels » absente');
    parsed3d = { text, data };
  }
  return parsed3d.data;
}

function close3d() {
  viewer3d?.dispose();
  viewer3d = null;
  viewer3dSource = null;
}

async function show3d(text, labelsHtml) {
  pendingLabels = labelsHtml;
  if (viewer3dSource === text) {
    viewer3d?.setLabels(labelsHtml);
    return;
  }
  close3d();
  viewer3dSource = text;
  outputEl.textContent = 'Chargement du modèle 3D…';
  try {
    const { createViewer } = await import('./viewer3d.js');
    const viewer = await createViewer(outputEl, parse3d(text), new URL(sourceName, location.href));
    // Une autre fiche a pu être ouverte pendant le chargement
    if (viewer3dSource !== text) { viewer.dispose(); return; }
    viewer3d = viewer;
    viewer3d.setLabels(pendingLabels);
    applyDepth();
  } catch (err) {
    if (viewer3dSource === text) outputEl.textContent = `Impossible d'afficher le modèle 3D : ${err.message}`;
  }
}

function loadText(text, name) {
  mode = name.endsWith('.md') ? 'markdown' : name.endsWith('.svg') ? 'svg'
    : name.endsWith('.3d.json') ? '3d' : 'plain';
  sourceName = name;
  zoom = 1;
  depthSlider.value = 0;
  inputEl.value = text;
  render();
}

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    loadText(ev.target.result, file.name);
    exampleSelect.value = '';
  };
  reader.readAsText(file, 'utf-8');
  fileInput.value = '';
});

// ── Exemples ─────────────────────────────────────────────────────────────────
const exampleSelect = document.getElementById('exampleSelect');

const DEFAULT_EXAMPLE = 'exemples/departements.md';

// Chemins des exemples, dans l'ordre du menu
const EXAMPLES = [...exampleSelect.options].map(o => o.value).filter(Boolean);
let currentExample = EXAMPLES.indexOf(DEFAULT_EXAMPLE);

async function loadExample(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(res.status);
  loadText(await res.text(), path);
  currentExample = EXAMPLES.indexOf(path);
  // Le menu affiche l'exemple courant, utile pour se repérer en naviguant au clavier ou au doigt
  exampleSelect.value = path;
}

async function tryLoadExample(path) {
  try {
    await loadExample(path);
  } catch {
    // fetch échoue en file:// : il faut servir la page via un serveur HTTP
    statsIn.textContent = `Impossible de charger ${path} (ouvrir la page via un serveur local)`;
  }
}

exampleSelect.addEventListener('change', () => {
  // Rend le focus à la page pour que les flèches naviguent tout de suite
  exampleSelect.blur();
  if (exampleSelect.value) tryLoadExample(exampleSelect.value);
});

// Exemple suivant (step = 1) ou précédent (step = -1), en bouclant sur la liste
function stepExample(step) {
  const n = EXAMPLES.length;
  const i = currentExample < 0 ? (step > 0 ? 0 : n - 1) : (currentExample + step + n) % n;
  tryLoadExample(EXAMPLES[i]);
}

// ── Navigation : flèches gauche/droite sur PC, balayage horizontal sur tablette ─
document.addEventListener('keydown', e => {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  // Les flèches gardent leur rôle dans le texte source, le menu et le curseur de profondeur
  if (e.target.closest('textarea, select, #depthSlider')) return;
  // Sur le curseur de difficulté, gauche/droite changent de fiche ; haut/bas règlent toujours la difficulté
  e.preventDefault();
  stepExample(e.key === 'ArrowRight' ? 1 : -1);
});

// Haut/bas règlent la difficulté depuis n'importe où, sauf en 3D
const ARROW_DIFFICULTY_STEP = 5;
document.addEventListener('keydown', e => {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
  if (mode === '3d') return;
  // Le curseur de difficulté gère déjà ses flèches ; texte, menu et profondeur gardent les leurs
  if (e.target.closest('textarea, select, input[type="range"]')) return;
  e.preventDefault();
  const step = e.key === 'ArrowUp' ? ARROW_DIFFICULTY_STEP : -ARROW_DIFFICULTY_STEP;
  slider.value = Number(slider.value) + step;
  render();
});

const SWIPE_MIN_PX = 60;
let touchStart = null;

outputEl.addEventListener('touchstart', e => {
  // Les formules, blocs de code larges et cartes zoomées défilent horizontalement : pas de changement de fiche
  // En 3D, glisser fait tourner le corps
  const scrollsX = e.target.closest('mjx-container, pre') || (mode === 'svg' && zoom > 1) || mode === '3d';
  touchStart = e.touches.length === 1 && !scrollsX
    ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
    : null;
}, { passive: true });

outputEl.addEventListener('touchend', e => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  touchStart = null;
  // Geste nettement horizontal, pour ne pas confondre avec le défilement vertical
  if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < 2 * Math.abs(dy)) return;
  // Balayer vers la gauche fait venir la fiche suivante, comme on tourne une page
  stepExample(dx < 0 ? 1 : -1);
});

// Texte de secours si l'exemple par défaut ne peut pas être chargé (file://)
const FALLBACK_TEXT = `La robotique moderne repose sur trois piliers fondamentaux : la perception, la planification et l'actuation.
Les capteurs proprioceptifs mesurent l'état interne du robot, tandis que les capteurs extéroceptifs,
comme les lidars et les caméras stéréoscopiques, permettent de reconstruire une représentation
tridimensionnelle de l'environnement.

Les algorithmes de localisation et de cartographie simultanées, connus sous l'acronyme SLAM,
permettent à un robot autonome de construire une carte de son environnement tout en estimant
sa propre position à l'intérieur de celle-ci. Ces méthodes reposent généralement sur des filtres
bayésiens tels que le filtre de Kalman étendu ou les filtres particulaires.

La planification de trajectoire consiste à déterminer une séquence d'états permettant au robot
de passer d'une configuration initiale à une configuration cible tout en évitant les obstacles.
Les algorithmes probabilistes comme RRT (Rapidly-exploring Random Trees) et ses variantes
sont largement utilisés pour résoudre ces problèmes dans des espaces de configuration de haute dimension.`;

loadExample(DEFAULT_EXAMPLE).catch(() => loadText(FALLBACK_TEXT, ''));
