// Mağaza bağlantıları. App Store sürümü yayına girene kadar <html> üzerinde
// data-appstore="soon" durur: App Store düğmeleri "Yakında" der ve
// tıklanmaz (görünüşü base.css'te). Yayına girince değeri "live" yapmak yeter.
import { currentLang } from './lang.js';

const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.hkn.hainkim';
const APP_STORE_URL = 'https://apps.apple.com/app/id6829238414';

const root = document.documentElement;
const appStoreLive = () => root.dataset.appstore !== 'soon';

function platform() {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  // iPad'ler kendini masaüstü Safari olarak tanıtır; dokunmatik Mac yoktur.
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  return 'other';
}

function apply() {
  const playUrl = `${PLAY_URL}&hl=${currentLang()}`;
  const live = appStoreLive();
  for (const a of document.querySelectorAll('a[data-store="play"]')) a.href = playUrl;
  for (const a of document.querySelectorAll('a[data-store="apple"]')) {
    a.href = APP_STORE_URL;
    if (live) {
      a.removeAttribute('aria-disabled');
      a.removeAttribute('tabindex');
    } else {
      a.setAttribute('aria-disabled', 'true');
      a.tabIndex = -1;
    }
  }
  // Üst menüdeki "İndir": telefonun kendi mağazası, yoksa sayfadaki iki düğme.
  const os = platform();
  for (const a of document.querySelectorAll('a[data-store="auto"]')) {
    if (os === 'android') a.href = playUrl;
    else if (os === 'ios' && live) a.href = APP_STORE_URL;
    else a.href = '#indir';
  }
}

export function initStores() {
  root.classList.toggle('is-ios', platform() === 'ios');
  // Yakında durumundaki düğme klavyeyle de açılmasın.
  document.addEventListener('click', (event) => {
    if (event.target.closest?.('a[data-store="apple"][aria-disabled="true"]')) event.preventDefault();
  });
  apply();
  document.addEventListener('langchange', apply);
}
