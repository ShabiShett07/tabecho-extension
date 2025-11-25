import { useState, useEffect } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'
import { getSettings } from './storage/settings'
import type { TabEchoSettings } from './storage/db'

type View = 'dashboard' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [settings, setSettings] = useState<TabEchoSettings | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const userSettings = await getSettings()
    setSettings(userSettings)
  }

  const handleSettingsUpdate = () => {
    loadSettings()
    setCurrentView('dashboard')
  }

  if (!settings) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading TabEcho...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="logo-icon">🔄</span>
            TabEcho
          </h1>
          <div className="header-actions">
            {!settings.isPro && (
              <button className="upgrade-btn" onClick={() => alert('Stripe integration coming soon!')}>
                ⭐ Upgrade to Pro
              </button>
            )}
            <button
              className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`nav-btn ${currentView === 'settings' ? 'active' : ''}`}
              onClick={() => setCurrentView('settings')}
            >
              Settings
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {currentView === 'dashboard' && <Dashboard settings={settings} />}
        {currentView === 'settings' && (
          <Settings settings={settings} onUpdate={handleSettingsUpdate} />
        )}
      </main>
    </div>
  )
}

export default App
