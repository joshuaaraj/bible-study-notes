import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import type { VerseRefAttrs } from '../../../types/bible'
import { VerseReferenceView } from '../VerseReferenceView'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    verseReference: {
      insertVerseReference(attrs: VerseRefAttrs): ReturnType
    }
  }
}

export const VerseReference = Node.create({
  name: 'verseReference',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      bookId:     { default: null },
      bookName:   { default: '' },
      abbrev:     { default: '' },
      chapterNum: { default: null },
      verseNum:   { default: null },
      verseEnd:   { default: null },
      verseText:  { default: '' }
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-verse-ref]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const { abbrev, chapterNum, verseNum, verseEnd, verseText } = node.attrs as VerseRefAttrs
    const label = verseEnd
      ? `${abbrev} ${chapterNum}:${verseNum}–${verseEnd}`
      : `${abbrev} ${chapterNum}:${verseNum}`
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-verse-ref': '', title: verseText }),
      label
    ]
  },

  addNodeView() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ReactNodeViewRenderer(VerseReferenceView as any)
  },

  addCommands() {
    return {
      insertVerseReference: (attrs: VerseRefAttrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs })
    }
  }
})
