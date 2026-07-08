import { useAppStore } from '../../store/appStore'
import ChapterGrid from '../bible/ChapterGrid'
import VerseList from '../bible/VerseList'
import NotesBrowser from '../notes/NotesBrowser'
import NoteEditor from '../notes/NoteEditor'

export default function MainContent(): JSX.Element {
  const { activeView, selectedBookId, selectedChapter, openNoteId, isNewNote } = useAppStore()

  const showNoteEditor = openNoteId !== null || isNewNote

  return (
    <div className="flex flex-1 overflow-hidden relative">
      {activeView === 'bible' && (
        <>
          <ChapterGrid />
          <VerseList />
        </>
      )}
      {activeView === 'notes-browser' && <NotesBrowser />}

      {showNoteEditor && (
        <div className="absolute inset-0 bg-black/20 flex justify-end z-10">
          <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
            <NoteEditor />
          </div>
        </div>
      )}
    </div>
  )
}
