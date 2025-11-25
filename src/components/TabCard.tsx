import { useState, useEffect } from 'react'
import type { ArchivedTab } from '../storage/db'
import './TabCard.css'

interface TabCardProps {
  tab: ArchivedTab
  onRestore: (url: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<ArchivedTab>) => void
  isPro: boolean
}

export default function TabCard({ tab, onRestore, onDelete, onUpdate, isPro }: TabCardProps) {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTags, setEditedTags] = useState(tab.tags.join(', '))
  const [editedProject, setEditedProject] = useState(tab.project || '')

  useEffect(() => {
    if (tab.screenshot && isPro) {
      const url = URL.createObjectURL(tab.screenshot)
      setScreenshotUrl(url)

      return () => URL.revokeObjectURL(url)
    }
  }, [tab.screenshot, isPro])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const handleSaveEdit = () => {
    const tags = editedTags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    onUpdate(tab.id, {
      tags,
      project: editedProject.trim() || undefined,
    })
    setIsEditing(false)
  }

  const getDomainIcon = () => {
    if (tab.favIconUrl) {
      return <img src={tab.favIconUrl} alt="" className="favicon" />
    }
    return <span className="favicon-placeholder">🌐</span>
  }

  return (
    <div className="tab-card">
      {screenshotUrl && isPro && (
        <div className="tab-screenshot">
          <img src={screenshotUrl} alt={tab.title} />
          <div className="screenshot-overlay">
            <span className="pro-badge">PRO</span>
          </div>
        </div>
      )}

      <div className="tab-content">
        <div className="tab-header">
          <div className="tab-title-row">
            {getDomainIcon()}
            <h4 className="tab-title">{tab.title}</h4>
          </div>
          <span className="tab-time">{formatTime(tab.timestamp)}</span>
        </div>

        <a href={tab.url} className="tab-url" target="_blank" rel="noopener noreferrer">
          {tab.url}
        </a>

        <div className="tab-meta">
          <span className="tab-domain">{tab.domain}</span>
          {tab.idleDuration && (
            <span className="tab-idle">
              Idle: {Math.floor(tab.idleDuration / 60000)}m
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="tab-edit">
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              value={editedTags}
              onChange={(e) => setEditedTags(e.target.value)}
              className="edit-input"
            />
            <input
              type="text"
              placeholder="Project (optional)"
              value={editedProject}
              onChange={(e) => setEditedProject(e.target.value)}
              className="edit-input"
            />
            <div className="edit-actions">
              <button onClick={handleSaveEdit} className="btn-save">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {(tab.tags.length > 0 || tab.project) && (
              <div className="tab-tags">
                {tab.project && <span className="tag tag-project">📁 {tab.project}</span>}
                {tab.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        <div className="tab-actions">
          <button onClick={() => onRestore(tab.url)} className="btn-action btn-restore">
            <span>🔄</span> Restore
          </button>
          <button onClick={() => setIsEditing(!isEditing)} className="btn-action btn-edit">
            <span>✏️</span> {isEditing ? 'Cancel' : 'Edit'}
          </button>
          <button onClick={() => onDelete(tab.id)} className="btn-action btn-delete">
            <span>🗑️</span> Delete
          </button>
        </div>
      </div>
    </div>
  )
}
