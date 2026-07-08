import { create } from 'zustand'

type ActiveView = 'bible' | 'notes-browser'

interface AppState {
  selectedBookId: number | null
  selectedChapter: number | null
  activeView: ActiveView
  openNoteId: number | null
  isNewNote: boolean
  newNoteVerseNum: number | null

  setSelectedBook: (bookId: number) => void
  setSelectedChapter: (chapter: number) => void
  setActiveView: (view: ActiveView) => void
  openNote: (noteId: number) => void
  openNewNote: (verseNum?: number) => void
  closeNote: () => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedBookId: null,
  selectedChapter: null,
  activeView: 'bible',
  openNoteId: null,
  isNewNote: false,
  newNoteVerseNum: null,

  setSelectedBook: (bookId) => set({ selectedBookId: bookId, selectedChapter: null }),
  setSelectedChapter: (chapter) => set({ selectedChapter: chapter }),
  setActiveView: (view) => set({ activeView: view }),
  openNote: (noteId) => set({ openNoteId: noteId, isNewNote: false, newNoteVerseNum: null }),
  openNewNote: (verseNum) => set({ openNoteId: null, isNewNote: true, newNoteVerseNum: verseNum ?? null }),
  closeNote: () => set({ openNoteId: null, isNewNote: false, newNoteVerseNum: null })
}))
