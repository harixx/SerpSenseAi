// F1 Racing Audio Generator using Web Audio API
export class F1AudioEngine {
  private audioContext: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNode: GainNode | null = null;
  private isPlaying = false;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0.1; // Start with low volume
    } catch (error) {
      console.log('Web Audio API not supported');
    }
  }

  private createF1EngineSound() {
    if (!this.audioContext || !this.gainNode) return;

    // Stop any existing oscillators
    this.stop();

    // Create multiple oscillators for rich F1 engine sound
    const frequencies = [
      180, // Base engine frequency
      360, // First harmonic
      540, // Second harmonic
      720, // Third harmonic
      900, // Fourth harmonic
    ];

    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const oscGain = this.audioContext!.createGain();
      
      // Use sawtooth wave for aggressive F1 sound
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(freq, this.audioContext!.currentTime);
      
      // Set different volumes for each harmonic
      const volumes = [0.8, 0.6, 0.4, 0.3, 0.2];
      oscGain.gain.value = volumes[index] || 0.1;
      
      // Add frequency modulation for engine character
      const lfo = this.audioContext!.createOscillator();
      const lfoGain = this.audioContext!.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 3 + (index * 0.5); // Different modulation rates
      lfoGain.gain.value = freq * 0.02; // Subtle frequency modulation
      
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);
      lfo.start();
      
      oscillator.connect(oscGain);
      if (this.gainNode) {
        oscGain.connect(this.gainNode);
      }
      oscillator.start();
      
      this.oscillators.push(oscillator, lfo);
    });

    // Add engine rev variations
    this.addEngineRevs();
  }

  private addEngineRevs() {
    if (!this.audioContext || !this.gainNode) return;

    // Create engine rev sound variations
    const revInterval = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(revInterval);
        return;
      }

      this.oscillators.forEach((osc, index) => {
        if (osc.frequency && Math.random() > 0.7) {
          // Random engine revs
          const currentFreq = osc.frequency.value;
          const targetFreq = currentFreq * (1 + (Math.random() * 0.1 - 0.05));
          
          osc.frequency.exponentialRampToValueAtTime(
            targetFreq, 
            this.audioContext!.currentTime + 0.1
          );
          
          // Return to base frequency
          setTimeout(() => {
            if (osc.frequency) {
              osc.frequency.exponentialRampToValueAtTime(
                currentFreq,
                this.audioContext!.currentTime + 0.1
              );
            }
          }, 200);
        }
      });
    }, 1000 + Math.random() * 2000); // Random intervals between 1-3 seconds
  }

  public start() {
    if (this.isPlaying) return;
    
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
    
    this.isPlaying = true;
    this.createF1EngineSound();
    console.log('F1 synthetic audio engine started');
  }

  public stop() {
    this.isPlaying = false;
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    this.oscillators = [];
  }

  public setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(volume, this.audioContext!.currentTime);
    }
  }

  public isActive() {
    return this.isPlaying;
  }
}