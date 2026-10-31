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

// Découpage du texte courant : seules les lettres sont masquables
const TEXT_TOKENS = { word: WORD_RE, char: LETTER_RE };
// Colonne clé d'une fiche permutée : les chiffres se masquent aussi (« 01 », « 2A », « 1789 »)
const KEY_TOKENS = { word: /[a-zA-ZÀ-ÿ0-9']+|[^a-zA-ZÀ-ÿ0-9']+/g, char: /[a-zA-ZÀ-ÿ0-9]/ };

function wordComplexity(w, charRe) {
  return [...w].filter(c => charRe.test(c)).length;
}

function blankWord(word, difficulty, wordSeed, hideInitial = false, charRe = LETTER_RE) {
  const chars = [...word];
  const letterDiff = Math.min(difficulty, 1);
  const blankable = chars.map((c, i) => i).filter(i => (hideInitial ? i >= 0 : i > 0) && charRe.test(chars[i]));
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
// Mémorisé : une grande carte pèse plusieurs centaines de ko et le curseur redemande le texte à chaque pas
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
function applyBlankingToNode(node, wordsToBlank, hardcoreWords, difficulty, globalSeed, counter, tok = TEXT_TOKENS) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    const tokens = text.match(tok.word);
    if (!tokens) return;

    // Dans un SVG, un span HTML ne s'affiche pas : il faut un tspan
    const inSvg = node.parentNode.namespaceURI === SVG_NS;
    const tag = inSvg ? 'tspan' : 'span';
    let hasBlank = false;
    let result = '';
    for (const token of tokens) {
      const key = token.toLowerCase();
      if (tok.char.test(token[0]) && wordsToBlank.has(key)) {
        hasBlank = true;
        counter.count++;
        const wordSeed = (globalSeed ^ hashStr(key)) >>> 0;
        // Un nombre n'a pas d'initiale à laisser en indice
        const hideInitial = hardcoreWords.has(key) || /^[0-9]/.test(token);
        const { parts } = blankWord(token, difficulty, wordSeed, hideInitial, tok.char);
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
      applyBlankingToNode(child, wordsToBlank, hardcoreWords, difficulty, globalSeed, counter, tok);
  }
}

function buildWordsToBlank(plainText, difficulty, tok = TEXT_TOKENS) {
  const tokens = plainText.match(tok.word) || [];
  const wordTokens = tokens.filter(t => tok.char.test(t[0]));
  const unique = [...new Set(wordTokens.map(w => w.toLowerCase()))];
  unique.sort((a, b) => wordComplexity(a, tok.char) - wordComplexity(b, tok.char));

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

// Une formule passe par le MathML : on y remplace des symboles par des « _ » avant le rendu SVG
const mmlCache = new Map();
const svgCache = new Map();

function mathMml(tex, display) {
  const key = (display ? 'D:' : 'I:') + tex;
  if (!mmlCache.has(key)) {
    try {
      mmlCache.set(key, MathJax.tex2mml(tex, { display }));
    } catch {
      // Extension TeX à charger en asynchrone : on rend à nouveau une fois prête
      MathJax.tex2mmlPromise(tex, { display }).then(mml => {
        mmlCache.set(key, mml);
        render();
      });
      return null;
    }
  }
  return new DOMParser().parseFromString(mmlCache.get(key), 'application/xml').documentElement;
}

function mathSvg(math) {
  const mml = new XMLSerializer().serializeToString(math);
  if (!svgCache.has(mml)) svgCache.set(mml, MathJax.mathml2svg(mml));
  return svgCache.get(mml).cloneNode(true);
}

// Les parenthèses, séparateurs et opérateurs invisibles (⁡, ⁢) portent la structure : jamais masqués
const MATH_KEEP_RE = /^[()[\]{}|‖⟨⟩⌊⌋⌈⌉,;.:!⁡-⁤]*$/;

function mathLeaves(math) {
  const content = [], ops = [];
  for (const el of math.getElementsByTagName('*')) {
    const text = el.textContent.trim();
    if (!text) continue;
    if (el.localName === 'mi' || el.localName === 'mn') content.push(el);
    else if (el.localName === 'mo' && !MATH_KEEP_RE.test(text)) ops.push(el);
  }
  return { content, ops };
}

// Ordre de masquage stable par symbole : monter le curseur ne fait qu'ajouter des blancs
function pickKeys(leaves, fraction, seed) {
  const keys = [...new Set(leaves.map(el => el.textContent.trim()))];
  keys.sort((a, b) => ((seed ^ hashStr(a)) >>> 0) - ((seed ^ hashStr(b)) >>> 0));
  return new Set(keys.slice(0, Math.round(keys.length * fraction)));
}

function blankLeaf(el) {
  el.textContent = '_'.repeat([...el.textContent.trim()].length);
  el.setAttribute('class', 'blank');
  // L'italique et les alphabets spéciaux (ℝ, 𝒟) n'ont pas de glyphe « _ »
  if (el.localName === 'mi') el.setAttribute('mathvariant', 'normal');
  if (el.localName === 'mo') el.setAttribute('stretchy', 'false');
}

// Variables et nombres partent avec la difficulté ; les opérateurs ensuite, en mode hardcore.
// Un symbole masqué l'est dans toutes les formules, comme un mot dans le texte.
// En fiche permutée (keysOnly), seules les formules de la colonne clé sont masquées.
function typesetMath(root, maths, difficulty, seed, keysOnly = false) {
  const ready = typeof window.MathJax?.tex2mml === 'function';
  const els = [...root.querySelectorAll('.math')];
  const trees = els.map(el => {
    const { tex, display } = maths[el.dataset.i];
    return ready ? mathMml(tex, display) : null;
  });

  const all = { content: [], ops: [] };
  const leaves = trees.map((math, i) => {
    const blankable = math && (!keysOnly || els[i].closest('.col-key'));
    const l = blankable ? mathLeaves(math) : { content: [], ops: [] };
    all.content.push(...l.content);
    all.ops.push(...l.ops);
    return l;
  });
  const contentKeys = pickKeys(all.content, Math.min(difficulty, 1), seed);
  const opKeys = pickKeys(all.ops, Math.max(0, difficulty - 1), seed);

  els.forEach((el, i) => {
    const math = trees[i];
    if (!math) {
      const { tex, display } = maths[el.dataset.i];
      el.textContent = display ? `$$${tex}$$` : `$${tex}$`;
      return;
    }
    for (const leaf of leaves[i].content) if (contentKeys.has(leaf.textContent.trim())) blankLeaf(leaf);
    for (const leaf of leaves[i].ops) if (opKeys.has(leaf.textContent.trim())) blankLeaf(leaf);
    el.replaceChildren(mathSvg(math));
  });
}

// ── Fiches en colonnes ───────────────────────────────────────────────────────
// Une fiche à colonnes est une liste de lignes « clé — reste » ou « clé : reste »
const COLUMN_SEP_RE = / — | : /;
const COLUMN_MIN_RATIO = 0.8;

function hasColumns(root) {
  const items = [...root.querySelectorAll('li')];
  const split = items.filter(li => COLUMN_SEP_RE.test(li.textContent));
  return items.length > 0 && split.length >= items.length * COLUMN_MIN_RATIO;
}

// Enveloppe la première colonne de la ligne dans un .col-key
function wrapKeyColumn(li) {
  const walker = document.createTreeWalker(li, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const at = node.textContent.search(COLUMN_SEP_RE);
    if (at < 0) continue;
    const range = document.createRange();
    range.setStart(li, 0);
    range.setEnd(node, at);
    const key = document.createElement('span');
    key.className = 'col-key';
    key.append(range.extractContents());
    li.prepend(key);
    return key;
  }
  return null;
}

// Regroupe toutes les lignes dans une seule liste mélangée. Les intertitres disparaissent :
// « 01–10 » n'a plus de sens une fois l'ordre perdu, et il trahirait le numéro.
function shuffleItems(root, seed) {
  const items = [...root.querySelectorAll('li')];
  const list = document.createElement('ul');
  list.append(...fisherYates(items, mulberry32(seed)));
  const children = [...root.children];
  const first = children.findIndex((el, i) => i > 0 && /^(H[1-6]|UL|OL)$/.test(el.tagName));
  children.slice(first).forEach(el => el.remove());
  root.append(list);
}

function process(text, difficulty, mode) {
  if (!text.trim()) return { html: '', blankedCount: 0, totalWords: 0 };

  const globalSeed = hashStr(text);

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
    const div = document.createElement('div');
    div.innerHTML = rendered;
    const columns = hasColumns(div);
    const counter = { count: 0 };

    if (columns && shuffled) shuffleItems(div, (globalSeed ^ shuffleSeed) >>> 0);

    if (columns && swapped) {
      const keys = [...div.querySelectorAll('li')].map(wrapKeyColumn).filter(Boolean);
      // Mélangées ici pour que le curseur masque les clés au hasard, pas de la dernière à la première
      const keyText = fisherYates(keys.map(k => k.textContent), mulberry32(globalSeed)).join(' ');
      const { wordsToBlank, hardcoreWords, totalWords } = buildWordsToBlank(keyText, difficulty, KEY_TOKENS);
      for (const key of keys)
        applyBlankingToNode(key, wordsToBlank, hardcoreWords, difficulty, globalSeed, counter, KEY_TOKENS);
      return { html: div.innerHTML, blankedCount: counter.count, totalWords, maths, columns };
    }

    const { wordsToBlank, hardcoreWords, totalWords } = buildWordsToBlank(plain, difficulty);
    applyBlankingToNode(div, wordsToBlank, hardcoreWords, difficulty, globalSeed, counter);
    return { html: div.innerHTML, blankedCount: counter.count, totalWords, maths, columns };
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

// Vue des fiches en colonnes ; conservée d'une fiche à l'autre
let swapped = false;
let shuffled = false;
let shuffleSeed = 0;

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
  // Pour une carte, on ne compte que les étiquettes
  const counted = mode === 'svg' ? svgToPlainText(text) : text;
  const words = (counted.match(WORD_RE) || []).filter(t => LETTER_RE.test(t[0]));
  statsIn.innerHTML = `<span>${words.length}</span> mots`;

  const { html, blankedCount, totalWords, maths = [], columns = false } = process(text, difficulty, mode);
  viewControls.hidden = !columns;
  outputEl.dataset.mode = mode;
  zoomControls.hidden = mode !== 'svg';
  // Le contenu est remplacé à chaque mouvement du curseur : on garde le zoom et la position
  const { scrollLeft, scrollTop } = outputEl;
  outputEl.innerHTML = html;
  typesetMath(outputEl, maths, difficulty, hashStr(text), columns && swapped);
  applyZoom();
  applyDepth();
  outputEl.scrollLeft = scrollLeft;
  outputEl.scrollTop = scrollTop;

  const pct = totalWords ? Math.round(blankedCount / totalWords * 100) : 0;
  statsOut.innerHTML = `<span>${blankedCount}</span> mots masqués sur <span>${totalWords}</span> (${pct}%)`;
}

slider.addEventListener('input', render);
inputEl.addEventListener('input', render);

// ── Permutation et mélange des fiches en colonnes ────────────────────────────
const viewControls = document.getElementById('viewControls');
const swapBtn      = document.getElementById('swapBtn');
const shuffleBtn   = document.getElementById('shuffleBtn');

function setPressed(btn, on) {
  btn.classList.toggle('active', on);
  btn.setAttribute('aria-pressed', on);
}

swapBtn.addEventListener('click', () => {
  swapped = !swapped;
  setPressed(swapBtn, swapped);
  render();
});

// Chaque activation produit un nouvel ordre ; le curseur, lui, ne le change pas
shuffleBtn.addEventListener('click', () => {
  shuffled = !shuffled;
  shuffleSeed = Math.floor(Math.random() * 2 ** 32);
  setPressed(shuffleBtn, shuffled);
  render();
  outputEl.scrollTop = 0;
});

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

document.getElementById('zoomIn').addEventListener('click', () => setZoom(zoom * ZOOM_STEP));
document.getElementById('zoomOut').addEventListener('click', () => setZoom(zoom / ZOOM_STEP));

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

// ── Profondeur des planches à calques ────────────────────────────────────────
// Un SVG dont les groupes portent data-depth (0, 1, 2…) se parcourt comme une radio :
// chaque calque est net à sa profondeur et se fond dans ses voisins entre deux crans.
// Les groupes sans data-depth (le fond commun) restent toujours affichés.
const depthControls = document.getElementById('depthControls');
const depthSlider   = document.getElementById('depthSlider');
const depthLabel    = document.getElementById('depthLabel');
const depthTicks    = document.getElementById('depthTicks');

function applyDepth() {
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

function loadText(text, name) {
  mode = name.endsWith('.md') ? 'markdown' : name.endsWith('.svg') ? 'svg' : 'plain';
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

// Haut/bas règlent la difficulté depuis n'importe où
const ARROW_DIFFICULTY_STEP = 5;
document.addEventListener('keydown', e => {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
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
  const scrollsX = e.target.closest('mjx-container, pre') || (mode === 'svg' && zoom > 1);
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
