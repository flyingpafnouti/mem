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

// Applique les blancs sur les nœuds texte d'un arbre DOM (pour le rendu markdown)
function applyBlankingToNode(node, wordsToBlank, hardcoreWords, difficulty, globalSeed, counter) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    const tokens = text.match(WORD_RE);
    if (!tokens) return;

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
          result += p.blank ? `<span class="blank">${p.text}</span>` : escHtml(p.text);
      } else {
        result += escHtml(token);
      }
    }
    if (hasBlank) {
      const span = document.createElement('span');
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

function process(text, difficulty, isMarkdown) {
  if (!text.trim()) return { html: '', blankedCount: 0, totalWords: 0 };

  const globalSeed = hashStr(text);

  if (isMarkdown) {
    const rendered = marked.parse(text);
    const plain = htmlToPlainText(rendered);
    const { wordsToBlank, hardcoreWords, totalWords } = buildWordsToBlank(plain, difficulty);

    const div = document.createElement('div');
    div.innerHTML = rendered;
    const counter = { count: 0 };
    applyBlankingToNode(div, wordsToBlank, hardcoreWords, difficulty, globalSeed, counter);
    return { html: div.innerHTML, blankedCount: counter.count, totalWords };
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

let isMarkdown = false;

// ── Toggle source ─────────────────────────────────────────────────────────────
const layout        = document.querySelector('.layout');
const hideSourceBtn = document.getElementById('hideSourceBtn');

hideSourceBtn.addEventListener('click', () => {
  const hidden = layout.classList.toggle('source-hidden');
  hideSourceBtn.textContent = hidden ? 'Afficher source' : 'Masquer source';
  hideSourceBtn.classList.toggle('active', hidden);
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
  const words = (text.match(WORD_RE) || []).filter(t => LETTER_RE.test(t[0]));
  statsIn.innerHTML = `<span>${words.length}</span> mots`;

  const { html, blankedCount, totalWords } = process(text, difficulty, isMarkdown);
  outputEl.innerHTML = html;
  outputEl.dataset.mode = isMarkdown ? 'markdown' : 'plain';

  const pct = totalWords ? Math.round(blankedCount / totalWords * 100) : 0;
  statsOut.innerHTML = `<span>${blankedCount}</span> mots masqués sur <span>${totalWords}</span> (${pct}%)`;
}

slider.addEventListener('input', render);
inputEl.addEventListener('input', render);

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  isMarkdown = file.name.endsWith('.md');
  const reader = new FileReader();
  reader.onload = ev => { inputEl.value = ev.target.result; render(); };
  reader.readAsText(file, 'utf-8');
});

inputEl.value = `La robotique moderne repose sur trois piliers fondamentaux : la perception, la planification et l'actuation.
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

render();
