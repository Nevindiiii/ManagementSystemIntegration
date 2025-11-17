import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'si' | 'ta';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
  };
}

interface SettingsStore {
  settings: Settings;
  setTheme: (theme: Settings['theme']) => void;
  setLanguage: (language: Settings['language']) => void;
  updateNotifications: (notifications: Partial<Settings['notifications']>) => void;
  updatePrivacy: (privacy: Partial<Settings['privacy']>) => void;
  setSettings: (settings: Settings) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: {
        theme: 'system',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
        },
      },
      setTheme: (theme) =>
        set((state) => ({
          settings: { ...state.settings, theme },
        })),
      setLanguage: (language) =>
        set((state) => ({
          settings: { ...state.settings, language },
        })),
      updateNotifications: (notifications) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, ...notifications },
          },
        })),
      updatePrivacy: (privacy) =>
        set((state) => ({
          settings: {
            ...state.settings,
            privacy: { ...state.settings.privacy, ...privacy },
          },
        })),
      setSettings: (settings) => set({ settings }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
