import { app } from 'electron'
import { readFileSync } from 'fs'
import { join } from 'path'

export interface BibleVerse {
  num: number
  text: string
}

export interface BibleChapter {
  num: number
  verses: BibleVerse[]
}

export interface BibleBook {
  id: number
  name: string
  abbrev: string
  testament: 'OT' | 'NT'
  chapterCount: number
}

interface RawBook {
  id: number
  name: string
  abbrev: string
  testament: 'OT' | 'NT'
  chapters: BibleChapter[]
}

interface RawBible {
  books: RawBook[]
}

let bibleData: RawBible | null = null

function loadBible(): RawBible {
  if (bibleData) return bibleData

  const bsbPath = app.isPackaged
    ? join(process.resourcesPath, 'data', 'bsb.json')
    : join(app.getAppPath(), 'data', 'bsb.json')

  bibleData = JSON.parse(readFileSync(bsbPath, 'utf-8')) as RawBible
  return bibleData
}

export function getBooks(): BibleBook[] {
  return loadBible().books.map((b) => ({
    id: b.id,
    name: b.name,
    abbrev: b.abbrev,
    testament: b.testament,
    chapterCount: b.chapters.length
  }))
}

export function getChapter(bookId: number, chapterNum: number): BibleVerse[] {
  const book = loadBible().books.find((b) => b.id === bookId)
  if (!book) return []
  const chapter = book.chapters.find((c) => c.num === chapterNum)
  if (!chapter) return []
  return chapter.verses
}
