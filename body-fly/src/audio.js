// Small synthesized sound set: no external audio assets or download delay.
export class GameAudio {
  constructor() {
    this.context = null;
    this.lastShotAt = -Infinity;
    this.shotSound = new Audio('./assets/sounds/bullet_sound.mp3');
    this.music = new Audio('./assets/music/Dogfight Over Dawn.mp3');
    this.music.loop = true;
    this.music.volume = 0.2;
    this.music.preload = 'auto';
    this.explosionSounds = [
      './assets/sounds/explosion-1.mp3',
      './assets/sounds/explosion-2.mp3',
      './assets/sounds/explosion-3.mp3',
      './assets/sounds/explosion-4.mp3',
    ].map((source) => new Audio(source));
    this.shotSound.preload = 'auto';
    this.explosionSounds.forEach((sound) => { sound.preload = 'auto'; });
  }

  unlock() {
    if (!this.context) {
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') this.context.resume();
    // Start only after a child-friendly interaction; browsers otherwise block
    // autoplay with sound.
    if (this.music.paused) this.music.play().catch(() => {});
  }

  isReady() {
    return Boolean(this.context);
  }

  updateListener(position) {
    if (!this.context) return;
    const now = this.context.currentTime;
    const listener = this.context.listener;
    listener.positionX.setTargetAtTime(position.x, now, 0.05);
    listener.positionY.setTargetAtTime(position.y, now, 0.05);
    listener.positionZ.setTargetAtTime(position.z, now, 0.05);
  }

  createEnemyBuzz() {
    if (!this.context) return null;
    const oscillator = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    const panner = this.context.createPanner();
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = 78;
    filter.type = 'lowpass';
    filter.frequency.value = 260;
    gain.gain.value = 0.028;
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 18;
    panner.maxDistance = 420;
    panner.rolloffFactor = 1.3;
    oscillator.connect(filter).connect(gain).connect(panner).connect(this.context.destination);
    oscillator.start();
    return { oscillator, panner };
  }

  updateEnemyBuzz(buzz, position, velocity, listenerPosition, listenerVelocity) {
    if (!buzz) return;
    const now = this.context.currentTime;
    buzz.panner.positionX.setTargetAtTime(position.x, now, 0.05);
    buzz.panner.positionY.setTargetAtTime(position.y, now, 0.05);
    buzz.panner.positionZ.setTargetAtTime(position.z, now, 0.05);

    // Doppler pitch from the relative closing speed. Spatial attenuation and
    // left/right panning still come from the native PannerNode.
    const dx = listenerPosition.x - position.x;
    const dy = listenerPosition.y - position.y;
    const dz = listenerPosition.z - position.z;
    const distance = Math.max(0.001, Math.hypot(dx, dy, dz));
    const closingSpeed = ((velocity.x - listenerVelocity.x) * dx
      + (velocity.y - listenerVelocity.y) * dy
      + (velocity.z - listenerVelocity.z) * dz) / distance;
    const pitch = 78 * Math.min(1.55, Math.max(0.62, 85 / (85 - closingSpeed)));
    buzz.oscillator.frequency.setTargetAtTime(pitch, now, 0.08);
  }

  stopEnemyBuzz(buzz) {
    if (!buzz) return;
    buzz.oscillator.stop();
    buzz.oscillator.disconnect();
    buzz.panner.disconnect();
  }

  playSound(template, volume) {
    const sound = template.cloneNode();
    sound.volume = volume;
    sound.play().catch(() => {});
  }

  shoot() {
    const now = performance.now();
    // W fires two visual projectiles, but each burst should always have one
    // crisp sound. The gate also prevents duplicate browser key events stacking it.
    if (now - this.lastShotAt < 90) return;
    this.lastShotAt = now;
    this.playSound(this.shotSound, 0.34);
  }

  explode() {
    const sound = this.explosionSounds[
      Math.floor(Math.random() * this.explosionSounds.length)
    ];
    this.playSound(sound, 0.55);
  }
}
