import { useRef, useState, useCallback } from 'react'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import { PageCanvas } from './PageCanvas'
import { TextLayer } from './TextLayer'
import { HighlightLayer } from '@/entities/annotation'
import { SelectionPopover, AnnotationPopover, useAnnotations } from '@/features/highlight-text'
import { useTextSelection } from '@/shared/lib/hooks/useTextSelection'
import type { Annotation, HighlightColor, AnnotationType, PdfRect } from '@/shared/types/annotation'

interface Props {
  doc: PDFDocumentProxy
  pageNumber: number
  scale: number
  bookId: number
}

interface AnnotationPopoverState {
  id: number
  x: number
  y: number
}

export function PageRenderer({ doc, pageNumber, scale, bookId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState<PDFPageProxy | null>(null)
  const [annotationPopover, setAnnotationPopover] = useState<AnnotationPopoverState | null>(null)
  const containerWidth = containerRef.current?.offsetWidth ?? 600
  const containerHeight = containerRef.current?.offsetHeight ?? 800
  const { hasSelection, selectionBox, clearSelection } = useTextSelection(containerRef)
  const { annotations, add, remove } = useAnnotations(bookId, pageNumber)

  const handlePageReady = useCallback((page: PDFPageProxy) => {
    setCurrentPage(page)
  }, [])

  async function handleHighlight(
    color: HighlightColor,
    type: AnnotationType,
    text: string,
    rects: PdfRect[],
  ) {
    await add({
      bookId,
      pageNumber,
      type,
      color,
      rects,
      selectedText: text,
      createdAt: new Date(),
    })
    clearSelection()
  }

  function handleAnnotationClick(ann: Annotation, e: React.MouseEvent) {
    if (ann.id == null) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setAnnotationPopover({
      id: ann.id,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div
      ref={containerRef}
      className="relative inline-block select-text"
      style={{ userSelect: 'text' }}
    >
      <PageCanvas
        doc={doc}
        pageNumber={pageNumber}
        scale={scale}
        onPageReady={handlePageReady}
      />
      {currentPage && (
        <>
          <TextLayer page={currentPage} scale={scale} layerRef={textLayerRef} />
          <HighlightLayer
            page={currentPage}
            scale={scale}
            annotations={annotations}
            onAnnotationClick={handleAnnotationClick}
          />
        </>
      )}
      {annotationPopover && (
        <AnnotationPopover
          x={annotationPopover.x}
          y={annotationPopover.y}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
          onDelete={() => remove(annotationPopover.id)}
          onDismiss={() => setAnnotationPopover(null)}
        />
      )}
      {hasSelection && selectionBox && currentPage && textLayerRef.current && !annotationPopover && (
        <SelectionPopover
          selectionBox={selectionBox}
          containerWidth={containerWidth}
          page={currentPage}
          scale={scale}
          textLayerEl={textLayerRef.current}
          onHighlight={handleHighlight}
          onDismiss={clearSelection}
        />
      )}
    </div>
  )
}
