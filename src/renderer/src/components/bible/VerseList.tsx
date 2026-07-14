import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import type { BibleVerse } from '../../types/bible'
import type { VerseNoteInfo } from '../../types/notes'

export default function VerseList(): JSX.Element {
  const {
    selectedBookId, selectedChapter, highlightedVerseNum, clearHighlight,
    openNewNote, goBack, goForward, history, historyIndex
  } = useAppStore()
  const [verses, setVerses] = useState<BibleVerse[]>([])
  const [verseNotes, setVerseNotes] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const verseRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  useEffect(() => {
    if (!selectedBookId || !selectedChapter) {
      setVerses([])
      setVerseNotes(new Set())
      return
    }

    setLoading(true)
    Promise.all([
      window.api.bible.getChapter(selectedBookId, selectedChapter),
      window.api.notes.getVerseNotesForChapter(selectedBookId, selectedChapter)
    ]).then(([vs, noteInfos]) => {
      setVerses(vs as BibleVerse[])
      const noteSet = new Set<number>()
      for (const ni of noteInfos as VerseNoteInfo[]) {
        const start = ni.verse_start
        const end = ni.verse_end ?? ni.verse_start
        for (let v = start; v <= end; v++) noteSet.add(v)
      }
      setVerseNotes(noteSet)
      setLoading(false)
    })
  }, [selectedBookId, selectedChapter])

  // Scroll to and briefly highlight the target verse
  useEffect(() => {
    if (!highlightedVerseNum) return
    const el = verseRefs.current.get(highlightedVerseNum)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('bg-indigo-50')
      const timer = setTimeout(() => {
        el.classList.remove('bg-indigo-50')
        clearHighlight()
      }, 1800)
      return () => clearTimeout(timer)
    }
  }, [highlightedVerseNum, verses])

  const canGoBack = historyIndex > 0
  const canGoForward = historyIndex < history.length - 1

  if (!selectedBookId || !selectedChapter) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        Select a book and chapter to start reading
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-3xl">
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={goBack}
          disabled={!canGoBack}
          title="Go back"
          className={`p-1 rounded transition-colors ${canGoBack ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-300 cursor-not-allowed'}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={goForward}
          disabled={!canGoForward}
          title="Go forward"
          className={`p-1 rounded transition-colors ${canGoForward ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-300 cursor-not-allowed'}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <h2 className="text-xl font-bold text-slate-800 flex-1">
          Chapter {selectedChapter}
        </h2>
        <button
          onClick={() => openNewNote()}
          className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Note for chapter
        </button>
      </div>

      <div className="space-y-3">
        {verses.map((verse) => (
          <div
            key={verse.num}
            ref={(el) => {
              if (el) verseRefs.current.set(verse.num, el)
              else verseRefs.current.delete(verse.num)
            }}
            className="flex gap-3 group cursor-pointer rounded-md transition-colors px-1 -mx-1"
            onClick={() => openNewNote(verse.num)}
          >
            <span className="text-indigo-500 font-bold text-sm mt-0.5 w-7 flex-shrink-0 select-none">
              {verse.num}
            </span>
            <div className="flex-1 relative">
              <p className="text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors">
                {verse.text}
              </p>
              <div className="absolute -right-1 top-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {verseNotes.has(verse.num) && (
                  <span className="w-2 h-2 bg-indigo-500 rounded-full" title="Has notes" />
                )}
                <PlusCircle className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            {verseNotes.has(verse.num) && (
              <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
