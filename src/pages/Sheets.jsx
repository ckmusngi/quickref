import { useMemo, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { sheets, categories, techs } from '../data/index.js'
import SheetCard from '../components/SheetCard.jsx'

export default function Sheets() {
  const { cat } = useParams()
  const [params, setParams] = useSearchParams()
  const tech = params.get('tech') || 'all'
  const [q, setQ] = useState('')

  const category = categories.find(c => c.id === cat)

  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    return sheets.filter(s =>
      (!cat || s.category === cat)
      && (tech === 'all' || s.tech === tech)
      && (!t || `${s.title} ${s.tech} ${s.description}`.toLowerCase().includes(t)),
    )
  }, [cat, tech, q])

  const setTech = v => {
    const next = new URLSearchParams(params)
    if (v === 'all') next.delete('tech'); else next.set('tech', v)
    setParams(next)
  }

  return (
    <div className="container page">
      <div className="page-head">
        {category ? (
          <>
            <Link to="/categories" className="link">← Categories</Link>
            <h1>{category.name}</h1>
            <p className="muted">{category.description}</p>
          </>
        ) : (
          <>
            <h1>All sheets</h1>
            <p className="muted">{sheets.length} references across {Object.keys(techs).length} technologies.</p>
          </>
        )}
      </div>

      <div className="filters">
        <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Filter sheets…" />
        <select className="input" value={tech} onChange={e => setTech(e.target.value)}>
          <option value="all">All technologies</option>
          {Object.keys(techs).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {list.length ? (
        <div className="card-grid">{list.map(s => <SheetCard key={s.slug} sheet={s} />)}</div>
      ) : (
        <div className="empty-state">No sheets match those filters.</div>
      )}
    </div>
  )
}
