import { Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { sheets, techs, categories, popularSlugs, recentSlugs, itemCount } from '../data/index.js'
import SheetCard from '../components/SheetCard.jsx'
import TechBadge from '../components/TechBadge.jsx'
import SearchIcon from '../components/SearchIcon.jsx'

const bySlug = slug => sheets.find(s => s.slug === slug)

export default function Home() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return []
    return sheets.filter(s => `${s.title} ${s.tech} ${s.description}`.toLowerCase().includes(t)).slice(0, 6)
  }, [q])

  const totalItems = sheets.reduce((n, s) => n + itemCount(s), 0)

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <h1>
            Find the command. <span className="accent">Copy it, ship it.</span>
          </h1>
          <p className="lead">
            {sheets.length} focused cheat sheets with {totalItems} copy-ready snippets, from first install to
            production deploys.
          </p>

          <div className="hero-search">
            <SearchIcon />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && matches[0] && navigate(`/sheets/${matches[0].slug}`)}
              placeholder="Try “migrate”, “rebase”, or “docker compose”…"
            />
            {matches.length > 0 && (
              <div className="hero-results">
                {matches.map(s => (
                  <Link key={s.slug} to={`/sheets/${s.slug}`} className="result">
                    <TechBadge tech={s.tech} size={28} />
                    <div className="result-text">
                      <strong>{s.title}</strong>
                      <span>{s.description}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <p className="hint">Tip: press <kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> anywhere to search inside every sheet.</p>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Browse by technology</h2>
          <Link to="/sheets" className="link">All sheets →</Link>
        </div>
        <div className="tech-grid">
          {Object.entries(techs).map(([name]) => {
            const first = sheets.find(s => s.tech === name)
            if (!first) return null
            return (
              <Link key={name} to={`/sheets?tech=${encodeURIComponent(name)}`} className="tech-chip">
                <TechBadge tech={name} size={30} />
                <span>{name}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Popular</h2>
          <Link to="/sheets" className="link">All sheets →</Link>
        </div>
        <div className="card-grid">
          {popularSlugs.map(s => <SheetCard key={s} sheet={bySlug(s)} />)}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Recently added</h2>
          <Link to="/sheets" className="link">All sheets →</Link>
        </div>
        <div className="card-grid">
          {recentSlugs.map(s => <SheetCard key={s} sheet={bySlug(s)} />)}
        </div>
      </section>

      <section className="container section">
        <div className="section-head"><h2>Categories</h2></div>
        <div className="cat-grid">
          {categories.map(c => (
            <Link key={c.id} to={`/categories/${c.id}`} className="cat-card">
              <h3>{c.name}</h3>
              <p className="muted">{c.description}</p>
              <span className="link">{sheets.filter(s => s.category === c.id).length} sheets →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
