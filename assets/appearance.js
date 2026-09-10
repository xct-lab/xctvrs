(() => {
  const key = 'xctvrs_appearance';
  const choices = ['light', 'dark', 'system'];
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = 'system';
  try { const saved = localStorage.getItem(key); if (choices.includes(saved)) preference = saved; } catch {}
  const apply = () => {
    const theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelectorAll('[data-appearance]').forEach(select => { select.value = preference; });
  };
  apply();
  system.addEventListener('change', apply);
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.querySelectorAll('[data-appearance]').forEach(select => select.addEventListener('change', () => {
      if (!choices.includes(select.value)) return;
      preference = select.value;
      try { localStorage.setItem(key, preference); } catch {}
      apply();
    }));
  });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) {
      preference = choices.includes(event.newValue) ? event.newValue : 'system';
      apply();
    }
  });
})();
