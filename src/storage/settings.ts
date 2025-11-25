// Chrome storage wrapper for user settings

import type { TabEchoSettings } from './db';

const DEFAULT_SETTINGS: TabEchoSettings = {
  idleThreshold: 30, // 30 minutes
  enableScreenshots: false, // Free tier default
  isPro: false,
  retentionLimit: 100, // Free tier: keep last 100 tabs
  retentionDays: 7, // Free tier: keep for 7 days
  autoArchive: true,
  domains: [], // domains to exclude from auto-archive
};

export class SettingsManager {
  private static SETTINGS_KEY = 'tabecho_settings';

  static async getSettings(): Promise<TabEchoSettings> {
    try {
      const result = await chrome.storage.local.get(this.SETTINGS_KEY);
      const stored = result[this.SETTINGS_KEY];
      return stored ? { ...DEFAULT_SETTINGS, ...stored } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error getting settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  static async updateSettings(updates: Partial<TabEchoSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...updates };
      await chrome.storage.local.set({ [this.SETTINGS_KEY]: newSettings });
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  static async resetSettings(): Promise<void> {
    try {
      await chrome.storage.local.set({ [this.SETTINGS_KEY]: DEFAULT_SETTINGS });
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }

  static async upgradeToPro(): Promise<void> {
    await this.updateSettings({
      isPro: true,
      enableScreenshots: true,
      retentionLimit: -1, // unlimited
      retentionDays: -1, // unlimited
    });
  }

  static async downgradeToFree(): Promise<void> {
    await this.updateSettings({
      isPro: false,
      enableScreenshots: false,
      retentionLimit: 100,
      retentionDays: 7,
    });
  }

  static async isProUser(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.isPro;
  }
}

// Export for convenience
export const getSettings = () => SettingsManager.getSettings();
export const updateSettings = (updates: Partial<TabEchoSettings>) =>
  SettingsManager.updateSettings(updates);
export const isProUser = () => SettingsManager.isProUser();
