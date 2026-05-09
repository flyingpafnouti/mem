'use strict';

const { Plugin, ItemView, MarkdownRenderer } = require('obsidian');

const VIEW_TYPE = 'memorize-view';

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

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

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
          result += p.blank ? `<span class="memorize-blank">${p.text}</span>` : escHtml(p.text);
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

  const clampedDiff    = Math.min(difficulty, 1);
  const hardcoreFactor = Math.max(0, difficulty - 1);

  const nToBlank = Math.round(unique.length * clampedDiff);
  const blankedSlice = unique.slice(unique.length - nToBlank);
  const wordsToBlank = new Set(blankedSlice);

  const nHardcore = Math.round(blankedSlice.length * hardcoreFactor);
  const hardcoreWords = new Set(blankedSlice.slice(blankedSlice.length - nHardcore));

  return { wordsToBlank, hardcoreWords, totalWords: wordTokens.length };
}

// ── Vue Memorize ─────────────────────────────────────────────────────────────
class MemorizeView extends ItemView {
  constructor(leaf) {
    super(leaf);
    this.difficulty = 0;
    this.currentFile = null;
  }

  getViewType()    { return VIEW_TYPE; }
  getDisplayText() { return 'Memorize'; }
  getIcon()        { return 'brain'; }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass('memorize-container');

    // Slider
    const sliderWrap = container.createDiv('memorize-slider-wrap');
    sliderWrap.createEl('label', { text: 'Difficulté', cls: 'memorize-label' });
    const slider = sliderWrap.createEl('input');
    slider.type  = 'range';
    slider.min   = '0';
    slider.max   = '200';
    slider.value = '0';
    slider.step  = '1';
    slider.addClass('memorize-slider');
    const diffVal = sliderWrap.createSpan({ cls: 'memorize-diff-val', text: '0.00' });

    // Stats
    const stats = container.createDiv('memorize-stats');

    // Output
    const output = container.createDiv('memorize-output');

    const render = async () => {
      const difficulty = slider.value / 100;
      this.difficulty  = difficulty;
      diffVal.textContent = difficulty.toFixed(2);
      diffVal.toggleClass('hardcore', difficulty > 1);
      slider.toggleClass('hardcore', difficulty > 1);

      const pct = (slider.value / 2);
      slider.style.setProperty('--pct', pct + '%');

      const file = this.app.workspace.getActiveFile();
      if (!file || file.extension !== 'md') {
        output.empty();
        output.createEl('p', { text: 'Ouvre une note Markdown pour commencer.', cls: 'memorize-placeholder' });
        stats.empty();
        return;
      }

      const content = await this.app.vault.cachedRead(file);

      output.empty();
      await MarkdownRenderer.render(this.app, content, output, file.path, this);

      const plainText = output.textContent || '';
      const { wordsToBlank, hardcoreWords, totalWords } = buildWordsToBlank(plainText, difficulty);
      const globalSeed = hashStr(content);
      const counter = { count: 0 };
      applyBlankingToNode(output, wordsToBlank, hardcoreWords, difficulty, globalSeed, counter);

      stats.empty();
      const pctBlanked = totalWords ? Math.round(counter.count / totalWords * 100) : 0;
      stats.innerHTML =
        `<span class="memorize-stat-val">${counter.count}</span> mots masqués sur ` +
        `<span class="memorize-stat-val">${totalWords}</span> (${pctBlanked}%)`;
    };

    slider.addEventListener('input', render);

    this.registerEvent(this.app.workspace.on('active-leaf-change', render));
    this.registerEvent(this.app.vault.on('modify', (file) => {
      if (file === this.app.workspace.getActiveFile()) render();
    }));

    await render();
  }

  async onClose() {}
}

// ── Plugin ───────────────────────────────────────────────────────────────────
class MemorizePlugin extends Plugin {
  async onload() {
    this.registerView(VIEW_TYPE, (leaf) => new MemorizeView(leaf));

    this.addRibbonIcon('brain', 'Memorize', () => this.activateView());

    this.addCommand({
      id: 'open-memorize-view',
      name: 'Ouvrir la vue Memorize',
      callback: () => this.activateView(),
    });
  }

  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
    }
    workspace.revealLeaf(leaf);
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }
}

module.exports = MemorizePlugin;
