import { Link } from 'react-router-dom'
import TechBadge from './TechBadge.jsx'
import { itemCount } from '../data/index.js'

export default function SheetCard({ sheet }) {
  const total = itemCount(sheet)

  return (
    <Link to={`/sheets/${sheet.slug}`} className="sheet-card">
      <div className="sheet-card-top">
        <TechBadge tech={sheet.tech} />
        <h3>{sheet.title}</h3>
      </div>
      <p title={sheet.description}>{sheet.description}</p>
      <div className="sheet-card-meta">
        <span>{sheet.tech}</span>
        <span>·</span>
        <span>{sheet.minutes} min</span>
        <span>·</span>
        <span>{total} items</span>
      </div>
    </Link>
  )
}
