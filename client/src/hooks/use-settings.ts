import { useState, useEffect } from "react";
import type { SettingsConfig } from "@/components/settings-modal";

const DEFAULT_SETTINGS: SettingsConfig = {
  minRanking: 0,
  minPoints: 0,
  showRecentBlocks: true,
};

const SETTINGS_STORAGE_KEY = "hn-time-blocks-settings";

export function useSettings() {
  const [settings, setSettings] = useState<SettingsConfig>(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
    }
  }, []);

  // Save settings to localStorage when they change
  const updateSettings = (newSettings: SettingsConfig) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  };

  return { settings, updateSettings };
}