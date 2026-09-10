(() => {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-video-dialog]').forEach(button => {
      const dialog = document.getElementById(button.dataset.videoDialog);
      if (!dialog || typeof dialog.showModal !== 'function') return;
      button.disabled = false;
      button.addEventListener('click', () => dialog.showModal());
      dialog.querySelector('[data-video-close]').addEventListener('click', () => dialog.close());
      dialog.addEventListener('close', () => {
        dialog.querySelectorAll('video').forEach(video => video.pause());
        button.focus({ preventScroll: true });
      });
      dialog.addEventListener('click', event => {
        const box = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
      });
    });
  });
})();
