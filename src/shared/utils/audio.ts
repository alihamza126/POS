/**
 * Audio utility for playing notification sounds in the POS system.
 * Uses the Web Audio API for lightweight, dependency-free sound generation.
 */

class AudioService {
  private context: AudioContext | null = null;

  private getContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.context;
  }

  /**
   * Plays a "Ka-Ching" style success sound using synthesized oscillators.
   */
  public playSuccess() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Create multiple oscillators for a richer "coin" sound
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.2, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + duration);
      };

      // Play a sequence of high-pitched tones
      playTone(880, now, 0.1); // A5
      playTone(1320, now + 0.05, 0.15); // E6
      playTone(1760, now + 0.1, 0.2); // A6
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }

  /**
   * Plays a simple notification beep.
   */
  public playNotification() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }

  /**
   * Plays a warning tone (lower pitch alert).
   */
  public playWarning() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }
}

export const audioService = new AudioService();
