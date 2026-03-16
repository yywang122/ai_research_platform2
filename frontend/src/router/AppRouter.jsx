import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import HomePage from '../pages/HomePage'
import AuthPage from '../pages/AuthPage'
import PaperSearchPage from '../pages/PaperSearchPage'
import PaperDetailPage from '../pages/PaperDetailPage'
import FavoritesPage from '../pages/FavoritesPage'
import ReadingListPage from '../pages/ReadingListPage'
import AIAnalysisPage from '../pages/AIAnalysisPage'

export default function AppRouter() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/papers" element={<PaperSearchPage />} />
        <Route path="/papers/:paperId" element={<PaperDetailPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/reading-list" element={<ReadingListPage />} />
        <Route path="/analysis" element={<AIAnalysisPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

