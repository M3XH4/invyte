import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'invyte_admin_dark_mode'

type ThemeContextValue = {
  isDarkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (value: boolean) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialDarkMode(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) return stored === 'true'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', isDarkMode)
    localStorage.setItem(STORAGE_KEY, String(isDarkMode))
  }, [isDarkMode])

  const toggleDarkMode = useCallback(() => setIsDarkMode((v) => !v), [])
  const setDarkMode = useCallback((value: boolean) => setIsDarkMode(value), [])

  const value = useMemo(
    () => ({ isDarkMode, toggleDarkMode, setDarkMode }),
    [isDarkMode, toggleDarkMode, setDarkMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
