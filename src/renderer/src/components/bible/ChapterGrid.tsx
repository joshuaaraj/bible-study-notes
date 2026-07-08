import { useEffect, useState } from 'react'
import { useAppStore } from '../../store/appStore'
import type { BibleBook } from '../../types/bible'
import { PlusCircle } from 'lucide-react'

export default function ChapterGrid(): JSX.Element {
  const { selectedBookId, selectedChapter, setSelectedChapter, openNewNote } = useAppStore()
  const [book, setBook] = useState<BibleBook | null>(null)

  useEffect(() => {
    if (!selectedBookId) return
    window.api.bible.getBooks().then((books) => {
      const b = (books as BibleBook[]).find((b) => b.id === selectedBookId)
      setBook(b ?? null)
    })
  }, [selectedBookId])

  if (!selectedBookId || !book) {
    return (
      <div className="w-36 flex-shrink-0 border-r border-slate-200 bg-white p-4 text-sm text-slate-400">
        Select a book
      </div>
    )
  }

  const chapters = Array.from({ length: book.chapterCount }, (_, i) => i + 1)

  return (
    <div className="w-36 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col h-full">
      <div className="p-3 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{book.name}</p>
        <button
          onClick={() => openNewNote()}
          className="mt-2 w-full flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Note for book
        </button>
      </div>
      <div className="overflow-y-auto flex-1 p-2">
        <div className="grid grid-cols-3 gap-1">
          {chapters.map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChapter(ch)}
              className={`aspect-square flex items-center justify-center text-sm rounded-md transition-colors font-medium ${
                ch === selectedChapter
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
