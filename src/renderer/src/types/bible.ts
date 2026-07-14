export interface BibleVerse {
  num: number
  text: string
}

export interface BibleBook {
  id: number
  name: string
  abbrev: string
  testament: 'OT' | 'NT'
  chapterCount: number
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

export interface VerseRefAttrs {
  bookId: number
  bookName: string
  abbrev: string
  chapterNum: number
  verseNum: number
  verseEnd: number | null
  verseText: string
}
