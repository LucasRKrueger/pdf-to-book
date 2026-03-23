export interface Book {
  id?: number
  title: string
  fileName: string
  pageCount: number
  coverDataUrl?: string
  addedAt: Date
  fileSizeBytes: number
  pdfData: ArrayBuffer
}

export interface BookMeta extends Omit<Book, 'pdfData'> {
  id: number
}
