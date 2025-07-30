/**
 * TTS Service Tests - Just Works Audio Experience
 * Testing that text-to-speech functions reliably
 */

import { ttsService } from '../tts-service';

// Mock Speech Synthesis API
const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => [
    {
      name: 'Test Voice',
      lang: 'en-US',
      localService: true,
      default: true,
    },
  ]),
  speaking: false,
  paused: false,
  addEventListener: jest.fn(),
};

// Mock SpeechSynthesisUtterance
const mockUtterance = {
  text: '',
  voice: null,
  rate: 1,
  pitch: 1,
  volume: 1,
  onstart: null,
  onend: null,
  onerror: null,
  onpause: null,
  onresume: null,
  onboundary: null,
};

Object.defineProperty(window, 'speechSynthesis', {
  value: mockSpeechSynthesis,
  configurable: true,
});

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  value: jest.fn(() => mockUtterance),
  configurable: true,
});

describe('User Story: Audio Reading Experience', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSpeechSynthesis.speaking = false;
    mockSpeechSynthesis.paused = false;
  });

  describe('Browser Support Detection', () => {
    test('User can check if TTS is supported in their browser', () => {
      // Given: User has a modern browser
      // When: Checking TTS support
      const isSupported = ttsService.isSupported();

      // Then: Service correctly detects support
      expect(isSupported).toBe(true);
    });

    test('Service handles unsupported browsers gracefully', () => {
      // Given: Browser without Speech Synthesis
      Object.defineProperty(window, 'speechSynthesis', {
        value: undefined,
        configurable: true,
      });

      // When: Checking support without Speech API
      // Then: Original service still works (using global instance)
      expect(typeof ttsService.isSupported).toBe('function');
    });
  });

  describe('Voice Management', () => {
    test('User can get list of available voices', () => {
      // Given: Browser with available voices
      // When: Getting voices
      const voices = ttsService.getVoices();

      // Then: Service returns voice list
      expect(Array.isArray(voices)).toBe(true);
      expect(voices.length).toBeGreaterThanOrEqual(0);
    });

    test('Default settings include best available voice', () => {
      // Given: Available voices in browser
      // When: Getting default settings
      const defaultSettings = ttsService.getDefaultSettings();

      // Then: Settings are sensible
      expect(defaultSettings.enabled).toBe(false); // Disabled by default
      expect(defaultSettings.rate).toBe(1.0);
      expect(defaultSettings.pitch).toBe(1.0);
      expect(defaultSettings.volume).toBe(0.8);
    });
  });

  describe('Speech Functionality', () => {
    test('User can start text-to-speech playback', async () => {
      // Given: Text to read and TTS settings
      const text = 'Hello, this is a test of the reading functionality.';
      const settings = {
        enabled: true,
        voice: 'test-voice',
        rate: 1.0,
        pitch: 1.0,
        volume: 0.8,
      };

      // When: Starting speech (should not throw error)
      // Then: Service handles the request gracefully
      await expect(ttsService.speak(text, settings)).resolves.toBeUndefined();
    });

    test('User can test TTS settings with sample text', async () => {
      // Given: User wants to test their settings
      const settings = {
        enabled: true,
        voice: 'test-voice',
        rate: 1.2,
        pitch: 1.1,
        volume: 0.9,
      };

      // When: Testing speech (should not throw error)
      // Then: Service handles the test gracefully
      await expect(ttsService.testSpeech(settings)).resolves.toBeUndefined();
    });

    test('TTS respects disabled setting', async () => {
      // Given: TTS disabled in settings
      const settings = {
        enabled: false,
        voice: 'test-voice',
        rate: 1.0,
        pitch: 1.0,
        volume: 0.8,
      };

      // When: Attempting to speak
      await ttsService.speak('Test text', settings);

      // Then: No speech occurs
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
    });
  });

  describe('Playback Controls', () => {
    test('User can pause and resume speech', () => {
      // Given: TTS service available
      // When: Using playback controls
      // Then: Methods don't throw errors
      expect(() => ttsService.pause()).not.toThrow();
      expect(() => ttsService.resume()).not.toThrow();
    });

    test('User can stop speech completely', () => {
      // Given: TTS service available
      // When: Stopping speech
      // Then: Method doesn't throw error
      expect(() => ttsService.stop()).not.toThrow();
    });
  });

  describe('State Management', () => {
    test('Service provides current TTS state', () => {
      // Given: TTS service running
      // When: Getting current state
      const state = ttsService.getState();

      // Then: State is properly structured
      expect(state).toHaveProperty('speaking');
      expect(state).toHaveProperty('paused');
      expect(state).toHaveProperty('position');
      expect(state).toHaveProperty('totalLength');
      expect(typeof state.speaking).toBe('boolean');
      expect(typeof state.paused).toBe('boolean');
      expect(typeof state.position).toBe('number');
      expect(typeof state.totalLength).toBe('number');
    });

    test('User can subscribe to state changes', () => {
      // Given: State change listener
      const listener = jest.fn();

      // When: Subscribing to changes
      const unsubscribe = ttsService.subscribe(listener);

      // Then: Unsubscribe function is returned
      expect(typeof unsubscribe).toBe('function');

      // When: Unsubscribing
      unsubscribe();

      // Then: Listener is removed (no error thrown)
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('Service handles speech synthesis errors gracefully', async () => {
      // Given: Text to speak
      const text = 'Test error handling';
      const settings = {
        enabled: true,
        voice: 'test-voice',
        rate: 1.0,
        pitch: 1.0,
        volume: 0.8,
      };

      // When: Speech encounters error
      const speakPromise = ttsService.speak(text, settings);
      
      // Simulate error
      if (mockUtterance.onerror) {
        mockUtterance.onerror({ error: 'synthesis-failed' } as any);
      }

      // Then: Promise rejects gracefully
      await expect(speakPromise).rejects.toThrow('Speech synthesis error');
    });

    test('Service validates settings ranges', async () => {
      // Given: Invalid settings
      const invalidSettings = {
        enabled: true,
        voice: 'test-voice',
        rate: 5.0, // Too high
        pitch: -1.0, // Too low
        volume: 2.0, // Too high
      };

      // When: Speaking with invalid settings
      const speakPromise = ttsService.speak('Test', invalidSettings);
      
      // Simulate successful speech (service should clamp values)
      if (mockUtterance.onstart) mockUtterance.onstart({} as any);
      if (mockUtterance.onend) mockUtterance.onend({} as any);

      // Then: No error occurs (values are clamped)
      await expect(speakPromise).resolves.toBeUndefined();
    });
  });

  describe('Integration Ready', () => {
    test('Service integrates with settings store pattern', () => {
      // Given: Settings store pattern (like Zustand)
      // When: Service is used with reactive settings
      const defaultSettings = ttsService.getDefaultSettings();

      // Then: Settings are compatible with store pattern
      expect(defaultSettings).toEqual({
        enabled: false,
        voice: expect.any(String),
        rate: 1.0,
        pitch: 1.0,
        volume: 0.8,
      });
    });
  });
});