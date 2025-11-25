import './Filters.css'

interface FiltersProps {
  domains: string[]
  projects: string[]
  selectedDomain: string
  selectedProject: string
  onDomainChange: (domain: string) => void
  onProjectChange: (project: string) => void
  isPro: boolean
}

export default function Filters({
  domains,
  projects,
  selectedDomain,
  selectedProject,
  onDomainChange,
  onProjectChange,
  isPro,
}: FiltersProps) {
  return (
    <div className="filters">
      <div className="filter-group">
        <label className="filter-label">Domain:</label>
        <select
          value={selectedDomain}
          onChange={(e) => onDomainChange(e.target.value)}
          className={`filter-select ${!isPro ? 'pro-feature' : ''}`}
          disabled={!isPro && domains.length > 0}
        >
          <option value="all">All Domains</option>
          {domains.map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>
        {!isPro && <span className="pro-label">PRO</span>}
      </div>

      <div className="filter-group">
        <label className="filter-label">Project:</label>
        <select
          value={selectedProject}
          onChange={(e) => onProjectChange(e.target.value)}
          className={`filter-select ${!isPro ? 'pro-feature' : ''}`}
          disabled={!isPro && projects.length > 0}
        >
          <option value="all">All Projects</option>
          {projects.map((project) => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </select>
        {!isPro && <span className="pro-label">PRO</span>}
      </div>
    </div>
  )
}
