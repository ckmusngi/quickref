import { Link } from 'react-router-dom'
import { categories, sheets } from '../data/index.js'
import TechBadge from '../components/TechBadge.jsx'

export default function Categories() {
  return (
    <div className="container page">
      <div className="page-head">
        <h1>Categories</h1>
        <p className="muted">Sheets grouped by the kind of work they help with.</p>
      </div>
      <div className="cat-grid">
        {categories.map(c => {
          const list = sheets.filter(s => s.category === c.id)
          return (
            <Link key={c.id} to={`/categories/${c.id}`} className="cat-card">
              <h3>{c.name}</h3>
              <p className="muted">{c.description}</p>
              <div className="badge-row">
                {[...new Set(list.map(s => s.tech))].map(t => <TechBadge key={t} tech={t} size={26} />)}
              </div>
              <span className="link">{list.length} sheets →</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
