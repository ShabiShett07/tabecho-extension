// Background service worker for TabEcho
// Handles idle tab detection and automatic archiving

import { db, type ArchivedTab } from './storage/db';
import { getSettings } from './storage/settings';
import { initializeSubscription } from './services/payments';

interface TabState {
  tabId: number;
  url: string;
  title: string;
  lastActive: number;
  isIdle: boolean;
}

class TabEchoBackground {
  private tabStates: Map<number, TabState> = new Map();
  private ALARM_NAME = 'tabecho-idle-check';
  private CHECK_INTERVAL_MINUTES = 0.5; // Check every 30 seconds

  async init() {
    console.log('🚀 TabEcho background service worker initialized');

    // Initialize database
    await db.init();
    console.log('✅ Database initialized');

    // Initialize Stripe subscription checking
    await initializeSubscription();
    console.log('✅ Subscription status initialized');

    // Set up listeners
    this.setupListeners();
    console.log('✅ Event listeners set up');

    // Track all existing tabs
    await this.trackExistingTabs();
    console.log('✅ Existing tabs tracked');

    // Start idle detection using alarms (persists when service worker sleeps)
    this.startIdleDetection();
    console.log(`✅ Idle detection started (checking every ${this.CHECK_INTERVAL_MINUTES} minute(s))`);

    // Run initial cleanup
    this.cleanupOldTabs();
  }

  private async trackExistingTabs() {
    const tabs = await chrome.tabs.query({});
    const now = Date.now();

    for (const tab of tabs) {
      if (!tab.id || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        continue;
      }

      // Track tab with current timestamp
      // Active tab gets current time, inactive tabs get slightly older timestamp
      // so they can be archived if they've been inactive
      const lastActive = tab.active ? now : now - (30 * 1000); // Inactive tabs: 30 seconds ago

      this.tabStates.set(tab.id, {
        tabId: tab.id,
        url: tab.url,
        title: tab.title || '',
        lastActive,
        isIdle: false,
      });

      console.log(`🔖 Tracked existing tab: "${tab.title}" (active: ${tab.active})`);
    }

    console.log(`📊 Tracked ${this.tabStates.size} existing tabs`);
  }

  private setupListeners() {
    // Track tab creations - track all tabs even without URL initially
    chrome.tabs.onCreated.addListener((tab) => {
      if (tab.id) {
        // Track even if no URL yet - will be updated when page loads
        this.tabStates.set(tab.id, {
          tabId: tab.id,
          url: tab.url || '',
          title: tab.title || 'New Tab',
          lastActive: Date.now(),
          isIdle: false,
        });
        console.log(`🆕 Tab created (id: ${tab.id})`);
      }
    });

    // Track tab activations
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      await this.onTabActivated(activeInfo.tabId);
    });

    // Track tab updates (URL changes, page loads) - update immediately on any change
    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      // Track on any URL change or when page starts loading
      if (changeInfo.url || changeInfo.status === 'loading' || changeInfo.status === 'complete') {
        if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
          await this.onTabUpdated(tabId, tab);
        } else if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://'))) {
          // Remove chrome:// tabs from tracking
          if (this.tabStates.has(tabId)) {
            console.log(`🚫 Removing chrome:// tab from tracking (id: ${tabId})`);
            this.tabStates.delete(tabId);
          }
        }
      }
    });

    // Track tab removals
    chrome.tabs.onRemoved.addListener((tabId) => {
      console.log(`🗑️ Tab removed (id: ${tabId})`);
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

    // Listen for alarms
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === this.ALARM_NAME) {
        console.log('⏰ Alarm triggered - checking idle tabs');
        this.checkIdleTabs();
      }
    });
  }

  private async onTabActivated(tabId: number) {
    const tab = await chrome.tabs.get(tabId);

    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      return;
    }

    const now = Date.now();
    const state = this.tabStates.get(tabId);

    if (state) {
      console.log(`👆 Tab activated: "${tab.title}" (id: ${tabId})`);
      state.lastActive = now;
      state.isIdle = false;
      state.title = tab.title || state.title; // Update title if changed
    } else {
      console.log(`🆕 New tab tracked on activation: "${tab.title}" (id: ${tabId})`);
      this.tabStates.set(tabId, {
        tabId,
        url: tab.url,
        title: tab.title || '',
        lastActive: now,
        isIdle: false,
      });
    }

    // Log all other tabs that are now inactive
    console.log(`📊 Other tabs now inactive (${this.tabStates.size - 1} tabs):`);
    for (const [otherTabId, otherState] of this.tabStates) {
      if (otherTabId !== tabId && !otherState.isIdle) {
        const idleSeconds = Math.floor((now - otherState.lastActive) / 1000);
        console.log(`  - Tab ${otherTabId}: "${otherState.title}" (idle for ${idleSeconds}s)`);
      }
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

  private async startIdleDetection() {
    // Clear any existing alarms
    await chrome.alarms.clear(this.ALARM_NAME);

    // Create a new alarm that fires periodically
    await chrome.alarms.create(this.ALARM_NAME, {
      delayInMinutes: this.CHECK_INTERVAL_MINUTES,
      periodInMinutes: this.CHECK_INTERVAL_MINUTES,
    });

    console.log(`⏰ Alarm created: will check every ${this.CHECK_INTERVAL_MINUTES} minute(s)`);

    // Run initial check immediately
    this.checkIdleTabs();
  }

  private async checkIdleTabs() {
    const settings = await getSettings();

    console.log('🔍 Checking idle tabs...', {
      autoArchive: settings.autoArchive,
      idleThreshold: settings.idleThreshold,
      trackedTabs: this.tabStates.size,
    });

    if (!settings.autoArchive) {
      console.log('⏸️  Auto-archive is disabled - skipping');
      return;
    }

    const idleThresholdMs = settings.idleThreshold * 60 * 1000;
    const now = Date.now();

    // Get all current tabs
    const currentTabs = await chrome.tabs.query({});
    const currentTabIds = new Set(currentTabs.map(t => t.id));

    console.log(`📊 Current open tabs: ${currentTabs.length}`);
    console.log(`📊 Currently tracked tabs: ${this.tabStates.size}`);

    // Log all tracked tabs for debugging
    console.log('📋 Tracked tabs list:');
    for (const [tabId, state] of this.tabStates) {
      const idleMinutes = Math.floor((now - state.lastActive) / 1000 / 60);
      console.log(`  - Tab ${tabId}: "${state.title}" (idle: ${idleMinutes} min)`);
    }

    // Remove states for closed tabs
    for (const [tabId] of this.tabStates) {
      if (!currentTabIds.has(tabId)) {
        console.log(`🧹 Removing closed tab ${tabId} from tracking`);
        this.tabStates.delete(tabId);
      }
    }

    // Check each tracked tab for idleness
    for (const [tabId, state] of this.tabStates) {
      if (state.isIdle) {
        console.log(`⏭️  Skipping already archived tab ${tabId}: "${state.title}"`);
        continue;
      }

      const idleDuration = now - state.lastActive;
      const idleMinutes = Math.floor(idleDuration / 1000 / 60);
      const idleSeconds = Math.floor(idleDuration / 1000);

      console.log(`📄 Checking tab ${tabId}: "${state.title}" - Idle for ${idleMinutes}m ${idleSeconds % 60}s (threshold: ${settings.idleThreshold} min)`);

      if (idleDuration >= idleThresholdMs) {
        // Check if domain is excluded
        const domain = this.extractDomain(state.url);
        if (settings.domains.includes(domain)) {
          console.log(`⏭️  Skipping excluded domain: ${domain}`);
          continue;
        }

        // Mark as idle and archive
        console.log(`✅ Archiving tab: "${state.title}" (idle for ${idleMinutes} minutes)`);
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
          // Get current active tab to restore later
          const currentTabs = await chrome.tabs.query({ active: true, currentWindow: true });
          const currentTabId = currentTabs[0]?.id;

          // Switch to the tab to capture its screenshot
          await chrome.tabs.update(tabId, { active: true });

          // Wait a bit for the tab to render
          await new Promise(resolve => setTimeout(resolve, 100));

          // Capture the screenshot
          const screenshot = await this.captureScreenshot(tabId);
          if (screenshot) {
            archivedTab.screenshot = screenshot;
            console.log(`📸 Screenshot captured for: ${archivedTab.title}`);
          }

          // Switch back to the original tab
          if (currentTabId && currentTabId !== tabId) {
            await chrome.tabs.update(currentTabId, { active: true });
          }
        } catch (error) {
          console.error('Failed to capture screenshot:', error);
        }
      }

      // Save to database
      await db.addTab(archivedTab);

      console.log(`Archived idle tab: ${archivedTab.title}`);

      // Close tab if auto-close is enabled
      if (settings.autoCloseArchivedTabs) {
        try {
          await chrome.tabs.remove(tabId);
          console.log(`Closed archived tab: ${archivedTab.title}`);
        } catch (error) {
          console.error('Error closing tab:', error);
        }
      }

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

  private async blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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

          // Convert Blobs to data URLs for serialization
          const serializedTabs = await Promise.all(
            tabs.map(async (tab) => {
              if (tab.screenshot instanceof Blob) {
                return {
                  ...tab,
                  screenshot: await this.blobToDataURL(tab.screenshot),
                };
              }
              return tab;
            })
          );

          sendResponse({ success: true, tabs: serializedTabs });
          break;

        case 'searchTabs':
          const results = await db.searchTabs(message.query);

          // Convert Blobs to data URLs for serialization
          const serializedResults = await Promise.all(
            results.map(async (tab) => {
              if (tab.screenshot instanceof Blob) {
                return {
                  ...tab,
                  screenshot: await this.blobToDataURL(tab.screenshot),
                };
              }
              return tab;
            })
          );

          sendResponse({ success: true, results: serializedResults });
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

        case 'forceCheckNow':
          console.log('🔧 Force check triggered by user');
          const beforeCount = await db.getTabCount();
          await this.checkIdleTabs();
          const afterCount = await db.getTabCount();
          const archivedCount = afterCount - beforeCount;
          sendResponse({
            success: true,
            trackedTabs: this.tabStates.size,
            archivedCount: archivedCount,
          });
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
