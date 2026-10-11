// "Bir tur nasıl geçer?": geniş ekranda sağdaki telefon, ekranın ortasına
// gelen adımın görüntüsünü gösterir. Dar ekranda her adımın kendi telefonu var.
export function initHowto() {
  const steps = [...document.querySelectorAll('.step[data-step]')];
  const screen = document.querySelector('[data-howto-screen]');
  if (!steps.length || !screen || !('IntersectionObserver' in window)) return;

  const activate = (step) => {
    steps.forEach((s) => s.classList.toggle('is-active', s === step));
    for (const img of screen.querySelectorAll('img')) {
      img.classList.toggle('is-active', img.dataset.screen === step.dataset.step);
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activate(entry.target);
      }
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  steps.forEach((step) => observer.observe(step));
  activate(steps[0]);
}
