import { useEffect, useState } from 'react'
import type { BibleBook } from '../types/bible'

let cached: Map<number, string> | null = null

export function useBooksMap(): Map<number, string> {
  const [booksMap, setBooksMap] = useState<Map<number, string>>(cached ?? new Map())

  useEffect(() => {
    if (cached) return
    window.api.bible.getBooks().then((books) => {
      const map = new Map((books as BibleBook[]).map((b) => [b.id, b.name]))
      cached = map
      setBooksMap(map)
    })
  }, [])

  return booksMap
}
