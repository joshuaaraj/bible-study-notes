import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { Extension } from '@tiptap/core'
import { ReactRenderer } from '@tiptap/react'
import { Suggestion } from '@tiptap/suggestion'
import { PluginKey } from '@tiptap/pm/state'
import type { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion'
import type { VerseRef, VerseRefAttrs } from '../../types/bible'

// ─── Dropdown list ────────────────────────────────────────────────────────────

export interface VerseSuggestionListHandle {
  onKeyDown(props: SuggestionKeyDownProps): boolean
}

interface ListProps {
  items: VerseRef[]
  command(item: VerseRef): void
}

export const VerseSuggestionList = forwardRef<VerseSuggestionListHandle, ListProps>(
  function VerseSuggestionList({ items, command }, ref) {
    const [selected, setSelected] = useState(0)

    useEffect(() => setSelected(0), [items])

    function select(index: number): void {
      const item = items[index]
      if (item) command(item)
    }

    useImperativeHandle(ref, () => ({
      onKeyDown({ event }: SuggestionKeyDownProps): boolean {
        if (event.key === 'ArrowUp') {
          setSelected((i) => (i - 1 + Math.max(items.length, 1)) % Math.max(items.length, 1))
          return true
        }
        if (event.key === 'ArrowDown') {
          setSelected((i) => (i + 1) % Math.max(items.length, 1))
          return true
        }
        if (event.key === 'Enter') {
          select(selected)
          return true
        }
        return false
      }
    }))

    if (items.length === 0) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs text-slate-400 min-w-48">
          No matches — try "Gen 1:1" or "John 3:16"
        </div>
      )
    }

    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto min-w-80">
        {items.map((item, i) => (
          <button
            key={`${item.bookId}-${item.chapterNum}-${item.verseNum}`}
            onMouseDown={(e) => { e.preventDefault(); select(i) }}
            className={[
              'w-full text-left px-3 py-2 flex items-start gap-2.5 transition-colors border-b border-slate-50 last:border-0',
              i === selected ? 'bg-indigo-50' : 'hover:bg-slate-50'
            ].join(' ')}
          >
            <span className="shrink-0 font-semibold text-indigo-600 text-xs w-24 pt-px">
              {item.abbrev} {item.chapterNum}:{item.verseNum}{item.verseEnd ? `–${item.verseEnd}` : ''}
            </span>
            <span className="text-slate-500 text-xs leading-snug line-clamp-2">
              {item.text}
            </span>
          </button>
        ))}
      </div>
    )
  }
)

// ─── Popup positioning ────────────────────────────────────────────────────────

function positionPopup(
  el: HTMLElement,
  clientRect: (() => DOMRect | null) | null | undefined
): void {
  if (!clientRect) return
  const rect = clientRect()
  if (!rect) return
  el.style.position = 'fixed'
  el.style.top = `${rect.bottom + 6}px`
  el.style.left = `${rect.left}px`
  el.style.zIndex = '9999'
}

// ─── Suggestion renderer factory ─────────────────────────────────────────────

function buildRenderer(): () => ReturnType<NonNullable<SuggestionProps['render']>> {
  return () => {
    let renderer: ReactRenderer<VerseSuggestionListHandle> | null = null

    return {
      onStart(props: SuggestionProps<VerseRef>) {
        renderer = new ReactRenderer(VerseSuggestionList, {
          editor: props.editor,
          props: { items: props.items as VerseRef[], command: props.command },
          as: 'div'
        })
        document.body.appendChild(renderer.element)
        positionPopup(renderer.element as HTMLElement, props.clientRect)
      },

      onUpdate(props: SuggestionProps<VerseRef>) {
        renderer?.updateProps({ items: props.items as VerseRef[], command: props.command })
        positionPopup(renderer?.element as HTMLElement | undefined, props.clientRect)
      },

      onKeyDown(props: SuggestionKeyDownProps): boolean {
        if (props.event.key === 'Escape') return true
        return renderer?.ref?.onKeyDown(props) ?? false
      },

      onExit() {
        ;(renderer?.element as HTMLElement | undefined)?.remove()
        renderer?.destroy()
        renderer = null
      }
    }
  }
}

// Each trigger needs its own unique PluginKey — sharing the default key crashes the editor.
const hashPluginKey = new PluginKey('verseReferenceSuggestionHash')
const atPluginKey = new PluginKey('verseReferenceSuggestionAt')

// ─── TipTap Extension ─────────────────────────────────────────────────────────

export const VerseReferenceSuggestion = Extension.create({
  name: 'verseReferenceSuggestion',

  addProseMirrorPlugins() {
    const makePlugin = (char: string, pluginKey: PluginKey) =>
      Suggestion<VerseRef>({
        pluginKey,
        editor: this.editor,
        char,
        allowSpaces: true,
        startOfLine: false,
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from)
          const parent = $from.parent.type.name
          return parent !== 'codeBlock' && parent !== 'code'
        },
        items: async ({ query }): Promise<VerseRef[]> => {
          if (query.trim().length < 2) return []
          const results = await window.api.bible.searchReference(query)
          return results as VerseRef[]
        },
        command: ({ editor, range, props }) => {
          const attrs: VerseRefAttrs = {
            bookId:     props.bookId,
            bookName:   props.bookName,
            abbrev:     props.abbrev,
            chapterNum: props.chapterNum,
            verseNum:   props.verseNum,
            verseEnd:   props.verseEnd ?? null,
            verseText:  props.text
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(editor.chain().focus().deleteRange(range) as any)
            .insertVerseReference(attrs)
            .run()
        },
        render: buildRenderer()
      })

    return [
      makePlugin('#', hashPluginKey),
      makePlugin('@', atPluginKey)
    ]
  }
})
