import { useState } from 'react'

export default function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {}
  }

  return (
    <div className="code">
      <div className="code-bar">
        <span>{lang}</span>
        <button onClick={copy} className="copy-btn">{copied ? 'Copied' : 'Copy'}</button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  )
}
