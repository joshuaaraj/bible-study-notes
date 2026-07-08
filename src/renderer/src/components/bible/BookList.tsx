import { useEffect, useState } from 'react'
import { useAppStore } from '../../store/appStore'
import type { BibleBook } from '../../types/bible'

export default function BookList(): JSX.Element {
  const [books, setBooks] = useState<BibleBook[]>([])
  const { selectedBookId, setSelectedBook } = useAppStore()

  useEffect(() => {
    window.api.bible.getBooks().then((b) => setBooks(b as BibleBook[]))
  }, [])

  const ot = books.filter((b) => b.testament === 'OT')
  const nt = books.filter((b) => b.testament === 'NT')

  function renderBook(book: BibleBook): JSX.Element {
    const active = book.id === selectedBookId
    return (
      <button
        key={book.id}
        onClick={() => {
          setSelectedBook(book.id)
        }}
        className={`w-full text-left px-4 py-1.5 text-sm transition-colors ${
          active
            ? 'bg-indigo-600 text-white font-medium'
            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        }`}
      >
        {book.name}
      </button>
    )
  }

  return (
    <div className="overflow-y-auto h-full py-2">
      <div className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Old Testament
      </div>
      {ot.map(renderBook)}

      <div className="px-4 py-1 mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        New Testament
      </div>
      {nt.map(renderBook)}
    </div>
  )
}
