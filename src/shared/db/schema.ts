import Dexie, { type Table } from 'dexie'
import type { Book } from '@/shared/types/book'
import type { Annotation } from '@/shared/types/annotation'
import type { Bookmark } from '@/shared/types/bookmark'
import type { ReadingPosition } from '@/shared/types/reading-position'

export class PdfBookDb extends Dexie {
  books!: Table<Book>
  readingPositions!: Table<ReadingPosition>
  bookmarks!: Table<Bookmark>
  annotations!: Table<Annotation>

  constructor() {
    super('PdfBookDb')
    this.version(1).stores({
      books:            '++id, title, addedAt',
      readingPositions: 'bookId',
      bookmarks:        '++id, bookId, pageNumber',
      annotations:      '++id, bookId, pageNumber',
    })
  }
}

export const db = new PdfBookDb()
