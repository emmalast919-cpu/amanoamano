/* ============================================================
   A MANO A MANO — Custom Translation System v2
   Free · No API key · No widget overlay
   Persists across ALL pages via localStorage
   ============================================================ */

(function () {
  'use strict';

  const LANG_KEY  = 'amm_lang';
  const CACHE_KEY = 'amm_tc';  /* translation cache */
  const BASE_LANG = 'en';

  const LANGS = [
    { code:'en',    name:'English',           flag:'🇬🇧' },
    { code:'it',    name:'Italiano',           flag:'🇮🇹' },
    { code:'de',    name:'Deutsch',            flag:'🇩🇪' },
    { code:'fr',    name:'Français',           flag:'🇫🇷' },
    { code:'es',    name:'Español',            flag:'🇪🇸' },
    { code:'pt',    name:'Português',          flag:'🇵🇹' },
    { code:'ru',    name:'Русский',            flag:'🇷🇺' },
    { code:'zh-CN', name:'中文 (简体)',          flag:'🇨🇳' },
    { code:'ja',    name:'日本語',              flag:'🇯🇵' },
    { code:'ko',    name:'한국어',              flag:'🇰🇷' },
    { code:'ar',    name:'العربية',            flag:'🇸🇦' },
    { code:'pl',    name:'Polski',             flag:'🇵🇱' },
    { code:'nl',    name:'Nederlands',         flag:'🇳🇱' },
    { code:'sv',    name:'Svenska',            flag:'🇸🇪' },
    { code:'da',    name:'Dansk',              flag:'🇩🇰' },
    { code:'no',    name:'Norsk',              flag:'🇳🇴' },
    { code:'fi',    name:'Suomi',              flag:'🇫🇮' },
    { code:'hu',    name:'Magyar',             flag:'🇭🇺' },
    { code:'ro',    name:'Română',             flag:'🇷🇴' },
    { code:'cs',    name:'Čeština',            flag:'🇨🇿' },
    { code:'sk',    name:'Slovenčina',         flag:'🇸🇰' },
    { code:'bg',    name:'Български',          flag:'🇧🇬' },
    { code:'hr',    name:'Hrvatski',           flag:'🇭🇷' },
    { code:'uk',    name:'Українська',         flag:'🇺🇦' },
    { code:'tr',    name:'Türkçe',             flag:'🇹🇷' },
    { code:'el',    name:'Ελληνικά',           flag:'🇬🇷' },
    { code:'he',    name:'עברית',              flag:'🇮🇱' },
    { code:'hi',    name:'हिन्दी',             flag:'🇮🇳' },
    { code:'vi',    name:'Tiếng Việt',         flag:'🇻🇳' },
    { code:'th',    name:'ภาษาไทย',            flag:'🇹🇭' },
    { code:'id',    name:'Bahasa Indonesia',   flag:'🇮🇩' },
    { code:'ms',    name:'Bahasa Melayu',      flag:'🇲🇾' },
    { code:'sq',    name:'Shqip',              flag:'🇦🇱' },
    { code:'sr',    name:'Српски',             flag:'🇷🇸' },
  ];

  /* ── Cache ── */
  function getCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; }
  }
  function saveCache(c) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch {}
  }

  /* ── Lang prefs ── */
  function getSaved() { return localStorage.getItem(LANG_KEY) || BASE_LANG; }
  function saveLang(c) { localStorage.setItem(LANG_KEY, c); }

  /* ── Single translate via Google unofficial API ── */
  async function apiTranslate(text, target) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${BASE_LANG}&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;
    try {
      const r = await fetch(url);
      const d = await r.json();
      /* response: [ [ ["translated","original"], ... ], ... ] */
      return (d[0] || []).map(p => p[0]).join('');
    } catch {
      return text;
    }
  }

  /* ── Translate with caching ── */
  async function translateText(text, target, cache) {
    const key = `${target}||${text}`;
    if (cache[key] !== undefined) return cache[key];
    const t = await apiTranslate(text, target);
    cache[key] = t;
    return t;
  }

  /* ── Skip tags ── */
  const SKIP = new Set(['SCRIPT','STYLE','NOSCRIPT','META','LINK','TITLE','OPTION']);

  /* ── Collect text nodes, respecting translate="no" and .notranslate ── */
  function collectNodes() {
    const result = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let n;
    while ((n = walker.nextNode())) {
      const p = n.parentElement;
      if (!p) continue;
      if (SKIP.has(p.tagName)) continue;
      /* skip translate="no" and closest ancestor with it */
      if (p.closest('[translate="no"]') || p.closest('.notranslate')) continue;
      const t = n.textContent.trim();
      if (!t || t.length < 2) continue;
      result.push(n);
    }
    return result;
  }

  /* ── Store originals on first run (per page) ── */
  const origMap = new WeakMap();

  function ensureOriginals(nodes) {
    nodes.forEach(n => { if (!origMap.has(n)) origMap.set(n, n.textContent); });
  }

  function getOrig(n) { return origMap.get(n) || n.textContent; }

  /* ── Main translate ── */
  let busy = false;

  async function translatePage(target) {
    if (busy) return;
    busy = true;
    setStatus('translating');

    const nodes = collectNodes();
    ensureOriginals(nodes);

    if (target === BASE_LANG) {
      nodes.forEach(n => { n.textContent = getOrig(n); });
      setStatus('idle');
      busy = false;
      return;
    }

    const cache = getCache();

    /* parallel batches of 6 */
    const BATCH = 6;
    for (let i = 0; i < nodes.length; i += BATCH) {
      const batch = nodes.slice(i, i + BATCH);
      await Promise.all(batch.map(async n => {
        const orig = getOrig(n).trim();
        if (!orig || orig.length < 2) return;
        try {
          const t = await translateText(orig, target, cache);
          /* preserve surrounding whitespace */
          const full = getOrig(n);
          const pre  = full.match(/^\s*/)[0];
          const post = full.match(/\s*$/)[0];
          n.textContent = pre + t + post;
        } catch {}
      }));
    }

    saveCache(cache);
    setStatus('done');
    setTimeout(() => setStatus('idle'), 2000);
    busy = false;
  }

  /* ── Status indicator ── */
  function setStatus(s) {
    document.querySelectorAll('.amm-status').forEach(el => {
      el.dataset.state = s;
      el.textContent = s === 'translating' ? '⟳ Translating…' : s === 'done' ? '✓ Done' : '';
    });
  }

  /* ── Build footer selector ── */
  function buildFooterSelector(container) {
    if (!container) return;
    const cur = getSaved();
    container.innerHTML = `
      <div class="amm-lang-selector">
        <div class="amm-lang-label">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
            <path d="M2 12h20"/>
          </svg>
          Select Language
        </div>
        <select class="amm-lang-select amm-lang-main" aria-label="Language">
          ${LANGS.map(l => `<option value="${l.code}"${l.code===cur?' selected':''}>${l.flag} ${l.name}</option>`).join('')}
        </select>
        <span class="amm-status"></span>
      </div>`;
    container.querySelector('.amm-lang-main').addEventListener('change', async function() {
      const lang = this.value;
      saveLang(lang);
      syncSelectors(lang);
      updateNavBadge(lang);
      await translatePage(lang);
    });
  }

  /* ── Build nav badge ── */
  function buildNavBadge(container) {
    if (!container) return;
    const cur = getSaved();
    const lang = LANGS.find(l => l.code === cur) || LANGS[0];
    container.innerHTML = `
      <button class="amm-nav-lang" title="Select Language" onclick="document.getElementById('amm-footer-lang')?.scrollIntoView({behavior:'smooth',block:'center'})">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
          <path d="M2 12h20"/>
        </svg>
        <span id="amm-nav-text">${lang.flag} ${cur.toUpperCase()}</span>
      </button>`;
  }

  function updateNavBadge(code) {
    const lang = LANGS.find(l => l.code === code) || LANGS[0];
    const el = document.getElementById('amm-nav-text');
    if (el) el.textContent = `${lang.flag} ${code.toUpperCase()}`;
  }

  function syncSelectors(code) {
    document.querySelectorAll('.amm-lang-select').forEach(s => s.value = code);
  }

  /* ── Init ── */
  function init() {
    buildFooterSelector(document.getElementById('amm-footer-lang'));
    buildNavBadge(document.getElementById('amm-nav-lang'));

    const saved = getSaved();
    if (saved !== BASE_LANG) {
      /* wait for DOM to settle */
      setTimeout(() => translatePage(saved), 400);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AMMTranslate = { translate: translatePage, langs: LANGS, getSaved };
})();
