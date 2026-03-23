# PDF Book Reader

A local-first web application that transforms PDF books into a smooth, Kindle-like reading experience — with bookmarks, highlights, and reading progress. Everything is stored in your browser. No server, no account, no uploads.

---

## Features

- **Kindle-like reading** — paginated view, page-turn animation, fit-to-width/page scaling
- **Reading progress** — automatically saves your position per book, resumes where you left off
- **Highlights** — select any text and highlight it in yellow, green, pink, or blue; highlights survive zoom changes
- **Bookmarks** — bookmark any page with one tap; jump back instantly from the sidebar
- **Annotations sidebar** — browse all your highlights and bookmarks across a book
- **Three themes** — Dark, Sepia, Light (preference persisted across sessions)
- **Mobile-first** — swipe left/right to navigate, tap zones, bottom navigation bar, responsive layout
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
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open `http://localhost:5173` in your browser.

---

## How to Use

### Adding Books
Drag and drop one or more PDF files onto the upload zone on the library page, or click it to browse. The app extracts the title from PDF metadata automatically (falls back to the filename), generates a cover thumbnail from page 1, and stores the full PDF in IndexedDB.

### Reading
Click any book to open it. The reader defaults to fit-to-width at no more than 100% zoom.

| Action | Desktop | Mobile |
|---|---|---|
| Next page | `→` `↓` `j` `Space` | Swipe left or tap right edge |
| Previous page | `←` `↑` `k` | Swipe right or tap left edge |
| Jump to page | Click the page counter in the toolbar | — |
| Zoom in/out | `+` / `−` buttons in toolbar | — |
| Fit to width | "Fit W" button | Auto on open |
| Fit to page | "Fit P" button | — |
| Bookmark page | Bookmark icon in toolbar | Bookmark icon in toolbar |
| Open sidebar | Panel icon in toolbar | Panel icon in toolbar |
| Back to library | Back arrow | Back arrow |

### Highlights
Select any text on the page. A colour picker appears — choose a highlight colour or tap **U** to underline. Highlights are stored as normalised PDF-space coordinates so they render correctly at any zoom level.

### Bookmarks & Annotations
Open the sidebar (panel icon, top right) to see all bookmarks and highlights for the current book. Click any entry to jump to that page.

### Deleting Books
Hover a book card and click the trash icon. Tap once to arm (turns red), tap again to confirm. On touch devices the icon is always visible. Deleting a book removes all associated reading positions, bookmarks, and highlights.

---

## Architecture

```
src/
  db/              Dexie schema + all IndexedDB query functions
  store/           Zustand stores: readerStore, libraryStore, uiStore
  pdf/             PDF.js wrappers: engine, text layer, selection handler
  hooks/           usePdfDocument, usePageRenderer, useReadingPosition,
                   useAnnotations, useBookmarks, useTextSelection, useSwipeNavigation
  components/
    reader/        PageCanvas, TextLayer, HighlightLayer, SelectionPopover,
                   ReaderToolbar, BottomBar, PageRenderer
    sidebar/       Sidebar (Radix Tabs), BookmarksList, AnnotationsList
    library/       LibraryGrid, BookCard, UploadZone
    shared/        ThemeProvider, ErrorBoundary
  pages/           LibraryPage, ReaderPage
  types/           book, annotation, bookmark, readingPosition
```

### Key Design Decisions

**Annotation coordinates are normalised.** Highlights are stored as `PdfRect[]` with `x`, `y`, `width`, `height` in 0–1 PDF-space coordinates. At render time they are multiplied back to pixel coordinates for the current viewport scale. This means highlights never drift when the user zooms.

**Single PDF.js document load on import.** Title extraction, cover thumbnail generation, and page count are all derived from one `getDocument()` call, avoiding the 3× RAM spike that would occur from parallel loads of the same binary.

**Reading position uses a pending-page pattern.** IndexedDB resolves faster than the PDF renders, so `goToPage` would clamp to page 1 when `totalPages` is still 0. The hook parks the saved page in a ref and applies it the moment `totalPages` transitions from 0 to its real value.

**No server required.** The entire app is a static SPA. Host it on any CDN or serve the `dist/` folder with any static file server.

---

## Storage

All data is stored in an IndexedDB database named `PdfBookDb`.

| Table | Contents |
|---|---|
| `books` | Metadata + full PDF `ArrayBuffer` |
| `readingPositions` | One row per book, keyed by `bookId` |
| `bookmarks` | Per-page bookmarks with optional notes |
| `annotations` | Text highlights and underlines with normalised rects |

The app checks available storage quota before importing each PDF and surfaces a specific error if space is insufficient, rather than a generic failure.

---

## Browser Support

Works in all modern browsers that support IndexedDB and the File System Access API (Chrome, Edge, Firefox, Safari 16.4+). The PDF.js worker runs in a separate thread via a module worker URL resolved at build time by Vite.

---

## Known Limitations

- **No cross-page text selection.** Each page is an independent DOM subtree. Text selection cannot span a page boundary.
- **No PDF form filling or annotations export.** Highlights exist only inside this app's database — they are not written back into the PDF file.
- **Large PDFs (100 MB+)** may be slow to import on low-end mobile devices since thumbnail generation runs on the main thread.
- **Safari on iOS** may purge IndexedDB storage under memory pressure. Books will need to be re-imported if this happens.
