// Background service worker for TabEcho
// Handles idle tab detection and automatic archiving

import { db, type ArchivedTab } from './storage/db';
import { getSettings } from './storage/settings';

interface TabState {
  tabId: number;
  url: string;
  title: string;
  lastActive: number;
  isIdle: boolean;
}

class TabEchoBackground {
  private tabStates: Map<number, TabState> = new Map();
  private idleCheckInterval: number | null = null;
  private IDLE_CHECK_FREQUENCY = 60000; // Check every minute

  async init() {
    console.log('TabEcho background service worker initialized');

    // Initialize database
    await db.init();

    // Set up listeners
    this.setupListeners();

    // Start idle detection
    this.startIdleDetection();

    // Run initial cleanup
    this.cleanupOldTabs();
  }

  private setupListeners() {
    // Track tab activations
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      await this.onTabActivated(activeInfo.tabId);
    });

    // Track tab updates (URL changes, page loads)
    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        await this.onTabUpdated(tabId, tab);
      }
    });

    // Track tab removals
    chrome.tabs.onRemoved.addListener((tabId) => {
      this.tabStates.delete(tabId);
    });

    // Track window focus changes
    chrome.windows.onFocusChanged.addListener(async (windowId) => {
      if (windowId !== chrome.windows.WINDOW_ID_NONE) {
        const tabs = await chrome.tabs.query({ active: true, windowId });
        if (tabs[0]) {
          await this.onTabActivated(tabs[0].id!);
        }
      }
    });

    // Listen for messages from popup/dashboard
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep channel open for async response
    });
  }

  private async onTabActivated(tabId: number) {
    const tab = await chrome.tabs.get(tabId);

    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      return;
    }

    const state = this.tabStates.get(tabId);

    if (state) {
      state.lastActive = Date.now();
      state.isIdle = false;
    } else {
      this.tabStates.set(tabId, {
        tabId,
        url: tab.url,
        title: tab.title || '',
        lastActive: Date.now(),
        isIdle: false,
      });
    }
  }

  private async onTabUpdated(tabId: number, tab: chrome.tabs.Tab) {
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      return;
    }

    this.tabStates.set(tabId, {
      tabId,
      url: tab.url,
      title: tab.title || '',
      lastActive: Date.now(),
      isIdle: false,
    });
  }

  private startIdleDetection() {
    // Clear existing interval if any
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
    }

    // Check for idle tabs periodically
    this.idleCheckInterval = setInterval(() => {
      this.checkIdleTabs();
    }, this.IDLE_CHECK_FREQUENCY) as unknown as number;

    // Initial check
    this.checkIdleTabs();
  }

  private async checkIdleTabs() {
    const settings = await getSettings();

    if (!settings.autoArchive) {
      return;
    }

    const idleThresholdMs = settings.idleThreshold * 60 * 1000;
    const now = Date.now();

    // Get all current tabs
    const currentTabs = await chrome.tabs.query({});
    const currentTabIds = new Set(currentTabs.map(t => t.id));

    // Remove states for closed tabs
    for (const [tabId] of this.tabStates) {
      if (!currentTabIds.has(tabId)) {
        this.tabStates.delete(tabId);
      }
    }

    // Check each tracked tab for idleness
    for (const [tabId, state] of this.tabStates) {
      if (state.isIdle) continue;

      const idleDuration = now - state.lastActive;

      if (idleDuration >= idleThresholdMs) {
        // Check if domain is excluded
        const domain = this.extractDomain(state.url);
        if (settings.domains.includes(domain)) {
          continue;
        }

        // Mark as idle and archive
        state.isIdle = true;
        await this.archiveTab(tabId, state, idleDuration);
      }
    }

    // Apply retention limits for free tier
    if (!settings.isPro) {
      await this.applyRetentionLimits();
    }
  }

  private async archiveTab(tabId: number, state: TabState, idleDuration: number) {
    try {
      const settings = await getSettings();
      const tab = await chrome.tabs.get(tabId);

      if (!tab.url) return;

      const domain = this.extractDomain(tab.url);
      const tabId_str = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const archivedTab: ArchivedTab = {
        id: tabId_str,
        url: tab.url,
        title: tab.title || 'Untitled',
        favIconUrl: tab.favIconUrl,
        timestamp: Date.now(),
        tags: [],
        domain,
        archived: true,
        idleDuration,
      };

      // Capture screenshot if Pro user
      if (settings.isPro && settings.enableScreenshots) {
        try {
          const screenshot = await this.captureScreenshot(tabId);
          if (screenshot) {
            archivedTab.screenshot = screenshot;
          }
        } catch (error) {
          console.error('Failed to capture screenshot:', error);
        }
      }

      // Save to database
      await db.addTab(archivedTab);

      console.log(`Archived idle tab: ${archivedTab.title}`);

      // Send notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon-48.png',
        title: 'TabEcho',
        message: `Archived idle tab: ${archivedTab.title}`,
      });

    } catch (error) {
      console.error('Error archiving tab:', error);
    }
  }

  private async captureScreenshot(tabId: number): Promise<Blob | null> {
    try {
      const dataUrl = await chrome.tabs.captureVisibleTab({
        format: 'png',
      });

      // Convert data URL to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      return null;
    }
  }

  private async applyRetentionLimits() {
    const settings = await getSettings();

    // Delete tabs older than retention days
    if (settings.retentionDays > 0) {
      await db.deleteOldTabs(settings.retentionDays);
    }

    // Keep only the most recent N tabs
    if (settings.retentionLimit > 0) {
      const count = await db.getTabCount();
      if (count > settings.retentionLimit) {
        const allTabs = await db.getAllTabs();
        const tabsToDelete = allTabs.slice(settings.retentionLimit);

        for (const tab of tabsToDelete) {
          await db.deleteTab(tab.id);
        }
      }
    }
  }

  private async cleanupOldTabs() {
    const settings = await getSettings();

    if (!settings.isPro && settings.retentionDays > 0) {
      const deleted = await db.deleteOldTabs(settings.retentionDays);
      if (deleted > 0) {
        console.log(`Cleaned up ${deleted} old tabs`);
      }
    }
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return '';
    }
  }

  private async handleMessage(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) {
    try {
      switch (message.action) {
        case 'getArchivedTabs':
          const tabs = await db.getAllTabs(message.limit, message.offset);
          sendResponse({ success: true, tabs });
          break;

        case 'searchTabs':
          const results = await db.searchTabs(message.query);
          sendResponse({ success: true, results });
          break;

        case 'restoreTab':
          await chrome.tabs.create({ url: message.url, active: true });
          sendResponse({ success: true });
          break;

        case 'deleteTab':
          await db.deleteTab(message.id);
          sendResponse({ success: true });
          break;

        case 'updateTab':
          await db.updateTab(message.id, message.updates);
          sendResponse({ success: true });
          break;

        case 'getTabCount':
          const count = await db.getTabCount();
          sendResponse({ success: true, count });
          break;

        case 'exportData':
          const exportData = await db.exportData();
          sendResponse({ success: true, data: exportData });
          break;

        case 'importData':
          await db.importData(message.data);
          sendResponse({ success: true });
          break;

        case 'clearAll':
          await db.clearAll();
          this.tabStates.clear();
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: String(error) });
    }
  }
}

// Initialize the background service
const background = new TabEchoBackground();
background.init();
