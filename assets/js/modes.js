// Modlar bölümü: sekmeler ve her moddaki telefonda kendiliğinden dönen
// ekranlar. JS yoksa üç mod alt alta görünür.
const INTERVAL = 3600;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function setupCarousel(panel) {
  const images = [...panel.querySelectorAll('.phone__screen img')];
  const dots = panel.querySelector('[data-dots]');
  let index = 0;
  let timer = null;
  let paused = false;

  const show = (next) => {
    index = (next + images.length) % images.length;
    images.forEach((img, i) => img.classList.toggle('is-active', i === index));
    dots?.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-current', String(i === index)));
  };

  if (dots && images.length > 1) {
    images.forEach((img, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', img.alt || String(i + 1));
      button.addEventListener('click', () => {
        show(i);
        restart();
      });
      dots.append(button);
    });
    show(0);
  }

  const tick = () => {
    if (!paused && !document.hidden) show(index + 1);
  };
  const stop = () => {
    clearInterval(timer);
    timer = null;
  };
  const restart = () => {
    stop();
    if (images.length > 1 && !reducedMotion) timer = setInterval(tick, INTERVAL);
  };

  panel.addEventListener('pointerenter', () => (paused = true));
  panel.addEventListener('pointerleave', () => (paused = false));
  panel.addEventListener('focusin', () => (paused = true));
  panel.addEventListener('focusout', () => (paused = false));

  return { start: restart, stop };
}

export function initModes() {
  const tablist = document.querySelector('.modes__tabs');
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
  const carousels = panels.map(setupCarousel);

  const select = (index, focus = false) => {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
      if (active) {
        panels[i].classList.add('is-visible');
        carousels[i].start();
      } else {
        carousels[i].stop();
      }
    });
    if (focus) tabs[index].focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (event) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (event.key === 'Home') select(0, true);
      else if (event.key === 'End') select(tabs.length - 1, true);
      else if (step) select((i + step + tabs.length) % tabs.length, true);
      else return;
      event.preventDefault();
    });
  });

  tablist.hidden = false;
  select(0);
}
