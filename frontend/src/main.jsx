import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import App from './App.jsx'
import { theme } from './theme/theme'
import { AuthProvider } from './contexts/AuthContext'
import { PaperSearchProvider } from './contexts/PaperSearchContext'
import { LibraryProvider } from './contexts/LibraryContext'
import { AnalysisProvider } from './contexts/AnalysisContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <PaperSearchProvider>
            <LibraryProvider>
              <AnalysisProvider>
                <App />
              </AnalysisProvider>
            </LibraryProvider>
          </PaperSearchProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
