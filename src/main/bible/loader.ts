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

export interface VerseRef {
  bookId: number
  bookName: string
  abbrev: string
  chapterNum: number
  verseNum: number
  verseEnd: number | null
  text: string
}

interface ParsedRef {
  bookQuery: string
  chapterNum: number | null
  verseNum: number | null
  verseEnd: number | null
}

function parseReference(query: string): ParsedRef {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, ' ')
  let verseNum: number | null = null
  let verseEnd: number | null = null
  let pre = normalized

  const colonIdx = normalized.indexOf(':')
  if (colonIdx !== -1) {
    const afterColon = normalized.slice(colonIdx + 1).trim()
    // Range: "23:1-5"
    const rangeMatch = afterColon.match(/^(\d+)-(\d+)$/)
    if (rangeMatch) {
      verseNum = parseInt(rangeMatch[1], 10)
      verseEnd = parseInt(rangeMatch[2], 10)
    } else {
      const v = parseInt(afterColon, 10)
      verseNum = isNaN(v) ? null : v
    }
    pre = normalized.slice(0, colonIdx).trim()
  }

  // Strip trailing integer as chapter — "gen 1" → book="gen", ch=1
  // "1 john 3" → book="1 john", ch=3; "1 john" → book="1 john", ch=null
  const trailing = pre.match(/^(.+?)\s+(\d+)$/)
  if (trailing) {
    return { bookQuery: trailing[1], chapterNum: parseInt(trailing[2], 10), verseNum, verseEnd }
  }

  return { bookQuery: pre, chapterNum: null, verseNum: null, verseEnd: null }
}

function matchBook(bookQuery: string, books: RawBook[]): RawBook | undefined {
  const q = bookQuery.trim().toLowerCase()
  if (!q) return undefined
  return (
    books.find((b) => b.abbrev.toLowerCase() === q) ??
    books.find((b) => b.name.toLowerCase() === q) ??
    books.find((b) => b.abbrev.toLowerCase().startsWith(q)) ??
    books.find((b) => b.name.toLowerCase().startsWith(q))
  )
}

export function searchReference(query: string, limit = 20): VerseRef[] {
  if (!query || query.trim().length < 2) return []

  const { bookQuery, chapterNum, verseNum, verseEnd } = parseReference(query)
  if (!bookQuery) return []

  const bible = loadBible()
  const book = matchBook(bookQuery, bible.books)
  if (!book) return []

  const results: VerseRef[] = []
  const push = (chNum: number, v: BibleVerse): void => {
    results.push({
      bookId: book.id, bookName: book.name, abbrev: book.abbrev,
      chapterNum: chNum, verseNum: v.num, verseEnd: null, text: v.text
    })
  }

  if (chapterNum !== null) {
    const ch = book.chapters.find((c) => c.num === chapterNum)
    if (!ch) return []
    if (verseNum !== null && verseEnd !== null) {
      // Range: return a single combined result
      const rangeVerses = ch.verses.filter((v) => v.num >= verseNum! && v.num <= verseEnd!)
      if (rangeVerses.length > 0) {
        const combinedText = rangeVerses.map((v) => v.text).join(' ')
        const truncated = combinedText.length > 200 ? combinedText.slice(0, 200) + '…' : combinedText
        results.push({
          bookId: book.id, bookName: book.name, abbrev: book.abbrev,
          chapterNum: ch.num, verseNum, verseEnd, text: truncated
        })
      }
    } else if (verseNum !== null) {
      const v = ch.verses.find((v) => v.num === verseNum)
      if (v) push(ch.num, v)
    } else {
      for (const v of ch.verses) {
        if (results.length >= limit) break
        push(ch.num, v)
      }
    }
  } else {
    // No chapter typed — show first chapter's verses as preview
    const firstCh = book.chapters[0]
    if (firstCh) {
      for (const v of firstCh.verses) {
        if (results.length >= limit) break
        push(firstCh.num, v)
      }
    }
  }

  return results
}
