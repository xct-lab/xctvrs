(() => {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-video-dialog]').forEach(button => {
      const dialog = document.getElementById(button.dataset.videoDialog);
      if (!dialog || typeof dialog.showModal !== 'function') return;
      button.disabled = false;
      button.addEventListener('click', () => {
        dialog.showModal();
        if (dialog.querySelector('video')) return;
        const number = dialog.id.match(/^question-video-(\d+)$/)?.[1];
        if (!number || Number(number) < 1 || Number(number) > 12) return;
        const language = document.documentElement.lang.startsWith('fr') ? 'lsq' : 'asl';
        const placeholder = dialog.querySelector('.video-placeholder');
        const video = document.createElement('video');
        video.controls = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.hidden = true;
        video.style.cssText = 'width:100%;max-height:65vh;object-fit:contain';
        video.setAttribute('aria-labelledby', `video-title-${number}`);
        video.addEventListener('loadedmetadata', () => {
          video.hidden = false;
          if (placeholder) placeholder.style.display = 'none';
        });
        video.addEventListener('error', () => {
          video.remove();
          if (placeholder) placeholder.style.removeProperty('display');
        });
        dialog.append(video);
        video.src = `/assets/videos/${language}/question-${number.padStart(2, '0')}.mp4`;
      });
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
