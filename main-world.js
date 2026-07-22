// Runs in the Meet page's main world at document_start. It replaces only the
// audio track returned to Meet with a microphone + cue mix; video tracks and
// every other browser API call are left unchanged.
let context;
let mixDestination;

function audio() {
  if (!context) {
    context = new AudioContext();
    mixDestination = context.createMediaStreamDestination();
  }
  if (context.state === 'suspended') context.resume().catch(() => {});
  return context;
}

function mixMicrophone(stream) {
  const ctx = audio();
  if (!stream.getAudioTracks().length) return stream;
  const source = ctx.createMediaStreamSource(stream);
  const gain = ctx.createGain();
  gain.gain.value = 1;
  source.connect(gain).connect(mixDestination);
  const mixedStream = new MediaStream([
    ...stream.getVideoTracks(),
    mixDestination.stream.getAudioTracks()[0]
  ]);
  stream.addEventListener('inactive', () => {
    try { source.disconnect(); gain.disconnect(); } catch (_) { /* already disconnected */ }
  }, { once: true });
  return mixedStream;
}

const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
navigator.mediaDevices.getUserMedia = async (constraints) => {
  const stream = await originalGetUserMedia(constraints);
  const audioRequested = constraints?.audio && constraints.audio !== false;
  return audioRequested ? mixMicrophone(stream) : stream;
};

function tone(frequency, start, duration, { type = 'sine', gain = 0.18, endFrequency = frequency } = {}) {
  const ctx = audio();
  const oscillator = ctx.createOscillator(); const envelope = ctx.createGain();
  oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), start + duration);
  envelope.gain.setValueAtTime(.0001, start);
  envelope.gain.exponentialRampToValueAtTime(gain, start + Math.min(.02, duration / 4));
  envelope.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(envelope).connect(mixDestination); oscillator.start(start); oscillator.stop(start + duration + .02);
}

function noise(start, duration, gain = .12, highpass = 500) {
  const ctx = audio(); const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource(); const filter = ctx.createBiquadFilter(); const envelope = ctx.createGain();
  filter.type = 'highpass'; filter.frequency.value = highpass;
  envelope.gain.setValueAtTime(gain, start); envelope.gain.exponentialRampToValueAtTime(.0001, start + duration);
  source.buffer = buffer; source.connect(filter).connect(envelope).connect(mixDestination);
  source.start(start); source.stop(start + duration);
}

const cues = {
  applause() { const now = audio().currentTime; for (let i = 0; i < 26; i += 1) noise(now + i * .045 + Math.random() * .025, .07 + Math.random() * .05, .045 + Math.random() * .035, 900); },
  cheer() { const now = audio().currentTime; [523, 659, 784, 1047].forEach((f, i) => tone(f, now + i * .1, .38, { type: 'triangle', gain: .13 })); noise(now + .05, .55, .045, 1400); },
  fanfare() { const now = audio().currentTime; [[523, .0], [659, .13], [784, .26], [1047, .42]].forEach(([f, d]) => tone(f, now + d, .35, { type: 'square', gain: .075 })); },
  trombone() { const now = audio().currentTime; tone(280, now, .8, { type: 'sawtooth', gain: .13, endFrequency: 92 }); },
  boing() { const now = audio().currentTime; tone(170, now, .38, { type: 'sine', gain: .23, endFrequency: 710 }); tone(710, now + .38, .27, { type: 'sine', gain: .12, endFrequency: 220 }); },
  rimshot() { const now = audio().currentTime; noise(now, .04, .19, 1800); tone(170, now, .17, { type: 'triangle', gain: .16, endFrequency: 115 }); noise(now + .11, .12, .14, 2600); },
  bell() { const now = audio().currentTime; [880, 1320, 1760].forEach((f) => tone(f, now, 1.4, { type: 'sine', gain: .06 })); },
  whoosh() { const now = audio().currentTime; noise(now, .42, .15, 250); tone(220, now, .36, { type: 'sine', gain: .055, endFrequency: 920 }); },
  drumroll() { const now = audio().currentTime; for (let i = 0; i < 20; i += 1) { const delay = i * .045; noise(now + delay, .06, .11, 600); if (i > 14) tone(95, now + delay, .07, { type: 'triangle', gain: .09, endFrequency: 70 }); } tone(220, now + .96, .42, { type: 'triangle', gain: .2, endFrequency: 100 }); }
};

window.addEventListener('classroom-cue-play', (event) => {
  const cue = cues[event.detail?.sound];
  if (cue) cue();
});
