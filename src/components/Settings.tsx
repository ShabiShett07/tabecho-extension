import { useState, useEffect } from 'react'
import type { TabEchoSettings } from '../storage/db'
import { updateSettings } from '../storage/settings'
import {
  openPayPalCheckout,
  openRazorpayCheckout,
  checkSubscriptionStatus,
  cancelSubscription,
  getRecommendedProvider,
  type PaymentProvider,
} from '../services/payments'
import { PAYMENT_CONFIG, detectUserCountry, saveUserCountry } from '../config/payments'
import './Settings.css'

interface SettingsProps {
  settings: TabEchoSettings
  onUpdate: () => void
}

export default function Settings({ settings, onUpdate }: SettingsProps) {
  const [idleThreshold, setIdleThreshold] = useState(settings.idleThreshold)
  const [autoArchive, setAutoArchive] = useState(settings.autoArchive)
  const [enableScreenshots, setEnableScreenshots] = useState(settings.enableScreenshots)
  const [autoCloseArchivedTabs, setAutoCloseArchivedTabs] = useState(settings.autoCloseArchivedTabs)
  const [excludedDomains, setExcludedDomains] = useState(settings.domains.join(', '))
  const [saving, setSaving] = useState(false)
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('paypal')
  const [userCountry, setUserCountry] = useState<'IN' | 'OTHER'>('OTHER')

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
        autoCloseArchivedTabs,
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

  const handleUpgrade = async (plan: 'monthly' | 'yearly') => {
    try {
      if (paymentProvider === 'razorpay') {
        await openRazorpayCheckout(plan)
      } else {
        await openPayPalCheckout(plan)
      }
    } catch (error) {
      console.error('Error opening checkout:', error)
      alert('Failed to open checkout. Please try again.')
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features.')) {
      return
    }

    try {
      await cancelSubscription()
      alert('Subscription cancelled successfully.')
      onUpdate()
    } catch (error) {
      console.error('Error canceling subscription:', error)
      alert('Failed to cancel subscription. Please try again.')
    }
  }

  const handleCountryChange = async (country: 'IN' | 'OTHER') => {
    setUserCountry(country)
    await saveUserCountry(country)
    setPaymentProvider(country === 'IN' ? 'razorpay' : 'paypal')
  }

  // Check subscription status and detect country on mount
  useEffect(() => {
    checkSubscriptionStatus()

    // Detect user country and set payment provider
    detectUserCountry().then((country) => {
      setUserCountry(country)
      setPaymentProvider(country === 'IN' ? 'razorpay' : 'paypal')
    })
  }, [])

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
          <label className="setting-checkbox">
            <input
              type="checkbox"
              checked={autoCloseArchivedTabs}
              onChange={(e) => setAutoCloseArchivedTabs(e.target.checked)}
            />
            <span>
              <strong>Auto-Close Archived Tabs</strong>
              <span className="setting-description">
                Automatically close tabs when they are archived
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
              </ul>
              <button onClick={handleCancelSubscription} className="btn-secondary" style={{ marginTop: '1rem' }}>
                Cancel Subscription
              </button>
            </>
          ) : (
            <>
              <h3>Upgrade to TabEcho Pro</h3>

              {/* Country Selector */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Select your region:
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => handleCountryChange('OTHER')}
                    className={userCountry === 'OTHER' ? 'btn-primary' : 'btn-secondary'}
                    style={{ flex: 1 }}
                  >
                    🌍 International (PayPal)
                  </button>
                  <button
                    onClick={() => handleCountryChange('IN')}
                    className={userCountry === 'IN' ? 'btn-primary' : 'btn-secondary'}
                    style={{ flex: 1 }}
                  >
                    🇮🇳 India (Razorpay)
                  </button>
                </div>
              </div>

              {/* Pricing Display */}
              <p className="price">
                {paymentProvider === 'razorpay' ? (
                  <>₹{PAYMENT_CONFIG.pricing.monthly.inr}/month or ₹{PAYMENT_CONFIG.pricing.yearly.inr}/year (save 17%)</>
                ) : (
                  <>${PAYMENT_CONFIG.pricing.monthly.usd}/month or ${PAYMENT_CONFIG.pricing.yearly.usd}/year (save 17%)</>
                )}
              </p>

              <ul className="feature-list">
                <li>📸 Screenshot thumbnails</li>
                <li>∞ Unlimited archive storage</li>
                <li>🔍 Advanced search & filters</li>
                <li>🏷️ Tags & Project organization</li>
                <li>💾 Export/Import data</li>
              </ul>

              {/* Payment Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => handleUpgrade('monthly')}
                  className="btn-upgrade"
                  style={{ flex: 1 }}
                >
                  {paymentProvider === 'razorpay' ? '₹' : '$'}
                  {paymentProvider === 'razorpay'
                    ? PAYMENT_CONFIG.pricing.monthly.inr
                    : PAYMENT_CONFIG.pricing.monthly.usd}
                  /month
                </button>
                <button
                  onClick={() => handleUpgrade('yearly')}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  {paymentProvider === 'razorpay' ? '₹' : '$'}
                  {paymentProvider === 'razorpay'
                    ? PAYMENT_CONFIG.pricing.yearly.inr
                    : PAYMENT_CONFIG.pricing.yearly.usd}
                  /year 💎
                </button>
              </div>

              <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280', textAlign: 'center' }}>
                Secure payment via {paymentProvider === 'razorpay' ? 'Razorpay' : 'PayPal'}
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
            <a href="https://github.com/YOUR_USERNAME/tabecho-extension" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            {' | '}
            <a href="mailto:YOUR_EMAIL@example.com">Support</a>
            {' | '}
            <a href="https://YOUR_DOMAIN.com/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
