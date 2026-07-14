import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import type { VerseRefAttrs } from '../../types/bible'
import { useAppStore } from '../../store/appStore'

export function VerseReferenceView({ node }: NodeViewProps): JSX.Element {
  const { abbrev, chapterNum, verseNum, verseEnd, verseText, bookId } = node.attrs as VerseRefAttrs
  const label = verseEnd
    ? `${abbrev} ${chapterNum}:${verseNum}–${verseEnd}`
    : `${abbrev} ${chapterNum}:${verseNum}`
  const chipRef = useRef<HTMLSpanElement>(null)
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null)
  const navigateTo = useAppStore((s) => s.navigateTo)

  function handleMouseEnter(): void {
    const rect = chipRef.current?.getBoundingClientRect()
    if (rect) setTooltipPos({ top: rect.top - 8, left: rect.left })
  }

  function handleClick(): void {
    navigateTo(bookId, chapterNum, verseNum)
  }

  const tooltip =
    tooltipPos && verseText
      ? createPortal(
          <div
            style={{
              position: 'fixed',
              top: tooltipPos.top,
              left: tooltipPos.left,
              transform: 'translateY(-100%)',
              zIndex: 9999,
              maxWidth: 300,
              pointerEvents: 'none'
            }}
            className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-lg text-xs text-slate-700 leading-relaxed"
          >
            <span className="font-semibold text-indigo-600 block mb-1">{label}</span>
            {verseText}
          </div>,
          document.body
        )
      : null

  return (
    <NodeViewWrapper as="span" style={{ display: 'inline' }}>
      <span
        ref={chipRef}
        contentEditable={false}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setTooltipPos(null)}
        onClick={handleClick}
        className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer select-none align-baseline hover:bg-indigo-200 hover:border-indigo-300 transition-colors"
      >
        {label}
      </span>
      {tooltip}
    </NodeViewWrapper>
  )
}
