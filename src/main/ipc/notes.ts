import { ipcMain } from 'electron'
import { getDb } from '../db'

export type NoteScope =
  | { type: 'book'; bookId: number }
  | { type: 'chapter'; bookId: number; chapterNum: number }
  | { type: 'verse'; bookId: number; chapterNum: number; verseNum: number }
  | { type: 'verse_range'; bookId: number; chapterNum: number; verseStart: number; verseEnd: number }

export interface CreateNoteInput {
  scope_type: 'verse' | 'verse_range' | 'chapter' | 'chapter_range' | 'book'
  book_id: number
  chapter_num: number | null
  chapter_end: number | null
  verse_start: number | null
  verse_end: number | null
  title: string
  content: string
}

export function registerNotesHandlers(): void {
  ipcMain.handle('notes:getForScope', (_event, scope: NoteScope) => {
    const db = getDb()
    if (scope.type === 'book') {
      return db
        .prepare('SELECT * FROM notes WHERE book_id = ? ORDER BY updated_at DESC')
        .all(scope.bookId)
    }
    if (scope.type === 'chapter') {
      return db
        .prepare(
          `SELECT * FROM notes WHERE book_id = ? AND (
            chapter_num = ? OR chapter_num IS NULL
          ) ORDER BY updated_at DESC`
        )
        .all(scope.bookId, scope.chapterNum)
    }
    if (scope.type === 'verse') {
      return db
        .prepare(
          `SELECT * FROM notes WHERE book_id = ? AND (
            (scope_type = 'verse' AND chapter_num = ? AND verse_start = ?) OR
            (scope_type = 'verse_range' AND chapter_num = ? AND verse_start <= ? AND verse_end >= ?) OR
            (scope_type = 'chapter' AND chapter_num = ?) OR
            (scope_type = 'chapter_range' AND chapter_num <= ? AND chapter_end >= ?) OR
            scope_type = 'book'
          ) ORDER BY updated_at DESC`
        )
        .all(
          scope.bookId,
          scope.chapterNum, scope.verseNum,
          scope.chapterNum, scope.verseNum, scope.verseNum,
          scope.chapterNum,
          scope.chapterNum, scope.chapterNum
        )
    }
    return []
  })

  ipcMain.handle('notes:getById', (_event, id: number) => {
    return getDb().prepare('SELECT * FROM notes WHERE id = ?').get(id) ?? null
  })

  ipcMain.handle('notes:create', (_event, input: CreateNoteInput) => {
    const db = getDb()
    const stmt = db.prepare(`
      INSERT INTO notes (scope_type, book_id, chapter_num, chapter_end, verse_start, verse_end, title, content)
      VALUES (@scope_type, @book_id, @chapter_num, @chapter_end, @verse_start, @verse_end, @title, @content)
    `)
    const result = stmt.run(input)
    return db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid)
  })

  ipcMain.handle('notes:update', (_event, id: number, updates: Partial<CreateNoteInput>) => {
    const db = getDb()
    const fields = Object.keys(updates)
      .map((k) => `${k} = @${k}`)
      .join(', ')
    db.prepare(`UPDATE notes SET ${fields} WHERE id = @id`).run({ ...updates, id })
    return db.prepare('SELECT * FROM notes WHERE id = ?').get(id)
  })

  ipcMain.handle('notes:delete', (_event, id: number) => {
    getDb().prepare('DELETE FROM notes WHERE id = ?').run(id)
  })

  ipcMain.handle('notes:search', (_event, query: string, limit = 50) => {
    const db = getDb()
    return db
      .prepare(
        `SELECT n.id, n.title, n.scope_type, n.book_id, n.chapter_num,
          n.verse_start, n.verse_end, n.updated_at,
          snippet(notes_fts, 1, '<mark>', '</mark>', '…', 32) AS excerpt
        FROM notes_fts
        JOIN notes n ON n.id = notes_fts.rowid
        WHERE notes_fts MATCH ?
        ORDER BY rank
        LIMIT ?`
      )
      .all(query + '*', limit)
  })

  ipcMain.handle('notes:getRecent', (_event, limit = 20) => {
    return getDb()
      .prepare('SELECT * FROM notes ORDER BY updated_at DESC LIMIT ?')
      .all(limit)
  })

  ipcMain.handle('notes:getVerseNotesForChapter', (_event, bookId: number, chapterNum: number) => {
    return getDb()
      .prepare(
        `SELECT DISTINCT verse_start, verse_end, scope_type FROM notes
         WHERE book_id = ? AND chapter_num = ? AND scope_type IN ('verse','verse_range')`
      )
      .all(bookId, chapterNum)
  })
}
