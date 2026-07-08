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
