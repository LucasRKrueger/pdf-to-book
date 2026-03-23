import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary'
import { LibraryPage } from '@/pages/LibraryPage'
import { ReaderPage } from '@/pages/ReaderPage'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <div className="h-full">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={
                <ErrorBoundary>
                  <LibraryPage />
                </ErrorBoundary>
              } />
              <Route path="/reader/:bookId" element={
                <ErrorBoundary>
                  <ReaderPage />
                </ErrorBoundary>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </ThemeProvider>
    </BrowserRouter>
  )
}
