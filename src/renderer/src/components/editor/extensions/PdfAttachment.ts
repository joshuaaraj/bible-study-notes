import { Node, mergeAttributes } from '@tiptap/core'

export interface PdfAttachmentOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pdfAttachment: {
      insertPdfAttachment: (attrs: {
        filePath: string
        fileName: string
        fileSize: number
      }) => ReturnType
    }
  }
}

export const PdfAttachment = Node.create<PdfAttachmentOptions>({
  name: 'pdfAttachment',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} }
  },

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
    return ['div', mergeAttributes({ 'data-pdf-attachment': '' }, HTMLAttributes)]
  },

  addCommands() {
    return {
      insertPdfAttachment:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({ type: this.name, attrs })
        }
    }
  }
})
