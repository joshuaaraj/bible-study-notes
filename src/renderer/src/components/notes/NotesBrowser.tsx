import { useEffect, useState, useRef } from 'react'
import { Search, Clock } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import type { Note, SearchResult } from '../../types/notes'
import { useBooksMap } from '../../hooks/useBooksMap'
import NoteCard from './NoteCard'

export default function NotesBrowser(): JSX.Element {
  const { openNote } = useAppStore()
  const booksMap = useBooksMap()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<(Note | SearchResult)[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    loadRecent()
  }, [])

  async function loadRecent(): Promise<void> {
    setLoading(true)
    const notes = (await window.api.notes.getRecent(30)) as Note[]
    setResults(notes)
    setLoading(false)
  }

  function handleSearch(q: string): void {
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!q.trim()) {
      loadRecent()
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const found = (await window.api.notes.search(q, 50)) as SearchResult[]
      setResults(found)
      setLoading(false)
    }, 300)
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-3">Your Notes</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search notes…"
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Clock className="w-8 h-8 mb-2" />
            <p className="text-sm">
              {query ? 'No notes found' : 'No notes yet — start by clicking a verse'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {results.map((result) => (
              <NoteCard
                key={result.id}
                note={result as Note}
                bookName={booksMap.get((result as Note).book_id)}
                excerpt={'excerpt' in result ? (result as SearchResult).excerpt : undefined}
                onClick={() => openNote(result.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
