import { Link, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTheme } from '../hooks/useTheme.jsx'
import SearchModal from './SearchModal.jsx'
import SearchIcon from './SearchIcon.jsx'
import Logo from './Logo.jsx'

export default function Header() {
  const { theme, toggle } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onKey = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(o => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <Logo /> <span>QuickRef</span>
        </Link>

        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/sheets" onClick={closeMenu}>All Sheets</NavLink>
          <NavLink to="/categories" onClick={closeMenu}>Categories</NavLink>
        </nav>

        <div className="header-actions">
          <button className="search-trigger" onClick={() => setSearchOpen(true)} aria-label="Search">
            <SearchIcon /> <span className="search-label">Search…</span>
            <kbd>⌘K</kbd>
          </button>
          <button className="icon-btn" onClick={toggle} aria-label="Toggle theme" title="Toggle light / dark">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button className="icon-btn menu-btn" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <MenuIcon />
          </button>
        </div>
      </div>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </header>
  )
}

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
)
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
)
const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
)
