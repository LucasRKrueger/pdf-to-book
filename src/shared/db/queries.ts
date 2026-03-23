import { db } from './schema'
import type { Book, BookMeta } from '@/shared/types/book'
import type { Annotation } from '@/shared/types/annotation'
import type { Bookmark } from '@/shared/types/bookmark'
import type { ReadingPosition } from '@/shared/types/reading-position'

// ── Books ─────────────────────────────────────────────────────

export async function addBook(book: Book): Promise<number> {
  return db.books.add(book)
}

export async function getAllBooksMeta(): Promise<BookMeta[]> {
  const books = await db.books.orderBy('addedAt').reverse().toArray()
  return books.map(({ pdfData: _pd, ...meta }) => meta as BookMeta)
}

export async function getBookData(bookId: number): Promise<Book | undefined> {
  return db.books.get(bookId)
}

export async function deleteBook(bookId: number): Promise<void> {
  await db.transaction('rw', db.books, db.readingPositions, db.bookmarks, db.annotations, async () => {
    await db.books.delete(bookId)
    await db.readingPositions.delete(bookId)
    await db.bookmarks.where('bookId').equals(bookId).delete()
    await db.annotations.where('bookId').equals(bookId).delete()
  })
}

// ── Reading position ──────────────────────────────────────────

export async function saveReadingPosition(pos: ReadingPosition): Promise<void> {
  await db.readingPositions.put(pos)
}

export async function getReadingPosition(bookId: number): Promise<ReadingPosition | undefined> {
  return db.readingPositions.get(bookId)
}

// ── Bookmarks ─────────────────────────────────────────────────

export async function getBookmarks(bookId: number): Promise<Bookmark[]> {
  return db.bookmarks.where('bookId').equals(bookId).sortBy('pageNumber')
}

export async function addBookmark(bookmark: Bookmark): Promise<number> {
  return db.bookmarks.add(bookmark)
}

export async function deleteBookmark(bookmarkId: number): Promise<void> {
  await db.bookmarks.delete(bookmarkId)
}

export async function isPageBookmarked(bookId: number, pageNumber: number): Promise<boolean> {
  const count = await db.bookmarks
    .where('bookId').equals(bookId)
    .and(b => b.pageNumber === pageNumber)
    .count()
  return count > 0
}

export async function getBookmarkForPage(bookId: number, pageNumber: number): Promise<Bookmark | undefined> {
  const results = await db.bookmarks
    .where('bookId').equals(bookId)
    .and(b => b.pageNumber === pageNumber)
    .toArray()
  return results[0]
}

// ── Annotations ───────────────────────────────────────────────

export async function getAnnotations(bookId: number, pageNumber: number): Promise<Annotation[]> {
  return db.annotations
    .where('bookId').equals(bookId)
    .and(a => a.pageNumber === pageNumber)
    .toArray()
}

export async function getAllAnnotations(bookId: number): Promise<Annotation[]> {
  return db.annotations.where('bookId').equals(bookId).sortBy('pageNumber')
}

export async function addAnnotation(annotation: Annotation): Promise<number> {
  return db.annotations.add(annotation)
}

export async function updateAnnotation(id: number, changes: Partial<Annotation>): Promise<void> {
  await db.annotations.update(id, changes)
}

export async function deleteAnnotation(annotationId: number): Promise<void> {
  await db.annotations.delete(annotationId)
}
