import { useAppStore } from '../../store/appStore'
import ChapterGrid from '../bible/ChapterGrid'
import VerseList from '../bible/VerseList'
import NotesBrowser from '../notes/NotesBrowser'
import NoteEditor from '../notes/NoteEditor'

export default function MainContent(): JSX.Element {
  const { activeView, selectedBookId, selectedChapter, openNoteId, isNewNote } = useAppStore()

  const showNoteEditor = openNoteId !== null || isNewNote

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {activeView === 'bible' && (
          <>
            <ChapterGrid />
            <VerseList />
          </>
        )}
        {activeView === 'notes-browser' && <NotesBrowser />}
      </div>

      {showNoteEditor && (
        <div className="w-[640px] flex-shrink-0 bg-white shadow-lg flex flex-col overflow-hidden border-l border-slate-200">
          <NoteEditor />
        </div>
      )}
    </div>
  )
}
