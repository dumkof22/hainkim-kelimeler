// Sitenin giriş noktası: her bölüm kendi modülünde.
import { initCategories } from './categories.js';
import { initHowto } from './howto.js';
import { initLang } from './lang.js';
import { initModes } from './modes.js';

// Kayan şeridin kesintisiz dönmesi için listeyi bir kez daha ekler.
function initBand() {
  const list = document.querySelector('[data-band]');
  if (!list) return;
  const copy = list.cloneNode(true);
  copy.removeAttribute('data-band');
  list.after(copy);
}

function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const update = () => nav.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', update, { passive: true });
  update();
}

function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );
  items.forEach((el) => observer.observe(el));
}

initBand();
initLang();
initNav();
initModes();
initHowto();
initReveal();
initCategories();
