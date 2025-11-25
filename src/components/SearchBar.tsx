import './SearchBar.css'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        placeholder="Search tabs by title, URL, domain, or tags..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
      />
      {value && (
        <button onClick={() => onChange('')} className="clear-btn">
          ✕
        </button>
      )}
    </div>
  )
}
