import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ttsService, TTSSettings, TTSState } from '../services/tts-service';

interface AudioStoreState {
  // TTS State
  ttsState: TTSState;
  currentText: string;
  isReading: boolean;
  
  // Actions
  startReading: (text: string, settings: TTSSettings) => Promise<void>;
  pauseReading: () => void;
  resumeReading: () => void;
  stopReading: () => void;
  updateTTSState: (state: TTSState) => void;
  
  // Selectors
  get isSpeaking(): boolean;
  get isPaused(): boolean;
  get progress(): number;
}

const useAudioStore = create<AudioStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      ttsState: {
        speaking: false,
        paused: false,
        position: 0,
        totalLength: 0,
      },
      currentText: '',
      isReading: false,
      
      // Selectors
      get isSpeaking() {
        const state = get();
        return state.ttsState.speaking;
      },
      
      get isPaused() {
        const state = get();
        return state.ttsState.paused;
      },
      
      get progress() {
        const state = get();
        const { position, totalLength } = state.ttsState;
        return totalLength > 0 ? (position / totalLength) * 100 : 0;
      },
      
      // Actions
      startReading: async (text: string, settings: TTSSettings) => {
        try {
          set({ 
            currentText: text, 
            isReading: true,
            ttsState: {
              speaking: true,
              paused: false,
              position: 0,
              totalLength: text.length,
            }
          });
          
          await ttsService.speak(text, settings);
        } catch (error) {
          console.error('Failed to start reading:', error);
          set({ 
            isReading: false,
            ttsState: {
              speaking: false,
              paused: false,
              position: 0,
              totalLength: 0,
            }
          });
        }
      },
      
      pauseReading: () => {
        ttsService.pause();
        set((state) => ({
          ttsState: {
            ...state.ttsState,
            paused: true,
          }
        }));
      },
      
      resumeReading: () => {
        ttsService.resume();
        set((state) => ({
          ttsState: {
            ...state.ttsState,
            paused: false,
          }
        }));
      },
      
      stopReading: () => {
        ttsService.stop();
        set({
          isReading: false,
          currentText: '',
          ttsState: {
            speaking: false,
            paused: false,
            position: 0,
            totalLength: 0,
          }
        });
      },
      
      updateTTSState: (ttsState: TTSState) => {
        set(() => ({
          ttsState,
          isReading: ttsState.speaking,
        }));
      },
    }),
    {
      name: 'audio-storage',
      partialize: (state) => ({
        // Don't persist TTS state - it's runtime only
        currentText: state.currentText,
      }),
    }
  )
);

export default useAudioStore;