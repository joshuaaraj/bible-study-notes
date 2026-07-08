import { useEffect, useState, useCallback, useRef } from 'react'
import { X, FileDown, Save, Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import type { Note, CreateNoteInput, ScopeType } from '../../types/notes'
import type { BibleVerse } from '../../types/bible'
import ScopeSelector from './ScopeSelector'
import RichTextEditor from '../editor/RichTextEditor'
import AttachmentsList from '../editor/AttachmentsList'

const EMPTY_CONTENT = JSON.stringify({ type: 'doc', content: [] })

function versesToTiptapJson(
  verses: BibleVerse[],
  bookName: string,
  chapterNum: number | null
): string {
  if (verses.length === 0) return EMPTY_CONTENT

  const verseNodes = verses.map((v) => ({
    type: 'paragraph',
    content: [
      {
        type: 'text',
        marks: [{ type: 'bold' }],
        text: chapterNum ? `${chapterNum}:${v.num}  ` : `${v.num}  `
      },
      { type: 'text', text: v.text }
    ]
  }))

  return JSON.stringify({
    type: 'doc',
    content: [
      { type: 'blockquote', content: verseNodes },
      { type: 'paragraph', content: [] }
    ]
  })
}

async function fetchVerseContent(
  scopeType: ScopeType,
  bookId: number,
  chapterNum: number | null,
  verseStart: number | null,
  verseEnd: number | null
): Promise<string> {
  if (scopeType === 'book' || !chapterNum) return EMPTY_CONTENT

  const allVerses = (await window.api.bible.getChapter(bookId, chapterNum)) as BibleVerse[]

  let verses: BibleVerse[]
  if (scopeType === 'chapter') {
    verses = allVerses
  } else if (scopeType === 'verse' && verseStart) {
    verses = allVerses.filter((v) => v.num === verseStart)
  } else if (scopeType === 'verse_range' && verseStart && verseEnd) {
    verses = allVerses.filter((v) => v.num >= verseStart && v.num <= verseEnd)
  } else {
    return EMPTY_CONTENT
  }

  return versesToTiptapJson(verses, '', chapterNum)
}

export default function NoteEditor(): JSX.Element {
  const {
    openNoteId, isNewNote, selectedBookId, selectedChapter, newNoteVerseNum, closeNote
  } = useAppStore()

  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState(EMPTY_CONTENT)
  const [scope, setScope] = useState<Partial<CreateNoteInput>>({})
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<number | null>(null)
  const [attachRefresh, setAttachRefresh] = useState(0)
  const [dirty, setDirty] = useState(false)
  const [editorKey, setEditorKey] = useState(0)

  // Track the last scope we fetched verses for to avoid redundant fetches
  const lastFetchedScope = useRef('')

  useEffect(() => {
    if (openNoteId !== null) {
      window.api.notes.getById(openNoteId).then((n) => {
        const loaded = n as Note
        setNote(loaded)
        setTitle(loaded.title)
        setContent(loaded.content || EMPTY_CONTENT)
        setSavedId(loaded.id)
        setDirty(false)
        setEditorKey((k) => k + 1)
        lastFetchedScope.current = ''
      })
    } else if (isNewNote) {
      setNote(null)
      setTitle('')
      setContent(EMPTY_CONTENT)
      setSavedId(null)
      setDirty(false)
      setEditorKey((k) => k + 1)
      lastFetchedScope.current = ''
    }
  }, [openNoteId, isNewNote])

  // Auto-populate verse text whenever scope changes on a NEW note
  useEffect(() => {
    if (!isNewNote || savedId !== null) return
    if (!scope.scope_type || !scope.book_id) return

    const key = `${scope.scope_type}-${scope.book_id}-${scope.chapter_num}-${scope.verse_start}-${scope.verse_end}`
    if (key === lastFetchedScope.current) return
    lastFetchedScope.current = key

    fetchVerseContent(
      scope.scope_type,
      scope.book_id,
      scope.chapter_num ?? null,
      scope.verse_start ?? null,
      scope.verse_end ?? null
    ).then((json) => {
      setContent(json)
      setEditorKey((k) => k + 1)
      setDirty(true)
    })
  }, [scope, isNewNote, savedId])

  const handleSave = useCallback(async () => {
    if (!dirty) return
    setSaving(true)

    const input: CreateNoteInput = {
      scope_type: (scope.scope_type as CreateNoteInput['scope_type']) ?? 'book',
      book_id: scope.book_id ?? selectedBookId ?? 1,
      chapter_num: scope.chapter_num ?? null,
      verse_start: scope.verse_start ?? null,
      verse_end: scope.verse_end ?? null,
      title,
      content
    }

    try {
      if (savedId !== null) {
        await window.api.notes.update(savedId, { title, content })
      } else {
        const created = (await window.api.notes.create(input)) as Note
        setSavedId(created.id)
      }
      setDirty(false)
      setAttachRefresh((r) => r + 1)
    } finally {
      setSaving(false)
    }
  }, [dirty, scope, title, content, savedId, selectedBookId])

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave])

  async function handleExport(): Promise<void> {
    if (!savedId) { alert('Save your note first before exporting.'); return }
    await window.api.export.noteToPdf(savedId)
  }

  async function handleDelete(): Promise<void> {
    if (!savedId) { closeNote(); return }
    if (!window.confirm('Delete this note? This cannot be undone.')) return
    await window.api.notes.delete(savedId)
    closeNote()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-white">
        <button onClick={closeNote} className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors">
          <X className="w-4 h-4" />
        </button>
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); setDirty(true) }}
          placeholder="Note title…"
          className="flex-1 text-base font-semibold text-slate-800 bg-transparent outline-none placeholder:text-slate-300"
        />
        <button
          onClick={handleExport}
          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded transition-colors"
          title="Export to PDF"
        >
          <FileDown className="w-4 h-4" />
        </button>
        {savedId && (
          <button
            onClick={handleDelete}
            className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            dirty
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* Scope selector */}
      {(isNewNote || note) && (
        <ScopeSelector
          bookId={note?.book_id ?? selectedBookId}
          chapterNum={note?.chapter_num ?? selectedChapter}
          verseNum={note?.verse_start ?? newNoteVerseNum}
          onChange={(s) => setScope(s)}
        />
      )}

      {/* Editor — key forces a remount when content is replaced */}
      <div className="flex-1 overflow-hidden flex flex-col p-3">
        <RichTextEditor
          key={editorKey}
          content={content}
          onChange={(json) => { setContent(json); setDirty(true) }}
          noteId={savedId}
        />
      </div>

      {savedId !== null && (
        <AttachmentsList noteId={savedId} refreshKey={attachRefresh} />
      )}
    </div>
  )
}
