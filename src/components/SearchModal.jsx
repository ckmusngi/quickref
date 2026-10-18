import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { sheets, popularSlugs } from '../data/index.js'
import TechBadge from './TechBadge.jsx'
import SearchIcon from './SearchIcon.jsx'

// Searches sheet titles/descriptions AND the individual items inside each sheet.
export default function SearchModal({ onClose }) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => { inputRef.current?.focus() }, [])

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) {
      return popularSlugs.map(s => {
        const sheet = sheets.find(x => x.slug === s)
        return { type: 'sheet', sheet }
      })
    }
    const out = []
    for (const sheet of sheets) {
      const hay = `${sheet.title} ${sheet.tech} ${sheet.description}`.toLowerCase()
      if (hay.includes(term)) out.push({ type: 'sheet', sheet })
    }
    for (const sheet of sheets) {
      for (const section of sheet.sections) {
        for (const item of section.items) {
          const hay = `${item.title} ${item.code || ''} ${item.note || ''} ${(item.then || []).map(x => x.code).join(' ')}`.toLowerCase()
          if (hay.includes(term)) out.push({ type: 'item', sheet, section, item })
        }
      }
    }
    return out.slice(0, 30)
  }, [q])

  const open = r => {
    onClose()
    navigate(`/sheets/${r.sheet.slug}${r.type === 'item' ? `?item=${r.item.id}` : ''}`)
  }

  const onKey = e => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    if (e.key === 'Enter' && results[active]) open(results[active])
  }

  // Portal to <body>: the header's backdrop-filter would otherwise trap the fixed backdrop inside the header
  return createPortal(
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={e => e.stopPropagation()} onKeyDown={onKey}>
        <div className="modal-search">
          <SearchIcon />
          <input
            ref={inputRef}
            value={q}
            onChange={e => { setQ(e.target.value); setActive(0) }}
            placeholder="Search sheets and commands…"
          />
          <kbd>esc</kbd>
        </div>
        <div className="modal-results">
          {!q && <div className="modal-group">Popular sheets</div>}
          {results.length === 0 && <div className="empty">No matches for “{q}”.</div>}
          {results.map((r, i) => (
            <button
              key={r.type + r.sheet.slug + (r.item?.id || '')}
              className={`result ${i === active ? 'active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => open(r)}
            >
              <TechBadge tech={r.sheet.tech} size={28} />
              <div className="result-text">
                <strong>{r.type === 'item' ? r.item.title : r.sheet.title}</strong>
                <span>{r.type === 'item' ? `${r.sheet.title} › ${r.section.group ? r.section.group + ' › ' : ''}${r.section.title}` : r.sheet.description}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="modal-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
