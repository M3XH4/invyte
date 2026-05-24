import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Loader2, Palette, Search, Tags, UserCheck, Users } from 'lucide-react'
import { searchApi, type SearchResults } from '@/api/searchApi'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const emptyResults: SearchResults = {
  events: [],
  users: [],
  guests: [],
  categories: [],
  themes: [],
}

export function GlobalSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResults>(emptyResults)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults(emptyResults)
      setLoading(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchApi.search(query.trim())
        setResults(data)
        setActiveIndex(0)
      } catch {
        setResults(emptyResults)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const flatItems = [
    ...results.events.map((e) => ({ type: 'event' as const, id: e.id, label: e.title, path: '/events' })),
    ...results.users.map((u) => ({ type: 'user' as const, id: u.id, label: u.name, path: '/users' })),
    ...results.guests.map((g) => ({ type: 'guest' as const, id: g.id, label: g.name, path: '/guests' })),
    ...results.categories.map((c) => ({
      type: 'category' as const,
      id: c.id,
      label: c.name,
      path: '/categories',
    })),
    ...results.themes.map((t) => ({ type: 'theme' as const, id: t.id, label: t.name, path: '/themes' })),
  ]

  const hasResults = flatItems.length > 0
  const showDropdown = open && query.trim().length > 0

  const goTo = (path: string) => {
    navigate(path)
    setOpen(false)
    setQuery('')
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && flatItems[activeIndex]) {
      e.preventDefault()
      goTo(flatItems[activeIndex].path)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const sections = [
    { key: 'events', title: 'Events', icon: Calendar, items: results.events },
    { key: 'users', title: 'Users', icon: Users, items: results.users },
    { key: 'guests', title: 'Guests', icon: UserCheck, items: results.guests },
    { key: 'categories', title: 'Categories', icon: Tags, items: results.categories },
    { key: 'themes', title: 'Themes', icon: Palette, items: results.themes },
  ] as const

  let runningIndex = 0

  return (
    <div ref={containerRef} className="relative max-w-md flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        className="pl-9 dark:bg-white/5 dark:text-white"
        placeholder="Search events, users, guests..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-purple-500/10 dark:border-white/10 dark:bg-[#11131f]">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          )}
          {!loading && !hasResults && (
            <p className="px-4 py-6 text-center text-sm text-gray-500">No results found</p>
          )}
          {!loading &&
            sections.map((section) => {
              if (!section.items.length) return null
              const Icon = section.icon
              return (
                <div key={section.key} className="border-b border-gray-50 p-2 last:border-0 dark:border-white/5">
                  <p className="px-2 py-1 text-xs font-bold uppercase tracking-wide text-purple-600 dark:text-purple-300">
                    {section.title}
                  </p>
                  {section.items.map((item) => {
                    const idx = runningIndex++
                    const label = 'title' in item ? item.title : item.name
                    const path =
                      section.key === 'events'
                        ? '/events'
                        : section.key === 'users'
                          ? '/users'
                          : section.key === 'guests'
                            ? '/guests'
                            : section.key === 'categories'
                              ? '/categories'
                              : '/themes'
                    return (
                      <button
                        key={`${section.key}-${'id' in item ? item.id : label}`}
                        type="button"
                        className={cn(
                          'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors',
                          idx === activeIndex
                            ? 'bg-purple-50 text-purple-900 dark:bg-purple-500/20 dark:text-white'
                            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5',
                        )}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => goTo(path)}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-purple-500" />
                        <span className="truncate">{label}</span>
                      </button>
                    )
                  })}
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
