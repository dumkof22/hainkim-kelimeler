// Sayfa dili: Türkçe metinler HTML'de durur, diğer diller i18n/<dil>.js'ten
// gelir. İlk seçimi <head> içindeki küçük betik yapar (html[data-lang]).
import en from './i18n/en.js';

const dictionaries = { en };
const STORAGE_KEY = 'hk-lang';
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.hkn.hainkim';

const root = document.documentElement;
let current = root.dataset.lang || 'tr';

export const currentLang = () => current;

/** [key]'in geçerli dildeki metni; Türkçede (ya da çeviri yoksa) [fallback]. */
export function t(key, fallback = '') {
  return current === 'tr' ? fallback : dictionaries[current]?.[key] ?? fallback;
}

// Türkçe asıllar ilk dokunuşta elemanın üzerine saklanır.
function original(el, slot, read) {
  const name = `i18nTr${slot}`;
  if (!(name in el.dataset)) el.dataset[name] = read();
  return el.dataset[name];
}

function applyTexts() {
  for (const el of document.querySelectorAll('[data-i18n]')) {
    el.innerHTML = t(el.dataset.i18n, original(el, '', () => el.innerHTML));
  }
  for (const el of document.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of el.dataset.i18nAttr.split(',')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      const slot = attr.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
      el.setAttribute(attr, t(key, original(el, slot, () => el.getAttribute(attr) ?? '')));
    }
  }
}

function applyMeta() {
  const titleKey = document.body.dataset.titleKey || 'metaTitle';
  document.title = t(titleKey, original(document.body, 'Title', () => document.title));
}

function applyScreens() {
  for (const img of document.querySelectorAll('img[data-screen]')) {
    const src = img.getAttribute('src');
    const next = src.replace(/screens\/[a-z]{2}\//, `screens/${current}/`);
    if (next !== src) img.setAttribute('src', next);
  }
}

function applyLinks() {
  for (const a of document.querySelectorAll('a[data-play]')) {
    a.href = `${PLAY_URL}&hl=${current}`;
  }
}

function applySwitches() {
  for (const button of document.querySelectorAll('.lang-switch [data-lang]')) {
    button.setAttribute('aria-pressed', String(button.dataset.lang === current));
  }
}

export function setLang(lang, { remember = false } = {}) {
  if (lang !== 'tr' && !dictionaries[lang]) return;
  current = lang;
  root.lang = lang;
  root.dataset.lang = lang;
  applyTexts();
  applyMeta();
  applyScreens();
  applyLinks();
  applySwitches();
  root.classList.remove('lang-pending');

  if (remember) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Gizli pencerede depolama kapalı olabilir; tercih bu oturumla sınırlı kalır.
    }
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', lang);
      history.replaceState(null, '', url);
    }
  }
  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

export function initLang() {
  for (const button of document.querySelectorAll('.lang-switch [data-lang]')) {
    button.addEventListener('click', () => setLang(button.dataset.lang, { remember: true }));
  }
  setLang(current);
}
