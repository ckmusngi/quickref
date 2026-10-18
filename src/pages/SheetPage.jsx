import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom'
import { sheets, slugAliases } from '../data/index.js'
import TechBadge from '../components/TechBadge.jsx'
import CodeBlock from '../components/CodeBlock.jsx'
import NotFound from './NotFound.jsx'

// Consecutive sections that share a `group` are shown together under one heading.
function groupRuns(sections) {
  const runs = []
  for (const sec of sections) {
    const last = runs[runs.length - 1]
    if (sec.group && last?.group === sec.group) last.sections.push(sec)
    else runs.push({ group: sec.group, id: sec.group ? 'group-' + sec.group.toLowerCase().replace(/[^a-z0-9]+/g, '-') : sec.id, sections: [sec] })
  }
  return runs
}

const scrollTo = id => e => {
  e.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function SheetPage() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const sheet = sheets.find(s => s.slug === slug)
  const [filter, setFilter] = useState('')

  const focusId = params.get('item')
  useEffect(() => {
    if (!focusId) return
    const el = document.getElementById(focusId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('flash')
      setTimeout(() => el.classList.remove('flash'), 1600)
    }
  }, [focusId, slug])

  const sections = useMemo(() => {
    if (!sheet) return []
    const t = filter.trim().toLowerCase()
    return sheet.sections
      .map(sec => ({
        ...sec,
        items: sec.items.filter(i =>
          (!t || `${i.title} ${i.code || ''} ${i.note || ''} ${(i.then || []).map(x => x.code).join(' ')}`.toLowerCase().includes(t)),
        ),
      }))
      .filter(sec => sec.items.length)
  }, [sheet, filter])

  if (!sheet && slugAliases[slug]) return <Navigate to={`/sheets/${slugAliases[slug]}`} replace />
  if (!sheet) return <NotFound />

  const related = sheets.filter(s => s.slug !== sheet.slug && (s.tech === sheet.tech || s.category === sheet.category)).slice(0, 3)

  return (
    <div className="container page sheet-layout">
      <aside className="toc">
        <div className="toc-inner">
          <Link to="/sheets" className="link">← All sheets</Link>
          <h4>On this sheet</h4>
          {groupRuns(sheet.sections).map(run => run.group ? (
            <div key={run.id} className="toc-group">
              <a href={`#/sheets/${sheet.slug}`} className="toc-group-title" onClick={scrollTo(run.id)}>{run.group}</a>
              {run.sections.map(sec => (
                <a key={sec.id} href={`#/sheets/${sheet.slug}`} onClick={scrollTo(sec.id)}>{sec.title}</a>
              ))}
            </div>
          ) : (
            <a key={run.id} href={`#/sheets/${sheet.slug}`} onClick={scrollTo(run.id)}>{run.sections[0].title}</a>
          ))}
          {related.length > 0 && (
            <>
              <h4>Related</h4>
              {related.map(r => <Link key={r.slug} to={`/sheets/${r.slug}`}>{r.title}</Link>)}
            </>
          )}
        </div>
      </aside>

      <article className="sheet">
        <header className="sheet-head">
          <TechBadge tech={sheet.tech} size={52} />
          <div>
            <h1>{sheet.title}</h1>
            <p className="muted">{sheet.description}</p>
            <div className="sheet-card-meta">
              <span>{sheet.tech}</span><span>·</span>
              <span>{sheet.minutes} min read</span>
            </div>
          </div>
        </header>

        <div className="filters">
          <input className="input" value={filter} onChange={e => setFilter(e.target.value)} placeholder={`Search in ${sheet.title}…`} />
        </div>

        {sections.length === 0 && <div className="empty-state">Nothing to show.</div>}

        {groupRuns(sections).map(run => (
          <div key={run.id} id={run.group ? run.id : undefined} className={run.group ? 'sheet-group' : undefined}>
            {run.group && <h2 className="group-title">{run.group}</h2>}
            {run.sections.map(sec => (
              <section key={sec.id} id={sec.id} className="sheet-section">
                <h2>{sec.title}</h2>
                <div className="item-grid">
                  {sec.items.map(item => {
                    // Long snippets get the full row so lines aren't clipped
                    const lines = [item.code, ...(item.then || []).map(x => x.code)].filter(Boolean).join('\n').split('\n')
                    const wide = lines.length > 10 || lines.some(l => l.length > 52)
                    return (
                      <div key={item.id} id={item.id} className={`item ${wide ? 'wide' : ''}`}>
                        <div className="item-head">
                          <h3>{item.title}</h3>
                        </div>
                        {item.note && <p className="item-note">{item.note}</p>}
                        {item.code && <CodeBlock code={item.code} lang={item.lang || sheet.lang} />}
                        {item.then?.map((extra, n) => (
                          <div key={n} className="item-then">
                            {extra.label && <span className="then-label">{extra.label}</span>}
                            <CodeBlock code={extra.code} lang={extra.lang || 'bash'} />
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        ))}
      </article>
    </div>
  )
}
