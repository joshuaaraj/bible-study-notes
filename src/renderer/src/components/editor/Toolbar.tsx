import type { Editor } from '@tiptap/react'
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare, Quote, Minus, Table,
  Code2, Link, Image, Paperclip, Undo, Redo, BookMarked
} from 'lucide-react'

interface Props {
  editor: Editor
  onInsertImage: () => void
  onInsertAttachment: () => void
  onInsertVerseRef: () => void
}

function Btn({
  active,
  title,
  onClick,
  children
}: {
  active?: boolean
  title: string
  onClick: () => void
  children: React.ReactNode
}): JSX.Element {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded transition-colors ${
        active ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  )
}

function Divider(): JSX.Element {
  return <div className="w-px h-5 bg-slate-200 mx-1" />
}

export default function Toolbar({ editor, onInsertImage, onInsertAttachment, onInsertVerseRef }: Props): JSX.Element {
  function setLink(): void {
    const url = window.prompt('Enter URL:', editor.getAttributes('link').href)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  function insertTable(): void {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-slate-200 bg-slate-50">
      <Btn title="Bold (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="w-4 h-4" />
      </Btn>
      <Btn title="Italic (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="w-4 h-4" />
      </Btn>
      <Btn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="w-4 h-4" />
      </Btn>
      <Btn title="Inline Code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code className="w-4 h-4" />
      </Btn>

      <Divider />

      <Btn title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 className="w-4 h-4" />
      </Btn>
      <Btn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="w-4 h-4" />
      </Btn>
      <Btn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="w-4 h-4" />
      </Btn>

      <Divider />

      <Btn title="Bullet List" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="w-4 h-4" />
      </Btn>
      <Btn title="Numbered List" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="w-4 h-4" />
      </Btn>
      <Btn title="Checklist" active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()}>
        <CheckSquare className="w-4 h-4" />
      </Btn>

      <Divider />

      <Btn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="w-4 h-4" />
      </Btn>
      <Btn title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="w-4 h-4" />
      </Btn>
      <Btn title="Code Block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code2 className="w-4 h-4" />
      </Btn>
      <Btn title="Table" onClick={insertTable}>
        <Table className="w-4 h-4" />
      </Btn>

      <Divider />

      <Btn title="Link" active={editor.isActive('link')} onClick={setLink}>
        <Link className="w-4 h-4" />
      </Btn>
      <Btn title="Insert Image" onClick={onInsertImage}>
        <Image className="w-4 h-4" />
      </Btn>
      <Btn title="Attach File" onClick={onInsertAttachment}>
        <Paperclip className="w-4 h-4" />
      </Btn>
      <Btn title="Insert Verse Reference (# or @)" onClick={onInsertVerseRef}>
        <BookMarked className="w-4 h-4" />
      </Btn>

      <Divider />

      <Btn title="Undo (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()}>
        <Undo className="w-4 h-4" />
      </Btn>
      <Btn title="Redo (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()}>
        <Redo className="w-4 h-4" />
      </Btn>
    </div>
  )
}
