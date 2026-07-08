import { useEffect } from 'react'
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Typography } from '@tiptap/extension-typography'
import { CharacterCount } from '@tiptap/extension-character-count'
import { createLowlight, common } from 'lowlight'
import { Node } from '@tiptap/core'
import { File } from 'lucide-react'
import Toolbar from './Toolbar'

const lowlight = createLowlight(common)

function PdfAttachmentView({ node }: NodeViewProps): JSX.Element {
  const attrs = node.attrs as { fileName: string; filePath: string; fileSize: number }

  function handleClick(): void {
    window.api.attachments.openFile(attrs.filePath)
  }

  const sizeKb = Math.round(attrs.fileSize / 1024)

  return (
    <NodeViewWrapper>
      <div
        onClick={handleClick}
        className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors my-2"
      >
        <div className="bg-red-100 rounded-lg p-2">
          <File className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700 truncate">{attrs.fileName}</p>
          <p className="text-xs text-slate-400">{sizeKb} KB · PDF</p>
        </div>
      </div>
    </NodeViewWrapper>
  )
}

const PdfAttachmentExtension = Node.create({
  name: 'pdfAttachment',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      filePath: { default: null },
      fileName: { default: null },
      fileSize: { default: 0 }
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-pdf-attachment]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-pdf-attachment': '', ...HTMLAttributes }]
  },

  addNodeView() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ReactNodeViewRenderer(PdfAttachmentView as any)
  },

  addCommands() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return {
      insertPdfAttachment: (attrs: Record<string, unknown>) => ({ commands }: any) =>
        commands.insertContent({ type: this.name, attrs })
    } as any
  }
})

interface Props {
  content: string
  onChange: (json: string) => void
  noteId: number | null
}

export default function RichTextEditor({ content, onChange, noteId }: Props): JSX.Element {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder: 'Start writing your note…' }),
      Typography,
      CharacterCount,
      PdfAttachmentExtension
    ],
    content: (() => {
      try {
        return content ? JSON.parse(content) : undefined
      } catch {
        return undefined
      }
    })(),
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()))
    }
  })

  useEffect(() => {
    if (!editor) return
    try {
      const parsed = content ? JSON.parse(content) : null
      if (parsed && JSON.stringify(editor.getJSON()) !== content) {
        editor.commands.setContent(parsed, false)
      }
    } catch {
      /* ignore invalid JSON */
    }
  }, [noteId])

  async function insertImage(): Promise<void> {
    if (!editor) return
    const filePath = await window.api.attachments.pickFile({
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] }]
    })
    if (!filePath) return

    if (noteId) {
      const attachment = (await window.api.attachments.add(noteId, filePath)) as { file_path: string } | null
      if (attachment) {
        editor.chain().focus().setImage({ src: `file://${attachment.file_path}` }).run()
      }
    } else {
      editor.chain().focus().setImage({ src: `file://${filePath}` }).run()
    }
  }

  async function insertAttachment(): Promise<void> {
    if (!editor) return
    const filePath = await window.api.attachments.pickFile()
    if (!filePath) return

    const fileName = filePath.split('/').pop() ?? filePath.split('\\').pop() ?? 'file'
    const isPdf = fileName.toLowerCase().endsWith('.pdf')

    if (noteId) {
      const attachment = (await window.api.attachments.add(noteId, filePath)) as {
        file_path: string
        original_name: string
        size_bytes: number
      } | null
      if (!attachment) return

      if (isPdf) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(editor.chain().focus() as any)
          .insertPdfAttachment({
            filePath: attachment.file_path,
            fileName: attachment.original_name,
            fileSize: attachment.size_bytes
          })
          .run()
      } else {
        editor.chain().focus().setImage({ src: `file://${attachment.file_path}` }).run()
      }
    } else {
      if (isPdf) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(editor.chain().focus() as any)
          .insertPdfAttachment({ filePath, fileName, fileSize: 0 })
          .run()
      } else {
        editor.chain().focus().setImage({ src: `file://${filePath}` }).run()
      }
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden border border-slate-200 rounded-lg">
      {editor && (
        <Toolbar
          editor={editor}
          onInsertImage={insertImage}
          onInsertAttachment={insertAttachment}
        />
      )}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
      {editor && (
        <div className="px-4 py-1.5 text-xs text-slate-400 border-t border-slate-100 text-right">
          {editor.storage.characterCount.characters()} characters
        </div>
      )}
    </div>
  )
}
