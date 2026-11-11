class SoundEngine {
  private muted: boolean = false;
  private ctx: AudioContext | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private sfxCache: Record<string, HTMLAudioElement> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      const paths: Record<string, string> = {
        chip: '/assets/game/sfx_chip.mp3',
        splash: '/assets/game/sfx_splash.mp3',
        spin: '/assets/game/sfx_spin.mp3',
        win: '/assets/game/sfx_win.mp3',
        result: '/assets/game/sfx_result.mp3',
      };
      Object.entries(paths).forEach(([key, src]) => {
        const audio = new Audio(src);
        audio.preload = 'auto';
        this.sfxCache[key] = audio;
      });

      this.bgmAudio = new Audio('/assets/game/sfx_bgm.mp3');
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0.32;
    }
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    if (this.bgmAudio) {
      if (mute) {
        this.bgmAudio.pause();
      } else {
        this.bgmAudio.play().catch(() => {});
      }
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public startAmbient() {
    if (this.muted || !this.bgmAudio) return;
    if (this.bgmAudio.paused) {
      this.bgmAudio.play().catch(() => {});
    }
  }

  private playClip(key: string, volume = 0.8) {
    if (this.muted) return;
    const base = this.sfxCache[key];
    if (base) {
      try {
        const clone = base.cloneNode() as HTMLAudioElement;
        clone.volume = volume;
        clone.play().catch(() => {});
      } catch {
        // Fallback handled by Web Audio
      }
    }
  }

  public playChipPlace() {
    if (this.muted) return;
    this.startAmbient();
    this.playClip('chip', 0.85);

    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.065);
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.065);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  }

  public playWheelPegTick(speedRatio = 1) {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const baseFreq = 750 + Math.min(450, speedRatio * 350);
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.028);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.032);
  }

  public playMultiplierSplash() {
    if (this.muted) return;
    this.playClip('splash', 0.9);
  }

  public playSpinLoop() {
    if (this.muted) return;
    this.playClip('spin', 0.85);
  }

  public playResultChime(isWin: boolean) {
    if (this.muted) return;
    if (isWin) {
      this.playClip('win', 0.95);
    } else {
      this.playClip('result', 0.85);
    }
  }

  public playTimerBeep(secondsLeft: number) {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(secondsLeft <= 2 ? 620 : 520, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }
}

export const soundEngine = new SoundEngine();
