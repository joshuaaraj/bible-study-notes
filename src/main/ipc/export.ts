import { ipcMain, dialog, BrowserWindow } from 'electron'
import { writeFileSync } from 'fs'
import { getDb } from '../db'

export function registerExportHandlers(): void {
  ipcMain.handle('export:noteToPdf', async (event, noteId: number) => {
    const db = getDb()
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(noteId) as {
      title: string
      content: string
    } | undefined

    if (!note) return

    let contentHtml = ''
    try {
      const { generateHTML } = await import('@tiptap/html')
      const { Node, mergeAttributes } = await import('@tiptap/core')
      const { StarterKit } = await import('@tiptap/starter-kit')
      const { TaskList } = await import('@tiptap/extension-task-list')
      const { TaskItem } = await import('@tiptap/extension-task-item')
      const { Image } = await import('@tiptap/extension-image')
      const { Link } = await import('@tiptap/extension-link')
      const { Table } = await import('@tiptap/extension-table')
      const { TableRow } = await import('@tiptap/extension-table-row')
      const { TableHeader } = await import('@tiptap/extension-table-header')
      const { TableCell } = await import('@tiptap/extension-table-cell')

      // Schema-only versions of custom nodes (no React/NodeView needed for HTML generation)
      const VerseReferenceExport = Node.create({
        name: 'verseReference',
        group: 'inline',
        inline: true,
        atom: true,
        addAttributes: () => ({
          bookId: { default: null }, bookName: { default: '' }, abbrev: { default: '' },
          chapterNum: { default: null }, verseNum: { default: null },
          verseEnd: { default: null }, verseText: { default: '' }
        }),
        parseHTML: () => [{ tag: 'span[data-verse-ref]' }],
        renderHTML({ node, HTMLAttributes }) {
          const { abbrev, chapterNum, verseNum, verseEnd } = node.attrs as Record<string, unknown>
          const label = verseEnd
            ? `${abbrev} ${chapterNum}:${verseNum}–${verseEnd}`
            : `${abbrev} ${chapterNum}:${verseNum}`
          return ['span', mergeAttributes(HTMLAttributes, {
            'data-verse-ref': '',
            style: 'background:#ede9fe;color:#5b21b6;border-radius:4px;padding:1px 5px;font-size:0.85em;font-weight:600;'
          }), label]
        }
      })

      const PdfAttachmentExport = Node.create({
        name: 'pdfAttachment',
        group: 'block',
        atom: true,
        addAttributes: () => ({
          filePath: { default: null }, fileName: { default: null }, fileSize: { default: 0 }
        }),
        parseHTML: () => [{ tag: 'div[data-pdf-attachment]' }],
        renderHTML({ node, HTMLAttributes }) {
          const { fileName, fileSize } = node.attrs as Record<string, unknown>
          const sizeKb = Math.round(((fileSize as number) || 0) / 1024)
          return ['div', mergeAttributes(HTMLAttributes, {
            'data-pdf-attachment': '',
            style: 'border:1px solid #ccc;border-radius:4px;padding:8px 12px;margin:8px 0;font-size:0.9em;color:#555;'
          }), `📎 ${fileName || 'Attachment'} (${sizeKb} KB)`]
        }
      })

      const doc = JSON.parse(note.content)
      contentHtml = generateHTML(doc, [
        StarterKit,
        TaskList,
        TaskItem,
        Image,
        Link,
        Table,
        TableRow,
        TableHeader,
        TableCell,
        VerseReferenceExport,
        PdfAttachmentExport
      ])
    } catch (err) {
      console.error('[export] generateHTML failed:', err)
      contentHtml = `<pre>${note.content}</pre>`
    }

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${note.title || 'Bible Study Note'}</title>
<style>
  body { font-family: Georgia, serif; font-size: 12pt; line-height: 1.6; margin: 2cm; color: #222; }
  h1 { font-size: 20pt; border-bottom: 1px solid #ccc; padding-bottom: 8px; }
  h2 { font-size: 16pt; } h3 { font-size: 14pt; }
  blockquote { border-left: 4px solid #ccc; margin: 0; padding-left: 16px; color: #555; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; }
  td, th { border: 1px solid #ccc; padding: 8px; }
  th { background: #f5f5f5; font-weight: bold; }
  pre { background: #f5f5f5; padding: 12px; border-radius: 4px; font-size: 10pt; }
  code { font-family: monospace; background: #f0f0f0; padding: 2px 4px; border-radius: 2px; }
  ul, ol { padding-left: 24px; }
  li[data-checked] { list-style: none; }
  li[data-checked="true"]::before { content: "☑ "; }
  li[data-checked="false"]::before { content: "☐ "; }
  img { max-width: 100%; }
  mark { background: #fffacd; padding: 2px 4px; }
</style>
</head>
<body>
<h1>${note.title || 'Bible Study Note'}</h1>
${contentHtml}
</body>
</html>`

    const printWin = new BrowserWindow({ show: false, webPreferences: { sandbox: false } })
    await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

    const pdfBuffer = await printWin.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: { top: 1, bottom: 1, left: 1, right: 1 }
    })
    printWin.destroy()

    const parentWin = BrowserWindow.fromWebContents(event.sender)
    const saveResult = await dialog.showSaveDialog(parentWin!, {
      defaultPath: `${note.title || 'note'}.pdf`,
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    })

    if (!saveResult.canceled && saveResult.filePath) {
      writeFileSync(saveResult.filePath, pdfBuffer)
    }
  })
}
