import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { searchApi, type SearchResultDto } from '../api/client'

type FlatResult = { id: string; label: string; sub: string; path: string }

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultDto | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const navigate = useNavigate()

  // Debounce search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null)
      setOpen(false)
      setActiveIndex(-1)
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchApi(query.trim())
        setResults(data)
        setOpen(true)
        setActiveIndex(-1)
      } catch {
        setResults(null)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const flatResults: FlatResult[] = results
    ? [
        ...results.sessions.map(s => ({ id: `session-${s.id}`, label: s.title, sub: s.conferenceName, path: `/sessions/${s.id}` })),
        ...results.speakers.map(sp => ({ id: `speaker-${sp.id}`, label: sp.name, sub: sp.company, path: `/speakers/${sp.id}` })),
      ]
    : []

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
      setActiveIndex(-1)
      return
    }
    if (!open || flatResults.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => (i + 1) % flatResults.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => (i <= 0 ? flatResults.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(flatResults[activeIndex].path)
    }
  }

  function handleSelect(path: string) {
    setOpen(false)
    setQuery('')
    setActiveIndex(-1)
    navigate(path)
  }

  const hasResults = results && (results.sessions.length > 0 || results.speakers.length > 0)
  const sessionCount = results?.sessions.length ?? 0

  return (
    <div ref={containerRef} className="relative w-64 hidden md:block">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
        <input
          type="text"
          role="combobox"
          aria-label="Search sessions and speakers"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={activeIndex >= 0 ? flatResults[activeIndex]?.id : undefined}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search sessions, speakers…"
          className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-brand-border bg-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent"
        />
        {loading && (
          <span
            role="status"
            aria-label="Searching…"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"
          />
        )}
      </div>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          className="absolute top-full mt-1 left-0 w-80 bg-brand-surface border border-brand-border rounded-xl shadow-lg z-50 overflow-hidden"
        >
          {!hasResults ? (
            <p role="status" className="px-4 py-3 text-sm text-brand-muted">No results found.</p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {results!.sessions.length > 0 && (
                <section aria-label="Sessions">
                  <div className="px-4 py-2 text-xs font-semibold text-brand-muted uppercase tracking-wide bg-brand-bg border-b border-brand-border" aria-hidden="true">
                    Sessions
                  </div>
                  {results!.sessions.map((s, i) => (
                    <button
                      key={s.id}
                      id={`session-${s.id}`}
                      role="option"
                      aria-selected={activeIndex === i}
                      onClick={() => handleSelect(`/sessions/${s.id}`)}
                      className={`w-full text-left px-4 py-2.5 transition-colors ${activeIndex === i ? 'bg-brand-accent/10' : 'hover:bg-brand-accent/10'}`}
                    >
                      <p className="text-sm font-medium text-slate-800 truncate">{s.title}</p>
                      <p className="text-xs text-brand-muted truncate">{s.conferenceName}</p>
                    </button>
                  ))}
                </section>
              )}
              {results!.speakers.length > 0 && (
                <section aria-label="Speakers">
                  <div className="px-4 py-2 text-xs font-semibold text-brand-muted uppercase tracking-wide bg-brand-bg border-b border-brand-border" aria-hidden="true">
                    Speakers
                  </div>
                  {results!.speakers.map((sp, i) => (
                    <button
                      key={sp.id}
                      id={`speaker-${sp.id}`}
                      role="option"
                      aria-selected={activeIndex === sessionCount + i}
                      onClick={() => handleSelect(`/speakers/${sp.id}`)}
                      className={`w-full text-left px-4 py-2.5 transition-colors ${activeIndex === sessionCount + i ? 'bg-brand-accent/10' : 'hover:bg-brand-accent/10'}`}
                    >
                      <p className="text-sm font-medium text-slate-800">{sp.name}</p>
                      <p className="text-xs text-brand-muted">{sp.company}</p>
                    </button>
                  ))}
                </section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
