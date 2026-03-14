import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { searchApi, type SearchResultDto } from '../api/client'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultDto | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Debounce search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null)
      setOpen(false)
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchApi(query.trim())
        setResults(data)
        setOpen(true)
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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
    }
  }

  function handleSelect(path: string) {
    setOpen(false)
    setQuery('')
    navigate(path)
  }

  const hasResults =
    results && (results.sessions.length > 0 || results.speakers.length > 0)

  return (
    <div ref={containerRef} className="relative w-64 hidden md:block">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search sessions, speakers…"
          className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {!hasResults ? (
            <p className="px-4 py-3 text-sm text-slate-500">No results found.</p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {results!.sessions.length > 0 && (
                <section>
                  <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-50 border-b border-slate-100">
                    Sessions
                  </div>
                  {results!.sessions.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleSelect(`/sessions/${s.id}`)}
                      className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-800 truncate">{s.title}</p>
                      <p className="text-xs text-slate-500 truncate">{s.conferenceName}</p>
                    </button>
                  ))}
                </section>
              )}
              {results!.speakers.length > 0 && (
                <section>
                  <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-50 border-b border-slate-100">
                    Speakers
                  </div>
                  {results!.speakers.map(sp => (
                    <button
                      key={sp.id}
                      onClick={() => handleSelect(`/speakers/${sp.id}`)}
                      className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-800">{sp.name}</p>
                      <p className="text-xs text-slate-500">{sp.company}</p>
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
