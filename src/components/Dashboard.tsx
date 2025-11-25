import { useState, useEffect } from 'react'
import type { ArchivedTab, TabEchoSettings } from '../storage/db'
import TabCard from './TabCard'
import SearchBar from './SearchBar'
import Filters from './Filters'
import './Dashboard.css'

interface DashboardProps {
  settings: TabEchoSettings
}

export default function Dashboard({ settings }: DashboardProps) {
  const [tabs, setTabs] = useState<ArchivedTab[]>([])
  const [filteredTabs, setFilteredTabs] = useState<ArchivedTab[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [tabCount, setTabCount] = useState(0)

  useEffect(() => {
    loadTabs()
    loadTabCount()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [tabs, searchQuery, selectedDomain, selectedProject])

  const loadTabs = async () => {
    setLoading(true)
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getArchivedTabs',
        limit: settings.isPro ? undefined : settings.retentionLimit,
      })

      if (response.success) {
        setTabs(response.tabs)
      }
    } catch (error) {
      console.error('Error loading tabs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTabCount = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getTabCount' })
      if (response.success) {
        setTabCount(response.count)
      }
    } catch (error) {
      console.error('Error loading tab count:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...tabs]

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (tab) =>
          tab.title.toLowerCase().includes(query) ||
          tab.url.toLowerCase().includes(query) ||
          tab.domain.toLowerCase().includes(query) ||
          tab.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // Apply domain filter
    if (selectedDomain !== 'all') {
      filtered = filtered.filter((tab) => tab.domain === selectedDomain)
    }

    // Apply project filter
    if (selectedProject !== 'all') {
      filtered = filtered.filter((tab) => tab.project === selectedProject)
    }

    setFilteredTabs(filtered)
  }

  const handleRestoreTab = async (url: string) => {
    try {
      await chrome.runtime.sendMessage({ action: 'restoreTab', url })
    } catch (error) {
      console.error('Error restoring tab:', error)
    }
  }

  const handleDeleteTab = async (id: string) => {
    try {
      await chrome.runtime.sendMessage({ action: 'deleteTab', id })
      setTabs(tabs.filter((tab) => tab.id !== id))
      loadTabCount()
    } catch (error) {
      console.error('Error deleting tab:', error)
    }
  }

  const handleUpdateTab = async (id: string, updates: Partial<ArchivedTab>) => {
    try {
      await chrome.runtime.sendMessage({ action: 'updateTab', id, updates })
      setTabs(tabs.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab)))
    } catch (error) {
      console.error('Error updating tab:', error)
    }
  }

  const getDomains = () => {
    const domains = new Set(tabs.map((tab) => tab.domain))
    return Array.from(domains).sort()
  }

  const getProjects = () => {
    const projects = new Set(
      tabs.map((tab) => tab.project).filter((p): p is string => !!p)
    )
    return Array.from(projects).sort()
  }

  const groupTabsByDate = () => {
    const groups: { [key: string]: ArchivedTab[] } = {}

    filteredTabs.forEach((tab) => {
      const date = new Date(tab.timestamp)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      let label: string

      if (date.toDateString() === today.toDateString()) {
        label = 'Today'
      } else if (date.toDateString() === yesterday.toDateString()) {
        label = 'Yesterday'
      } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        label = 'This Week'
      } else if (date > new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
        label = 'This Month'
      } else {
        label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }

      if (!groups[label]) {
        groups[label] = []
      }
      groups[label].push(tab)
    })

    return groups
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading archived tabs...</p>
      </div>
    )
  }

  const groupedTabs = groupTabsByDate()

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="stats">
          <div className="stat-card">
            <span className="stat-value">{tabCount}</span>
            <span className="stat-label">Total Archived</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{filteredTabs.length}</span>
            <span className="stat-label">Showing</span>
          </div>
          {!settings.isPro && (
            <div className="stat-card warning">
              <span className="stat-value">{settings.retentionLimit - tabCount}</span>
              <span className="stat-label">Slots Remaining</span>
            </div>
          )}
        </div>

        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <Filters
          domains={getDomains()}
          projects={getProjects()}
          selectedDomain={selectedDomain}
          selectedProject={selectedProject}
          onDomainChange={setSelectedDomain}
          onProjectChange={setSelectedProject}
          isPro={settings.isPro}
        />
      </div>

      <div className="timeline">
        {filteredTabs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h2>No archived tabs yet</h2>
            <p>
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'TabEcho will automatically archive your idle tabs'}
            </p>
          </div>
        ) : (
          Object.entries(groupedTabs).map(([label, groupTabs]) => (
            <div key={label} className="timeline-group">
              <h3 className="timeline-label">{label}</h3>
              <div className="timeline-cards">
                {groupTabs.map((tab) => (
                  <TabCard
                    key={tab.id}
                    tab={tab}
                    onRestore={handleRestoreTab}
                    onDelete={handleDeleteTab}
                    onUpdate={handleUpdateTab}
                    isPro={settings.isPro}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
