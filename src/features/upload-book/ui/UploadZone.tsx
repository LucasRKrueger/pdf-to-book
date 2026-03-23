import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2 } from 'lucide-react'
import { loadPdfDocument } from '@/shared/lib/pdf/engine'
import { addBook } from '@/shared/db/queries'
import type { Book } from '@/shared/types/book'

interface Props {
  onBookAdded: () => void
}

async function checkStorageQuota(neededBytes: number): Promise<string | null> {
  if (!navigator.storage?.estimate) return null
  try {
    const { quota = 0, usage = 0 } = await navigator.storage.estimate()
    const available = quota - usage
    if (available > 0 && neededBytes > available * 0.9) {
      const mb = (n: number) => Math.round(n / 1024 / 1024)
      return `Not enough storage. Need ~${mb(neededBytes)} MB but only ${mb(available)} MB available.`
    }
  } catch {
    // estimate not supported — proceed anyway
  }
  return null
}

export function UploadZone({ onBookAdded }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null)
    const errors: string[] = []

    for (const file of acceptedFiles) {
      if (!file.name.toLowerCase().endsWith('.pdf')) continue
      setLoading(true)
      try {
        const quotaError = await checkStorageQuota(file.size)
        if (quotaError) {
          errors.push(`${file.name}: ${quotaError}`)
          continue
        }

        const arrayBuffer = await file.arrayBuffer()

        // Single document open — reuse it for metadata + thumbnail + page count
        const doc = await loadPdfDocument(arrayBuffer.slice(0))
        const pageCount = doc.numPages

        let title = file.name.replace(/\.pdf$/i, '')
        try {
          const meta = await doc.getMetadata()
          const info = meta.info as Record<string, unknown>
          if (info?.Title && typeof info.Title === 'string' && info.Title.trim()) {
            title = info.Title.trim()
          }
        } catch { /* metadata is optional */ }

        let coverDataUrl: string | undefined
        try {
          const page = await doc.getPage(1)
          const viewport = page.getViewport({ scale: 0.4 })
          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height
          await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise
          coverDataUrl = canvas.toDataURL('image/jpeg', 0.7)
        } catch { /* cover is optional */ }

        doc.destroy()

        const book: Book = {
          title,
          fileName: file.name,
          pageCount,
          coverDataUrl,
          addedAt: new Date(),
          fileSizeBytes: file.size,
          pdfData: arrayBuffer,
        }
        await addBook(book)
        onBookAdded()
      } catch (err) {
        const isQuota = err instanceof DOMException && err.name === 'QuotaExceededError'
        const msg = isQuota
          ? 'Storage full. Free up space and try again.'
          : 'Failed to import. Make sure it is a valid PDF file.'
        errors.push(`${file.name}: ${msg}`)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (errors.length > 0) setError(errors.join('\n'))
  }, [onBookAdded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
    disabled: loading,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className="relative flex flex-col sm:flex-row items-center justify-center gap-3 p-4 sm:p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all"
        style={{
          borderColor: isDragActive ? 'var(--color-accent)' : 'var(--color-border)',
          background: isDragActive ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'var(--color-surface)',
        }}
      >
        <input {...getInputProps()} />
        {loading ? (
          <Loader2 size={28} className="animate-spin flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
        ) : (
          <Upload size={28} className="flex-shrink-0" style={{ color: isDragActive ? 'var(--color-accent)' : 'var(--color-text-muted)' }} />
        )}
        <div className="text-center sm:text-left">
          <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
            {loading ? 'Importing…' : isDragActive ? 'Drop PDFs here' : 'Add PDF books'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Drag & drop or click to browse
          </p>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-xs whitespace-pre-line" style={{ color: '#f87171' }}>{error}</p>
      )}
    </div>
  )
}
