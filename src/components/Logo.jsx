export default function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--blue)" />
      <path d="M10 9h9l3 3v11H10z" fill="#fff" />
      <path d="M13 15h6M13 18h6M13 21h4" stroke="var(--blue)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
