import { useEffect, useState } from 'react'
import type { BibleBook } from '../../types/bible'
import type { CreateNoteInput, ScopeType } from '../../types/notes'

type ScopeFields = Pick<
  CreateNoteInput,
  'scope_type' | 'book_id' | 'chapter_num' | 'chapter_end' | 'verse_start' | 'verse_end'
>

interface Props {
  bookId: number | null
  chapterNum: number | null
  verseNum: number | null
  onChange: (scope: ScopeFields) => void
}

export default function ScopeSelector({ bookId, chapterNum, verseNum, onChange }: Props): JSX.Element {
  const [books, setBooks] = useState<BibleBook[]>([])
  const [scopeType, setScopeType] = useState<ScopeType>(verseNum ? 'verse' : chapterNum ? 'chapter' : 'book')
  const [selBookId, setSelBookId] = useState<number>(bookId ?? 1)
  const [selChapter, setSelChapter] = useState<number | null>(chapterNum)
  const [selChapterEnd, setSelChapterEnd] = useState<number | null>(chapterNum)
  const [selVerseStart, setSelVerseStart] = useState<number | null>(verseNum)
  const [selVerseEnd, setSelVerseEnd] = useState<number | null>(null)
  const [chapterCount, setChapterCount] = useState(0)
  const [verseCount, setVerseCount] = useState(0)
  const [endVerseCount, setEndVerseCount] = useState(0)

  useEffect(() => {
    window.api.bible.getBooks().then((b) => {
      const booksArr = b as BibleBook[]
      setBooks(booksArr)
      const book = booksArr.find((x) => x.id === selBookId)
      if (book) setChapterCount(book.chapterCount)
    })
  }, [])

  useEffect(() => {
    if (!selBookId || !selChapter) return
    window.api.bible.getChapter(selBookId, selChapter).then((vs) => {
      setVerseCount((vs as { num: number }[]).length)
    })
  }, [selBookId, selChapter])

  useEffect(() => {
    if (!selBookId || !selChapterEnd) return
    window.api.bible.getChapter(selBookId, selChapterEnd).then((vs) => {
      setEndVerseCount((vs as { num: number }[]).length)
    })
  }, [selBookId, selChapterEnd])

  useEffect(() => {
    emit()
  }, [scopeType, selBookId, selChapter, selChapterEnd, selVerseStart, selVerseEnd])

  function emit(): void {
    const isRange = scopeType === 'chapter_range'
    onChange({
      scope_type: scopeType,
      book_id: selBookId,
      chapter_num: scopeType === 'book' ? null : selChapter,
      chapter_end: isRange ? selChapterEnd : null,
      verse_start: ['verse', 'verse_range', 'chapter_range'].includes(scopeType) ? selVerseStart : null,
      verse_end: ['verse_range', 'chapter_range'].includes(scopeType) ? selVerseEnd : null
    })
  }

  const tabs: { label: string; value: ScopeType }[] = [
    { label: 'Book', value: 'book' },
    { label: 'Chapter', value: 'chapter' },
    { label: 'Verse', value: 'verse' },
    { label: 'Verse Range', value: 'verse_range' },
    { label: 'Ch. Range', value: 'chapter_range' }
  ]

  const chapterOptions = Array.from({ length: chapterCount }, (_, i) => i + 1)
  const verseOptions = Array.from({ length: verseCount }, (_, i) => i + 1)
  const endVerseOptions = Array.from({ length: endVerseCount }, (_, i) => i + 1)

  const sel = 'border border-slate-200 rounded-md px-2 py-1 text-xs bg-white'

  return (
    <div className="p-3 bg-indigo-50 border-b border-indigo-100 text-sm">
      <div className="flex flex-wrap gap-1 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setScopeType(tab.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              scopeType === tab.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 hover:bg-indigo-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {/* Book */}
        <select
          value={selBookId}
          onChange={(e) => {
            const id = Number(e.target.value)
            setSelBookId(id)
            const book = books.find((b) => b.id === id)
            if (book) setChapterCount(book.chapterCount)
            setSelChapter(1)
            setSelChapterEnd(1)
            setSelVerseStart(1)
          }}
          className={sel}
        >
          {books.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        {/* Chapter (start) — shown for all scopes except book */}
        {scopeType !== 'book' && (
          <select
            value={selChapter ?? ''}
            onChange={(e) => setSelChapter(Number(e.target.value))}
            className={sel}
          >
            <option value="">Ch.</option>
            {chapterOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        {/* Verse start — verse, verse_range, chapter_range */}
        {(scopeType === 'verse' || scopeType === 'verse_range') && (
          <select
            value={selVerseStart ?? ''}
            onChange={(e) => setSelVerseStart(Number(e.target.value))}
            className={sel}
          >
            <option value="">v.</option>
            {verseOptions.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        )}

        {/* verse_range end verse */}
        {scopeType === 'verse_range' && (
          <>
            <span className="text-slate-400">–</span>
            <select
              value={selVerseEnd ?? ''}
              onChange={(e) => setSelVerseEnd(Number(e.target.value))}
              className={sel}
            >
              <option value="">v.</option>
              {verseOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </>
        )}

        {/* chapter_range: start verse, dash, end chapter, end verse */}
        {scopeType === 'chapter_range' && (
          <>
            <span className="text-slate-400">:</span>
            <select
              value={selVerseStart ?? ''}
              onChange={(e) => setSelVerseStart(Number(e.target.value))}
              className={sel}
            >
              <option value="">v.</option>
              {verseOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <span className="text-slate-400">–</span>
            <select
              value={selChapterEnd ?? ''}
              onChange={(e) => setSelChapterEnd(Number(e.target.value))}
              className={sel}
            >
              <option value="">Ch.</option>
              {chapterOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="text-slate-400">:</span>
            <select
              value={selVerseEnd ?? ''}
              onChange={(e) => setSelVerseEnd(Number(e.target.value))}
              className={sel}
            >
              <option value="">v.</option>
              {endVerseOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </>
        )}
      </div>
    </div>
  )
}
