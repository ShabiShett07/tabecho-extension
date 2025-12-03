import { useState, useEffect } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'
import { getSettings, updateSettings } from './storage/settings'
import type { TabEchoSettings } from './storage/db'

type View = 'dashboard' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [settings, setSettings] = useState<TabEchoSettings | null>(null)
  const [isEnabled, setIsEnabled] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const userSettings = await getSettings()
    setSettings(userSettings)
    setIsEnabled(userSettings.autoArchive)
  }

  const handleSettingsUpdate = () => {
    loadSettings()
    setCurrentView('dashboard')
  }

  const handleToggle = async () => {
    const newState = !isEnabled
    setIsEnabled(newState)
    await updateSettings({ autoArchive: newState })
    await loadSettings()
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
    <div className={`app ${!isEnabled ? 'app-disabled' : ''}`}>
      <header className="app-header">
        <div className="header-content">
          <img src="/logo.png" alt="TabEcho" className="logo-icon" />
          <h1 className="app-title">
            TabEcho
          </h1>
          <div className="header-actions">
            <label className="global-toggle" title={isEnabled ? 'Disable TabEcho' : 'Enable TabEcho'}>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={handleToggle}
              />
              <span className="global-toggle-slider"></span>
            </label>
            {!settings.isPro && (
              <button className="upgrade-btn" onClick={() => setCurrentView('settings')}>
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
