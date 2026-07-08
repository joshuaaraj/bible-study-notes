import { BookOpen, Search } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import BookList from '../bible/BookList'

export default function Sidebar(): JSX.Element {
  const { activeView, setActiveView } = useAppStore()

  return (
    <div className="w-56 flex-shrink-0 bg-slate-900 text-slate-100 flex flex-col h-full">
      <div className="px-4 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span className="font-semibold text-sm tracking-wide">Bible Study Notes</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <BookList />
      </div>

      <div className="border-t border-slate-700 p-2 flex gap-1">
        <button
          onClick={() => setActiveView('bible')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
            activeView === 'bible'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Bible
        </button>
        <button
          onClick={() => setActiveView('notes-browser')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
            activeView === 'notes-browser'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Search className="w-4 h-4" />
          Notes
        </button>
      </div>
    </div>
  )
}
