import { useEffect, useState } from 'react'
import { File, Image, Trash2, ExternalLink } from 'lucide-react'
import type { Attachment } from '../../types/attachments'

interface Props {
  noteId: number
  refreshKey: number
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AttachmentsList({ noteId, refreshKey }: Props): JSX.Element {
  const [attachments, setAttachments] = useState<Attachment[]>([])

  useEffect(() => {
    window.api.attachments.getForNote(noteId).then((a) => setAttachments(a as Attachment[]))
  }, [noteId, refreshKey])

  async function handleDelete(id: number): Promise<void> {
    if (!window.confirm('Delete this attachment?')) return
    await window.api.attachments.delete(id)
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  if (attachments.length === 0) return <></>

  const isImage = (mime: string): boolean => mime.startsWith('image/')

  return (
    <div className="border-t border-slate-200 p-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        Attachments ({attachments.length})
      </p>
      <div className="space-y-1.5">
        {attachments.map((att) => (
          <div
            key={att.id}
            className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg group"
          >
            <div className="flex-shrink-0 text-slate-400">
              {isImage(att.mime_type) ? (
                <Image className="w-4 h-4" />
              ) : (
                <File className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 truncate">{att.original_name}</p>
              <p className="text-xs text-slate-400">{formatSize(att.size_bytes)}</p>
            </div>
            <button
              onClick={() => window.api.attachments.openFile(att.file_path)}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 transition-all"
              title="Open file"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(att.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-all"
              title="Delete attachment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
