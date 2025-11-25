import { useState } from 'react'
import type { TabEchoSettings } from '../storage/db'
import { updateSettings } from '../storage/settings'
import './Settings.css'

interface SettingsProps {
  settings: TabEchoSettings
  onUpdate: () => void
}

export default function Settings({ settings, onUpdate }: SettingsProps) {
  const [idleThreshold, setIdleThreshold] = useState(settings.idleThreshold)
  const [autoArchive, setAutoArchive] = useState(settings.autoArchive)
  const [enableScreenshots, setEnableScreenshots] = useState(settings.enableScreenshots)
  const [excludedDomains, setExcludedDomains] = useState(settings.domains.join(', '))
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const domains = excludedDomains
        .split(',')
        .map((d) => d.trim())
        .filter((d) => d.length > 0)

      await updateSettings({
        idleThreshold,
        autoArchive,
        enableScreenshots: settings.isPro ? enableScreenshots : false,
        domains,
      })

      onUpdate()
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'exportData' })
      if (response.success) {
        const dataStr = JSON.stringify(response.data, null, 2)
        const blob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `tabecho-export-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data')
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const response = await chrome.runtime.sendMessage({
        action: 'importData',
        data,
      })

      if (response.success) {
        alert('Data imported successfully!')
        onUpdate()
      }
    } catch (error) {
      console.error('Error importing data:', error)
      alert('Failed to import data')
    }
  }

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all archived tabs? This cannot be undone.')) {
      return
    }

    try {
      const response = await chrome.runtime.sendMessage({ action: 'clearAll' })
      if (response.success) {
        alert('All archived tabs cleared')
        onUpdate()
      }
    } catch (error) {
      console.error('Error clearing data:', error)
      alert('Failed to clear data')
    }
  }

  const handleUpgradeToPro = () => {
    // This would open Stripe checkout in production
    if (confirm('Demo mode: Upgrade to Pro? (This will enable Pro features without payment)')) {
      updateSettings({ isPro: true, enableScreenshots: true, retentionLimit: -1, retentionDays: -1 })
      onUpdate()
    }
  }

  return (
    <div className="settings">
      <section className="settings-section">
        <h2>General Settings</h2>

        <div className="setting-item">
          <label className="setting-label">
            <span>Idle Threshold (minutes)</span>
            <span className="setting-description">
              How long before a tab is considered idle
            </span>
          </label>
          <input
            type="number"
            min="1"
            max="240"
            value={idleThreshold}
            onChange={(e) => setIdleThreshold(Number(e.target.value))}
            className="setting-input"
          />
        </div>

        <div className="setting-item">
          <label className="setting-checkbox">
            <input
              type="checkbox"
              checked={autoArchive}
              onChange={(e) => setAutoArchive(e.target.checked)}
            />
            <span>
              <strong>Auto-archive idle tabs</strong>
              <span className="setting-description">
                Automatically archive tabs when they become idle
              </span>
            </span>
          </label>
        </div>

        <div className="setting-item">
          <label className="setting-checkbox">
            <input
              type="checkbox"
              checked={enableScreenshots}
              onChange={(e) => setEnableScreenshots(e.target.checked)}
              disabled={!settings.isPro}
            />
            <span>
              <strong>Capture Screenshots</strong>
              {!settings.isPro && <span className="pro-badge-inline">PRO</span>}
              <span className="setting-description">
                Save visual thumbnails of archived tabs
              </span>
            </span>
          </label>
        </div>

        <div className="setting-item">
          <label className="setting-label">
            <span>Excluded Domains</span>
            <span className="setting-description">
              Comma-separated list of domains to never archive (e.g., gmail.com, slack.com)
            </span>
          </label>
          <textarea
            value={excludedDomains}
            onChange={(e) => setExcludedDomains(e.target.value)}
            className="setting-textarea"
            placeholder="gmail.com, slack.com, calendar.google.com"
            rows={3}
          />
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </section>

      <section className="settings-section">
        <h2>Subscription</h2>

        <div className="subscription-card">
          {settings.isPro ? (
            <>
              <div className="pro-badge-large">⭐ PRO USER</div>
              <p>You have access to all premium features:</p>
              <ul className="feature-list">
                <li>✅ Unlimited archive storage</li>
                <li>✅ Screenshot thumbnails</li>
                <li>✅ Advanced filters</li>
                <li>✅ Tags & Projects</li>
                <li>✅ Export/Import</li>
                <li>✅ Analytics</li>
              </ul>
            </>
          ) : (
            <>
              <h3>Upgrade to Pro</h3>
              <p className="price">$4.99/month or $49/year</p>
              <ul className="feature-list">
                <li>📸 Screenshot thumbnails</li>
                <li>∞ Unlimited archive storage</li>
                <li>🔍 Advanced search & filters</li>
                <li>🏷️ Tags & Project organization</li>
                <li>📊 Tab usage analytics</li>
                <li>💾 Export/Import data</li>
              </ul>
              <button onClick={handleUpgradeToPro} className="btn-upgrade">
                Upgrade Now (Demo)
              </button>
              <p className="demo-note">
                In production, this would open Stripe checkout
              </p>
            </>
          )}
        </div>
      </section>

      <section className="settings-section">
        <h2>Data Management</h2>

        <div className="data-actions">
          <div className="action-card">
            <h4>Export Data</h4>
            <p>Download all your archived tabs as JSON</p>
            <button
              onClick={handleExport}
              className="btn-secondary"
              disabled={!settings.isPro}
            >
              {!settings.isPro && <span className="pro-badge-inline">PRO</span>}
              Export
            </button>
          </div>

          <div className="action-card">
            <h4>Import Data</h4>
            <p>Restore from a previous export</p>
            <label className="btn-secondary file-input-label">
              {!settings.isPro && <span className="pro-badge-inline">PRO</span>}
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={!settings.isPro}
                style={{ display: 'none' }}
              />
              Import
            </label>
          </div>

          <div className="action-card danger">
            <h4>Clear All Data</h4>
            <p>Permanently delete all archived tabs</p>
            <button onClick={handleClearAll} className="btn-danger">
              Clear All
            </button>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2>About TabEcho</h2>
        <div className="about">
          <p>
            <strong>Version:</strong> 1.0.0
          </p>
          <p>
            TabEcho automatically archives your idle tabs so you never lose important content.
          </p>
          <p>
            <a href="https://github.com/yourusername/tabecho" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            {' | '}
            <a href="mailto:support@tabecho.com">Support</a>
            {' | '}
            <a href="https://tabecho.com/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
