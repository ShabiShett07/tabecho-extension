// IndexedDB wrapper for TabEcho
// Stores archived tabs with metadata and screenshots

export interface ArchivedTab {
  id: string;
  url: string;
  title: string;
  favIconUrl?: string;
  timestamp: number;
  screenshot?: Blob;
  tags: string[];
  project?: string;
  domain: string;
  archived: boolean;
  idleDuration?: number; // How long the tab was idle before archiving (in ms)
}

export interface TabEchoSettings {
  idleThreshold: number; // minutes before tab is considered idle
  enableScreenshots: boolean;
  isPro: boolean;
  retentionLimit: number; // max number of archived tabs (Free tier limit)
  retentionDays: number; // max days to keep archived tabs (Free tier limit)
  autoArchive: boolean;
  domains: string[]; // domains to exclude from auto-archive
}

const DB_NAME = 'TabEchoDB';
const DB_VERSION = 1;
const STORE_NAME = 'archivedTabs';

class TabEchoDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store for archived tabs
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

          // Create indexes for efficient querying
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('domain', 'domain', { unique: false });
          store.createIndex('project', 'project', { unique: false });
          store.createIndex('url', 'url', { unique: false });
          store.createIndex('archived', 'archived', { unique: false });
        }
      };
    });
  }

  async addTab(tab: ArchivedTab): Promise<string> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(tab);

      request.onsuccess = () => resolve(tab.id);
      request.onerror = () => reject(request.error);
    });
  }

  async getTab(id: string): Promise<ArchivedTab | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllTabs(limit?: number, offset: number = 0): Promise<ArchivedTab[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');

      // Get in reverse chronological order
      const request = index.openCursor(null, 'prev');
      const results: ArchivedTab[] = [];
      let count = 0;
      let skipped = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;

        if (cursor) {
          if (skipped < offset) {
            skipped++;
            cursor.continue();
            return;
          }

          results.push(cursor.value);
          count++;

          if (limit && count >= limit) {
            resolve(results);
          } else {
            cursor.continue();
          }
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async searchTabs(query: string): Promise<ArchivedTab[]> {
    if (!this.db) await this.init();

    const allTabs = await this.getAllTabs();
    const lowerQuery = query.toLowerCase();

    return allTabs.filter(tab =>
      tab.title.toLowerCase().includes(lowerQuery) ||
      tab.url.toLowerCase().includes(lowerQuery) ||
      tab.domain.toLowerCase().includes(lowerQuery) ||
      tab.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      (tab.project && tab.project.toLowerCase().includes(lowerQuery))
    );
  }

  async getTabsByDomain(domain: string): Promise<ArchivedTab[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('domain');
      const request = index.getAll(domain);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getTabsByProject(project: string): Promise<ArchivedTab[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('project');
      const request = index.getAll(project);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getTabsByDateRange(startDate: number, endDate: number): Promise<ArchivedTab[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateTab(id: string, updates: Partial<ArchivedTab>): Promise<void> {
    if (!this.db) await this.init();

    const tab = await this.getTab(id);
    if (!tab) throw new Error('Tab not found');

    const updatedTab = { ...tab, ...updates };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(updatedTab);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTab(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteOldTabs(daysToKeep: number): Promise<number> {
    if (!this.db) await this.init();

    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const oldTabs = await this.getTabsByDateRange(0, cutoffTime);

    for (const tab of oldTabs) {
      await this.deleteTab(tab.id);
    }

    return oldTabs.length;
  }

  async getTabCount(): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async exportData(): Promise<ArchivedTab[]> {
    return this.getAllTabs();
  }

  async importData(tabs: ArchivedTab[]): Promise<void> {
    for (const tab of tabs) {
      await this.addTab(tab);
    }
  }
}

export const db = new TabEchoDatabase();
