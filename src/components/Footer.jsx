import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import { categories } from '../data/index.js'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand"><Logo size={24} /> <span>QuickRef</span></div>
          <p className="muted">Short, practical references for everyday development work.</p>
        </div>
        <div>
          <h4>Popular</h4>
          <Link to="/sheets/laravel">Laravel</Link>
          <Link to="/sheets/git">Git</Link>
          <Link to="/sheets/docker">Docker</Link>
        </div>
        <div>
          <h4>Categories</h4>
          {categories.map(c => (
            <Link key={c.id} to={`/categories/${c.id}`}>{c.name}</Link>
          ))}
        </div>
        <div>
          <h4>Browse</h4>
          <Link to="/sheets">All sheets</Link>
          <Link to="/categories">Categories</Link>
        </div>
      </div>
      <div className="container footer-bottom muted">© {new Date().getFullYear()} QuickRef</div>
    </footer>
  )
}
