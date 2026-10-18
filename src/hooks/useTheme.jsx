import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

// Light by default; only an explicit toggle is remembered.
// (The old 'qr-theme' key was saved automatically from the OS setting, so it is ignored.)
const KEY = 'qr-theme-choice'

function initialTheme() {
  try {
    if (localStorage.getItem(KEY) === 'dark') return 'dark'
  } catch {}
  return 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggle = () =>
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark'
      try { localStorage.setItem(KEY, next) } catch {}
      return next
    })

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
