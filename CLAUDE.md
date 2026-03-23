# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server → http://localhost:5173
npm run build      # tsc type-check + Vite production build → dist/
npm run preview    # serve the production build locally
```

No tests or lint script configured.

## Architecture

Local-first SPA — no server, no auth. All user data (PDF binaries, reading positions, bookmarks, highlights) lives in the browser's IndexedDB via Dexie. The app is a static bundle that can be served from any CDN.

### Layer structure (Feature-Sliced Design + Atomic Design)

```
src/
  app/        App.tsx (BrowserRouter + ThemeProvider + ErrorBoundary), index.css
  pages/      LibraryPage, ReaderPage — thin route shells, compose widgets + features
  widgets/    reader/  — PageCanvas, TextLayer, PageRenderer, ReaderToolbar, BottomBar
              sidebar/ — Sidebar, BookmarksList, AnnotationsList + useAllAnnotations hook
  features/   read-pdf/        — useBookLoader, usePdfDocument, useReadingPosition,
                                  useFitScale, useKeyboardNavigation, usePageRenderer
              upload-book/     — UploadZone
              highlight-text/  — SelectionPopover, useAnnotations, selectionHandler
              bookmark-page/   — useBookmarks
  entities/   book/            — useLibraryStore, useBookProgress, BookCard
              annotation/      — HighlightLayer
  shared/     db/              — schema.ts (Dexie), queries.ts (all IndexedDB access)
              lib/pdf/         — engine.ts (PDF.js init + helpers)
              lib/hooks/       — useSwipeNavigation, useTextSelection
              model/           — readerStore, uiStore (Zustand)
              types/           — Book, BookMeta, Annotation, Bookmark, ReadingPosition
              ui/atoms/        — IconButton, Spinner, ProgressBar
              ui/molecules/    — PageCounter, ThemeToggle, ZoomControls
              ui/              — ErrorBoundary
```

**Dependency rule**: each layer imports only from layers below it. `shared` has no business-logic imports. Within `shared`, segments (ui, model, db, lib) may cross-import freely.

### Data flow

**Import:**
```
UploadZone → loadPdfDocument (one call) → extracts title + pageCount + cover thumbnail
           → addBook() in shared/db/queries → IndexedDB
```

**Reading:**
```
ReaderPage (parseSafeBookId from URL)
  → useBookLoader   — getBookData() from IndexedDB, sets activeBookId in readerStore
  → usePdfDocument  — loads PDFDocumentProxy from ArrayBuffer, sets pdfDocument + totalPages
  → useReadingPosition — restores saved page (pending-page pattern, see below)
  → useFitScale     — computes scale from viewport dims on every fitMode/page change
  → useKeyboardNavigation — arrow/j/k/Space/Home/End shortcuts (window event listener)
  → useSwipeNavigation  — pointer events, touch/pen only, 50px threshold + 1.5× ratio
  widgets/reader/PageRenderer renders: PageCanvas → TextLayer → HighlightLayer → SelectionPopover
  → useReadingPosition debounce-saves current page to IndexedDB (600 ms)
```

### State

| Store | Location | Contents |
|---|---|---|
| `readerStore` | `shared/model/readerStore` | `currentPage`, `totalPages`, `scale`, `fitMode`, `pdfDocument`, `pdfLoadError`, `activeBookId` |
| `useLibraryStore` | `entities/book/model/store` | `books: BookMeta[]`, `isLoading` — no `pdfData` blob in memory |
| `uiStore` | `shared/model/uiStore` | `theme` (persisted to localStorage), `sidebarOpen`, `sidebarTab`, `activeAnnotationId` |

All IndexedDB reads/writes go through `shared/db/queries.ts` — never import `db` directly in components or hooks.

### Critical non-obvious behaviours

**Annotation coordinates are normalised.** `captureSelection()` in `features/highlight-text/lib/selectionHandler.ts` converts DOM pixel positions to PDF-space 0–1 floats before storage. `HighlightLayer` multiplies back to pixels at render time using the current viewport. Never store or compare raw pixel positions for annotations.

**Reading position pending-page pattern.** `useReadingPosition` parks the saved page in a `pendingPageRef` and applies it inside a `useEffect` that watches `totalPages`. IndexedDB resolves before the PDF loads, and `goToPage` clamps to `totalPages` (which is 0 until the document is ready), so applying immediately would always land on page 1.

**Single PDF load on import.** `UploadZone` opens one `PDFDocumentProxy` and reuses it for page count, metadata extraction, and cover thumbnail generation. Never call `loadPdfDocument` more than once on the same buffer.

**Scale cap.** `useFitScale` applies `Math.min(1.0, computed)` — auto-fit never exceeds 100% zoom. Manual zoom via `ZoomControls` (toolbar, desktop only) is uncapped up to 4×.

**`goToPage` always clamps.** `readerStore.goToPage` clamps to `[1, totalPages]`. Calling it when `totalPages === 0` will silently land on page 1, which is why the pending-page pattern exists.

**Swipe skips mouse.** `useSwipeNavigation` early-returns when `e.pointerType === 'mouse'`, so drag-to-scroll on desktop is unaffected. `onPointerCancel` clears the start refs to prevent ghost navigation from interrupted touches.

### Mobile layout

- **`sm:` (640 px)** is the single primary breakpoint separating mobile from desktop.
- **Mobile**: edge-to-edge PDF (no padding), `BottomBar` for navigation, full-screen sidebar overlay with backdrop.
- **Desktop**: `sm:p-6` viewport padding, inline toolbar with `PageCounter` + `ZoomControls`, docked `w-72` sidebar.
- `BottomBar` uses `env(safe-area-inset-bottom)` for phones with home bars (requires `viewport-fit=cover` in `index.html`).
- `ReaderToolbar` uses `env(safe-area-inset-top/left/right)` for notched devices.
- `touch-action: manipulation` is set globally on all `button` and `a` elements in `app/index.css` to remove the 300 ms tap delay.

### IndexedDB schema

`PdfBookDb` (Dexie, version 1). To add a new indexed field, add a `version(2).stores(...)` migration block in `shared/db/schema.ts` alongside the existing `version(1)` block — never edit the existing version entry.

### Path alias

`@/` resolves to `src/`. Configured in `vite.config.ts` and `tsconfig.app.json`.

### PDF.js worker

Set once in `shared/lib/pdf/engine.ts` via `new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url)`. Do not set `GlobalWorkerOptions.workerSrc` anywhere else. The `pdfjs-dist` package is excluded from Vite's `optimizeDeps` to prevent chunking issues.
