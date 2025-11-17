import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

export const useTheme = () => {
  const { settings } = useSettingsStore();

  useEffect(() => {
    const root = document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const activeTheme = settings.theme === 'system' ? systemTheme : settings.theme;

    if (activeTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  return settings.theme;
};
