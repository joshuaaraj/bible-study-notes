import { create } from 'zustand'

type ActiveView = 'bible' | 'notes-browser'

interface HistoryEntry {
  bookId: number
  chapterNum: number
}

interface AppState {
  selectedBookId: number | null
  selectedChapter: number | null
  highlightedVerseNum: number | null
  activeView: ActiveView
  openNoteId: number | null
  isNewNote: boolean
  newNoteVerseNum: number | null
  history: HistoryEntry[]
  historyIndex: number

  setSelectedBook: (bookId: number) => void
  setSelectedChapter: (chapter: number) => void
  navigateTo: (bookId: number, chapterNum: number, verseNum?: number) => void
  clearHighlight: () => void
  goBack: () => void
  goForward: () => void
  setActiveView: (view: ActiveView) => void
  openNote: (noteId: number) => void
  openNewNote: (verseNum?: number) => void
  closeNote: () => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedBookId: null,
  selectedChapter: null,
  highlightedVerseNum: null,
  activeView: 'bible',
  openNoteId: null,
  isNewNote: false,
  newNoteVerseNum: null,
  history: [],
  historyIndex: -1,

  setSelectedBook: (bookId) => set({ selectedBookId: bookId, selectedChapter: null }),

  setSelectedChapter: (chapter) =>
    set((state) => {
      if (!state.selectedBookId) return { selectedChapter: chapter }
      const entry: HistoryEntry = { bookId: state.selectedBookId, chapterNum: chapter }
      const truncated = state.history.slice(0, state.historyIndex + 1)
      const newHistory = [...truncated, entry]
      return {
        selectedChapter: chapter,
        highlightedVerseNum: null,
        history: newHistory,
        historyIndex: newHistory.length - 1
      }
    }),

  navigateTo: (bookId, chapterNum, verseNum) =>
    set((state) => {
      const entry: HistoryEntry = { bookId, chapterNum }
      const truncated = state.history.slice(0, state.historyIndex + 1)
      const newHistory = [...truncated, entry]
      return {
        selectedBookId: bookId,
        selectedChapter: chapterNum,
        highlightedVerseNum: verseNum ?? null,
        activeView: 'bible',
        history: newHistory,
        historyIndex: newHistory.length - 1
      }
    }),

  clearHighlight: () => set({ highlightedVerseNum: null }),

  goBack: () =>
    set((state) => {
      if (state.historyIndex <= 0) return {}
      const newIndex = state.historyIndex - 1
      const entry = state.history[newIndex]
      return {
        historyIndex: newIndex,
        selectedBookId: entry.bookId,
        selectedChapter: entry.chapterNum,
        highlightedVerseNum: null,
        activeView: 'bible'
      }
    }),

  goForward: () =>
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return {}
      const newIndex = state.historyIndex + 1
      const entry = state.history[newIndex]
      return {
        historyIndex: newIndex,
        selectedBookId: entry.bookId,
        selectedChapter: entry.chapterNum,
        highlightedVerseNum: null,
        activeView: 'bible'
      }
    }),

  setActiveView: (view) => set({ activeView: view }),
  openNote: (noteId) => set({ openNoteId: noteId, isNewNote: false, newNoteVerseNum: null }),
  openNewNote: (verseNum) => set({ openNoteId: null, isNewNote: true, newNoteVerseNum: verseNum ?? null }),
  closeNote: () => set({ openNoteId: null, isNewNote: false, newNoteVerseNum: null })
}))
