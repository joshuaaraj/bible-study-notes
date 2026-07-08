import { useState } from 'react'
import { BookOpen, FolderOpen, CheckCircle } from 'lucide-react'

interface Props {
  onComplete: () => void
}

export default function FirstLaunchSetup({ onComplete }: Props): JSX.Element {
  const [folderPath, setFolderPath] = useState('')
  const [saving, setSaving] = useState(false)

  async function pickFolder(): Promise<void> {
    const path = await window.api.config.openFolderPicker()
    if (path) setFolderPath(path)
  }

  async function handleStart(): Promise<void> {
    const trimmed = folderPath.trim()
    if (!trimmed) return
    setSaving(true)
    await window.api.config.setDataFolder(trimmed)
    onComplete()
  }

  const isValid = folderPath.trim().length > 0

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-indigo-50 to-slate-100 p-8">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 rounded-full p-5">
            <BookOpen className="w-12 h-12 text-indigo-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bible Study Notes</h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          Choose a folder where your notes and attachments will be stored.
        </p>

        {/* Path text input */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            placeholder="/home/user/BibleNotes"
            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 text-slate-700"
          />
          <button
            onClick={pickFolder}
            title="Browse for folder"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium flex-shrink-0"
          >
            <FolderOpen className="w-4 h-4" />
            Browse
          </button>
        </div>

        {isValid && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-4 py-2.5 mb-5 text-left">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="break-all">{folderPath.trim()}</span>
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={!isValid || saving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {saving ? 'Setting up…' : 'Get Started'}
        </button>

        <p className="text-xs text-slate-400 mt-4">
          The folder will be created if it doesn't exist.
        </p>
      </div>
    </div>
  )
}
