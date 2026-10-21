import { useState } from 'react'

const FolderIcon = () => (
  <svg className="tree-icon" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M1.5 4.5A1.5 1.5 0 0 1 3 3h3.2l1.5 1.5H13A1.5 1.5 0 0 1 14.5 6v5.5A1.5 1.5 0 0 1 13 13H3a1.5 1.5 0 0 1-1.5-1.5z" fill="currentColor" />
  </svg>
)

const FileIcon = () => (
  <svg className="tree-icon" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 1.5h5L12.5 5v9a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 .5-.5z" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <path d="M9 1.5V5h3.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)

// Renders a `lang: 'tree'` snippet: "├── name/   # comment" lines become guide, icon, name, comment
function Tree({ code }) {
  return (
    <div className="tree">
      {code.split('\n').map((line, i) => {
        const [, guide, name, comment] = line.match(/^([\s│├└─]*)(.*?)(?:\s+#\s?(.*))?$/)
        const isDir = /\/$/.test(name)
        return (
          <div key={i} className={`tree-row ${isDir ? 'is-dir' : 'is-file'}`}>
            <span className="tree-guide">{guide}</span>
            {name && (isDir ? <FolderIcon /> : <FileIcon />)}
            <span className="tree-name">{name}</span>
            {comment && <span className="tree-comment">{comment}</span>}
          </div>
        )
      })}
    </div>
  )
}

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
    <div className={`code ${lang === 'tree' ? 'code-tree' : ''}`}>
      <div className="code-bar">
        <span>{lang}</span>
        <button onClick={copy} className="copy-btn">{copied ? 'Copied' : 'Copy'}</button>
      </div>
      {lang === 'tree' ? <Tree code={code} /> : <pre><code>{code}</code></pre>}
    </div>
  )
}
