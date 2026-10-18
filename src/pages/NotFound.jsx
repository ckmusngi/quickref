import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container page center">
      <h1>Page not found</h1>
      <p className="muted">That sheet or page doesn't exist.</p>
      <Link to="/" className="btn">Back home</Link>
    </div>
  )
}
