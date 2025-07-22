import { logger } from './logger';

// F1 Racing Audio Generator using Web Audio API
export class F1AudioEngine {
  private audioContext: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNode: GainNode | null = null;
  private isPlaying = false;

  constructor() {
    logger.log('Initializing F1 Heavy Metal Audio Engine...');
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0.1; // Start with low volume
      logger.log('F1 Heavy Metal Audio Context initialized successfully');
      logger.log('Audio Context state:', this.audioContext.state);
    } catch (error) {
      // Silently handle audio context errors for professional website
      return;
    }
  }

  private createF1EngineSound() {
    if (!this.audioContext || !this.gainNode) {
      console.error('Audio context or gain node not available');
      return;
    }

    logger.log('Creating heavy metal F1 engine sound...');
    
    // Stop any existing oscillators
    this.stop();

    // Create multiple oscillators for heavy metal F1 engine sound with deep bass
    const frequencies = [
      80,  // Deep bass foundation
      120, // Sub-bass rumble
      180, // Base engine frequency
      240, // Low-mid punch
      360, // First harmonic
      480, // Heavy mid
      720, // Aggressive high-mid
      960, // Sharp harmonics
    ];

    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const oscGain = this.audioContext!.createGain();
      const distortion = this.audioContext!.createWaveShaper();
      
      // Use different wave types for heavy metal character
      const waveTypes: OscillatorType[] = ['sawtooth', 'square', 'sawtooth', 'square', 'sawtooth', 'triangle', 'sawtooth', 'square'];
      oscillator.type = waveTypes[index] || 'sawtooth';
      oscillator.frequency.setValueAtTime(freq, this.audioContext!.currentTime);
      
      // Heavy bass emphasis and aggressive volumes
      const volumes = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.25];
      oscGain.gain.value = volumes[index] || 0.1;
      
      // Add distortion for heavy metal character
      distortion.curve = this.createDistortionCurve(freq < 200 ? 80 : 50);
      distortion.oversample = '4x';
      
      // Add frequency modulation for engine character
      const lfo = this.audioContext!.createOscillator();
      const lfoGain = this.audioContext!.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 3 + (index * 0.5); // Different modulation rates
      lfoGain.gain.value = freq * 0.02; // Subtle frequency modulation
      
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);
      lfo.start();
      
      oscillator.connect(distortion);
      distortion.connect(oscGain);
      if (this.gainNode) {
        oscGain.connect(this.gainNode);
      }
      oscillator.start();
      
      this.oscillators.push(oscillator, lfo);
    });

    logger.log(`Created ${frequencies.length} heavy metal F1 oscillators`);
    
    // Add engine rev variations and heavy metal beat
    this.addEngineRevs();
    this.addHeavyMetalBeat();
    
    logger.log('Heavy metal F1 engine sound created successfully!');
  }

  private createDistortionCurve(amount: number): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    
    return curve;
  }

  private addHeavyMetalBeat() {
    if (!this.audioContext || !this.gainNode) return;

    // Create kick drum pattern for heavy metal beat
    const kickFreq = 60; // Deep kick frequency
    const beatInterval = 500; // 120 BPM heavy metal tempo
    
    const createKick = () => {
      if (!this.isPlaying) return;
      
      const kickOsc = this.audioContext!.createOscillator();
      const kickGain = this.audioContext!.createGain();
      const kickFilter = this.audioContext!.createBiquadFilter();
      
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(kickFreq, this.audioContext!.currentTime);
      
      // Kick drum envelope
      kickGain.gain.setValueAtTime(0, this.audioContext!.currentTime);
      kickGain.gain.exponentialRampToValueAtTime(0.8, this.audioContext!.currentTime + 0.01);
      kickGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.1);
      
      // Low-pass filter for thump
      kickFilter.type = 'lowpass';
      kickFilter.frequency.value = 100;
      kickFilter.Q.value = 10;
      
      kickOsc.connect(kickFilter);
      kickFilter.connect(kickGain);
      if (this.gainNode) {
        kickGain.connect(this.gainNode);
      }
      
      kickOsc.start();
      kickOsc.stop(this.audioContext!.currentTime + 0.1);
    };

    // Heavy metal kick pattern: strong on 1 and 3
    const beatPattern = () => {
      if (!this.isPlaying) return;
      
      createKick(); // Beat 1
      setTimeout(() => {
        if (this.isPlaying) createKick(); // Beat 3
      }, beatInterval / 2);
      
      setTimeout(beatPattern, beatInterval);
    };
    
    beatPattern();
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
    if (this.isPlaying) {
      logger.log('F1 audio engine already playing');
      return;
    }
    
    logger.log('🔥 STARTING F1 HEAVY METAL AUDIO ENGINE 🔥');
    logger.log('AudioContext state:', this.audioContext?.state);
    
    if (!this.audioContext || !this.gainNode) {
      logger.error('Audio context or gain node missing!');
      return;
    }
    
    // Force audio context to start with proper error handling
    this.audioContext.resume().then(() => {
      logger.log('✅ Audio context running - creating sounds...');
      this.isPlaying = true;
      this.createF1EngineSound();
      logger.log('🤘 HEAVY METAL F1 AUDIO IS NOW PLAYING! 🤘');
    }).catch(e => {
      // Silently handle autoplay policy violations - no console errors
      this.isPlaying = true;
      this.createF1EngineSound();
      logger.log('🤘 HEAVY METAL F1 AUDIO STARTED (FALLBACK)! 🤘');
    });
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
      // Boost bass frequencies for heavy metal feel
      this.gainNode.gain.setValueAtTime(volume * 1.2, this.audioContext!.currentTime);
    }
  }

  public isActive() {
    return this.isPlaying;
  }
}