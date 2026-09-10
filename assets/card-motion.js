// Scroll-entry fallback for browsers without CSS view timelines. Content is never hidden.
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    if (CSS.supports('animation-timeline: view()') || !('IntersectionObserver' in window)) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const cards = [...document.querySelectorAll('.card-animation-layer')];
    let observer;
    const stop = () => { observer?.disconnect(); cards.forEach(card => card.getAnimations().forEach(animation => animation.cancel())); };
    const start = () => {
      stop();
      if (motion.matches) return;
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          if (entry.target.matches(':focus-within') || entry.target.querySelector('dialog[open]')) continue;
          const side = getComputedStyle(entry.target).getPropertyValue('--side').trim() === '-1' ? -1 : 1;
          entry.target.animate([{transform:`scale(.85) rotate(${side * 5}deg)`},{transform:'scale(1) rotate(0deg)'}],{duration:650,easing:'cubic-bezier(.2,.7,.2,1)'});
        }
      }, {threshold:.08});
      cards.forEach(card => observer.observe(card));
    };
    cards.forEach(card => card.addEventListener('focusin', () => card.getAnimations().forEach(animation => animation.cancel())));
    motion.addEventListener('change', start);
    start();
  });
})();
