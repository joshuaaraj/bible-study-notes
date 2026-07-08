export type ScopeType = 'verse' | 'verse_range' | 'chapter' | 'book'

export interface Note {
  id: number
  scope_type: ScopeType
  book_id: number
  chapter_num: number | null
  verse_start: number | null
  verse_end: number | null
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface CreateNoteInput {
  scope_type: ScopeType
  book_id: number
  chapter_num: number | null
  verse_start: number | null
  verse_end: number | null
  title: string
  content: string
}

export interface SearchResult {
  id: number
  title: string
  scope_type: ScopeType
  book_id: number
  chapter_num: number | null
  verse_start: number | null
  verse_end: number | null
  updated_at: string
  excerpt: string
}

export type NoteScope =
  | { type: 'book'; bookId: number }
  | { type: 'chapter'; bookId: number; chapterNum: number }
  | { type: 'verse'; bookId: number; chapterNum: number; verseNum: number }
  | { type: 'verse_range'; bookId: number; chapterNum: number; verseStart: number; verseEnd: number }

export interface VerseNoteInfo {
  verse_start: number
  verse_end: number | null
  scope_type: ScopeType
}
