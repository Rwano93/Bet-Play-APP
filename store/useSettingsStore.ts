import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  hapticEnabled: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  theme: 'dark' | 'light';
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateSetting: <T extends keyof Omit<SettingsState, 'isLoading' | 'loadSettings' | 'updateSetting'>>(
    key: T,
    value: SettingsState[T]
  ) => Promise<void>;
}

const STORAGE_KEY = 'app_settings';

const DEFAULT_SETTINGS = {
  hapticEnabled: true,
  soundEnabled: true,
  animationsEnabled: true,
  theme: 'dark' as const,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoading: true,

  loadSettings: async () => {
    try {
      const settingsStr = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        set({ ...settings, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      set({ isLoading: false });
    }
  },

  updateSetting: async (key, value) => {
    try {
      const currentSettings = get();
      const newSettings = { ...currentSettings, [key]: value };
      
      // Remove non-serializable properties
      const { isLoading, loadSettings, updateSetting, ...settingsToSave } = newSettings;
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave));
      set({ [key]: value });
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  },
}));