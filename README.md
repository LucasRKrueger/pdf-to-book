# PDF Book Reader

A local-first web application that transforms PDF books into a smooth, Kindle-like reading experience — with bookmarks, highlights, and reading progress. Everything is stored in your browser. No server, no account, no uploads.

---

## Features

- **Kindle-like reading** — paginated view, page-turn animation, fit-to-width scaling
- **Reading progress** — automatically saves your position per book, resumes where you left off
- **Highlights** — select any text and highlight it in yellow, green, pink, or blue; highlights survive zoom changes
- **Bookmarks** — bookmark any page with one tap; jump back instantly from the sidebar
- **Annotations sidebar** — browse all your highlights and bookmarks across a book
- **Three themes** — Dark, Sepia, Light (preference persisted across sessions)
- **Mobile-first** — swipe to navigate, tap zones, bottom navigation bar, safe-area aware, fully responsive
- **Fully offline** — PDF files and all annotations are stored in your browser's IndexedDB; nothing leaves your device

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Vite + React 19 + TypeScript |
| PDF Rendering | pdfjs-dist (PDF.js) — direct, not wrapped |
| Storage | Dexie.js (IndexedDB) |
| State | Zustand (with `persist` middleware for theme) |
| UI Primitives | Radix UI + Tailwind CSS |
| Animations | Framer Motion |
| Icons | Lucide React |
| File Upload | react-dropzone |

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve production build locally
```

---

## How to Use

### Adding Books
Drag and drop one or more PDF files onto the upload zone on the library page, or click it to browse. The app extracts the title from PDF metadata (falls back to the filename), generates a cover thumbnail from page 1, and stores the full PDF in IndexedDB.

### Reading
Click any book to open it. The reader defaults to fit-to-width at no more than 100% zoom.

| Action | Desktop | Mobile |
|---|---|---|
| Next page | `→` `↓` `j` `Space` | Swipe left or tap right 30% of screen |
| Previous page | `←` `↑` `k` | Swipe right or tap left 30% of screen |
| Jump to page | Click the page counter in the toolbar | — |
| Zoom in / out | Zoom buttons in toolbar | — |
| Fit to width | Fit-width button (⤢) in toolbar | Auto on open |
| Bookmark page | Bookmark icon in toolbar | Bookmark icon in toolbar |
| Open sidebar | Panel icon in toolbar | Panel icon in toolbar |
| Back to library | Back arrow | Back arrow |

### Highlights
Select any text on the page. A colour picker appears — choose a highlight colour or tap **U** to underline. Highlights are stored as normalised PDF-space coordinates so they render correctly at any zoom level.

### Bookmarks & Annotations
Open the sidebar (panel icon, top right) to see all bookmarks and highlights for the current book. Click any entry to jump to that page. On mobile, tapping outside the sidebar or pressing the × button closes it.

### Deleting Books
Hover a book card and click the trash icon. Tap once to arm (turns red), tap again within 3 seconds to confirm. On touch devices the icon is always visible. Deleting a book removes all associated reading positions, bookmarks, and highlights.

---

## Architecture

The codebase follows **Feature-Sliced Design** with **Atomic Design** inside the shared UI layer. Each layer may only import from layers below it.

```
src/
  app/        Router, ThemeProvider, ErrorBoundary, global CSS
  pages/      LibraryPage, ReaderPage — route shells that compose widgets
  widgets/    reader/  (toolbar, page renderer, bottom bar)
              sidebar/ (bookmarks + highlights panel)
  features/   read-pdf/, upload-book/, highlight-text/, bookmark-page/
  entities/   book/, annotation/ — domain models + basic display UI
  shared/     db/, lib/, model/ (Zustand stores), types/, ui/atoms+molecules
```

### Key Design Decisions

**Annotation coordinates are normalised.** Highlights are stored as `PdfRect[]` with `x`, `y`, `width`, `height` in 0–1 PDF-space coordinates. At render time they are multiplied back to pixel coordinates for the current viewport scale. Highlights never drift when the user zooms.

**Single PDF.js document load on import.** Title extraction, cover thumbnail generation, and page count are all derived from one `getDocument()` call.

**Reading position uses a pending-page pattern.** IndexedDB resolves faster than the PDF renders, so the hook parks the saved page in a ref and applies it the moment `totalPages` becomes non-zero.

**No server required.** The entire app is a static SPA. Host it on any CDN or serve `dist/` with any static file server.

---

## Storage

All data is stored in an IndexedDB database named `PdfBookDb`.

| Table | Contents |
|---|---|
| `books` | Metadata + full PDF `ArrayBuffer` |
| `readingPositions` | One row per book, keyed by `bookId` |
| `bookmarks` | Per-page bookmarks with optional notes |
| `annotations` | Text highlights and underlines with normalised rects |

The app checks available storage quota before importing each PDF and surfaces a clear error if space is insufficient.

---

## Browser Support

Chrome, Edge, Firefox, Safari 16.4+. The PDF.js worker runs in a separate thread via a module worker URL resolved at build time by Vite.

---

## Known Limitations

- **No cross-page text selection.** Each page is an independent DOM subtree; selection cannot span a page boundary.
- **No annotations export.** Highlights exist only in this app's database — they are not written back into the PDF file.
- **Large PDFs (100 MB+)** may be slow to import on low-end mobile devices since thumbnail generation runs on the main thread.
- **Safari on iOS** may purge IndexedDB storage under memory pressure; books will need to be re-imported if this happens.
