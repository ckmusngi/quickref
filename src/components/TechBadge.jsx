import { techs } from '../data/index.js'

// Simple monogram badges instead of third-party logos — all in the blue palette.
// Font scales with the badge text so "L" and "HTTP" both fit nicely.
const SCALE = { 1: 0.5, 2: 0.42, 3: 0.36 }

export default function TechBadge({ tech, size = 36 }) {
  const t = techs[tech] || { short: tech.slice(0, 1) }
  const fontSize = size * (SCALE[t.short.length] ?? 0.3)
  return (
    <span className="tech-badge" style={{ width: size, height: size, fontSize }} aria-hidden="true">
      {t.short}
    </span>
  )
}
