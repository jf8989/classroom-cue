// Injected only into the active tab after the teacher clicks a cue. Playback is
// normal tab audio, so Chrome includes it when “Share tab audio” is enabled.
(() => {
  if (window.__classroomCuePlay) return;

  window.__classroomCuePlay = async (soundUrl) => {
    const clip = new Audio(soundUrl);
    clip.preload = 'auto';
    clip.volume = .9;
    clip.addEventListener('ended', () => clip.remove(), { once: true });
    await clip.play();
  };
})();
