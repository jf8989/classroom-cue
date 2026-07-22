// Injected only into the active tab after the teacher clicks a cue. Playback is
// normal tab audio, so Chrome includes it when “Share tab audio” is enabled.
(() => {
  if (window.__classroomCueVersion === '2') return;
  window.__classroomCueVersion = '2';

  window.__classroomCuePlay = async (soundUrl, volume) => {
    const clip = new Audio(soundUrl);
    clip.preload = 'auto';
    clip.volume = Math.max(0, Math.min(1, volume));
    clip.addEventListener('ended', () => clip.remove(), { once: true });
    await clip.play();
  };
})();
