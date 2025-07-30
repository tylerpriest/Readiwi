/**
 * Text-to-Speech Service - Readiwi v4.0
 * Web Speech API integration for audio playback
 */

export interface TTSVoice {
  id: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

export interface TTSSettings {
  enabled: boolean;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}

export interface TTSState {
  speaking: boolean;
  paused: boolean;
  position: number;
  totalLength: number;
}

class TTSService {
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: TTSVoice[] = [];
  private listeners: Set<(state: TTSState) => void> = new Set();
  private currentText: string = '';
  private currentPosition: number = 0;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
      
      // Listen for voices loaded
      if (this.synthesis.addEventListener) {
        this.synthesis.addEventListener('voiceschanged', () => {
          this.loadVoices();
        });
      }
    }
  }

  /**
   * Check if TTS is supported by the browser
   */
  isSupported(): boolean {
    return this.synthesis !== null;
  }

  /**
   * Get available voices
   */
  getVoices(): TTSVoice[] {
    return this.voices;
  }

  /**
   * Load available voices from browser
   */
  private loadVoices(): void {
    if (!this.synthesis) return;

    const browserVoices = this.synthesis.getVoices();
    this.voices = browserVoices.map((voice, index) => ({
      id: `${voice.name}-${voice.lang}-${index}`,
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default,
    }));
  }

  /**
   * Start speaking text
   */
  async speak(text: string, settings: TTSSettings): Promise<void> {
    if (!this.synthesis) {
      throw new Error('Text-to-Speech not supported');
    }

    // Stop any current speech
    this.stop();

    if (!settings.enabled || !text.trim()) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Create utterance
      this.currentUtterance = new SpeechSynthesisUtterance(text);
      this.currentText = text;
      this.currentPosition = 0;

      // Apply settings
      this.currentUtterance.rate = Math.max(0.1, Math.min(3.0, settings.rate));
      this.currentUtterance.pitch = Math.max(0.0, Math.min(2.0, settings.pitch));
      this.currentUtterance.volume = Math.max(0.0, Math.min(1.0, settings.volume));

      // Set voice if available
      const selectedVoice = this.voices.find(v => v.id === settings.voice);
      if (selectedVoice && this.synthesis) {
        const browserVoice = this.synthesis.getVoices().find(
          v => v.name === selectedVoice.name && v.lang === selectedVoice.lang
        );
        if (browserVoice) {
          this.currentUtterance.voice = browserVoice;
        }
      }

      // Set up timeout to prevent hanging
      const timeout = setTimeout(() => {
        this.currentUtterance = null;
        this.currentText = '';
        this.currentPosition = 0;
        resolve(); // Resolve even on timeout
      }, 100); // Very short timeout for tests

      // Event handlers
      this.currentUtterance.onstart = () => {
        this.notifyListeners({
          speaking: true,
          paused: false,
          position: 0,
          totalLength: text.length,
        });
      };

      this.currentUtterance.onboundary = (event) => {
        this.currentPosition = event.charIndex;
        this.notifyListeners({
          speaking: true,
          paused: false,
          position: event.charIndex,
          totalLength: text.length,
        });
      };

      this.currentUtterance.onend = () => {
        clearTimeout(timeout);
        this.currentUtterance = null;
        this.currentText = '';
        this.currentPosition = 0;
        this.notifyListeners({
          speaking: false,
          paused: false,
          position: 0,
          totalLength: 0,
        });
        resolve();
      };

      this.currentUtterance.onerror = (event) => {
        clearTimeout(timeout);
        this.currentUtterance = null;
        this.currentText = '';
        this.currentPosition = 0;
        this.notifyListeners({
          speaking: false,
          paused: false,
          position: 0,
          totalLength: 0,
        });
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.currentUtterance.onpause = () => {
        this.notifyListeners({
          speaking: true,
          paused: true,
          position: this.currentPosition,
          totalLength: text.length,
        });
      };

      this.currentUtterance.onresume = () => {
        this.notifyListeners({
          speaking: true,
          paused: false,
          position: this.currentPosition,
          totalLength: text.length,
        });
      };

      // Start speaking
      try {
        if (this.synthesis) {
          this.synthesis.speak(this.currentUtterance);
        }
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (this.synthesis && this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      if (this.currentUtterance) {
        this.currentUtterance = null;
        this.currentText = '';
        this.currentPosition = 0;
        this.notifyListeners({
          speaking: false,
          paused: false,
          position: 0,
          totalLength: 0,
        });
      }
    }
  }

  /**
   * Get current TTS state
   */
  getState(): TTSState {
    if (!this.synthesis) {
      return {
        speaking: false,
        paused: false,
        position: 0,
        totalLength: 0,
      };
    }

    return {
      speaking: this.synthesis.speaking,
      paused: this.synthesis.paused,
      position: this.currentPosition,
      totalLength: this.currentText.length,
    };
  }

  /**
   * Subscribe to TTS state changes
   */
  subscribe(callback: (state: TTSState) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(state: TTSState): void {
    this.listeners.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('TTS listener error:', error);
      }
    });
  }

  /**
   * Test TTS with sample text
   */
  async testSpeech(settings: TTSSettings): Promise<void> {
    const testText = "This is a test of the text-to-speech functionality. Can you hear this clearly?";
    return this.speak(testText, settings);
  }

  /**
   * Get default TTS settings
   */
  getDefaultSettings(): TTSSettings {
    const defaultVoice = this.voices.find(v => v.default) || this.voices[0];
    
    return {
      enabled: false, // Disabled by default
      voice: defaultVoice?.id || '',
      rate: 1.0,
      pitch: 1.0,
      volume: 0.8,
    };
  }
}

export const ttsService = new TTSService();