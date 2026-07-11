import type { Note } from '../../types/notes'

interface Props {
  note: Note
  bookName?: string
  excerpt?: string
  onClick: () => void
}

function scopeLabel(note: Note, bookName: string): string {
  const book = bookName || `Book ${note.book_id}`
  if (note.scope_type === 'book') return book
  const ch = note.chapter_num
  if (note.scope_type === 'chapter') return `${book} ${ch}`
  if (note.scope_type === 'verse') return `${book} ${ch}:${note.verse_start}`
  if (note.scope_type === 'verse_range') return `${book} ${ch}:${note.verse_start}–${note.verse_end}`
  if (note.scope_type === 'chapter_range') {
    const start = note.verse_start ? `${ch}:${note.verse_start}` : `${ch}`
    const end = note.verse_end ? `${note.chapter_end}:${note.verse_end}` : `${note.chapter_end}`
    return `${book} ${start}–${end}`
  }
  return book
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function NoteCard({ note, bookName = '', excerpt, onClick }: Props): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full truncate max-w-[200px]">
          {scopeLabel(note, bookName)}
        </span>
        <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(note.updated_at)}</span>
      </div>
      <p className="text-sm font-semibold text-slate-800 mb-1 truncate">
        {note.title || '(Untitled)'}
      </p>
      {excerpt && (
        <p
          className="text-xs text-slate-500 line-clamp-2"
          dangerouslySetInnerHTML={{ __html: excerpt }}
        />
      )}
    </button>
  )
}
