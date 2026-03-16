import { useEffect } from 'react'
import { Alert, Card, CardContent, Stack, Typography } from '@mui/material'
import AuthGuard from '../components/auth/AuthGuard'
import LoadingState from '../components/common/LoadingState'
import ErrorAlert from '../components/common/ErrorAlert'
import PaperCard from '../components/paper/PaperCard'
import { useLibrary } from '../contexts/LibraryContext'
import { useAnalysis } from '../contexts/AnalysisContext'

export default function FavoritesPage() {
  const { favorites, loading, error, loadFavorites, toggleFavorite, addToReadingList } = useLibrary()
  const { submitForPaper } = useAnalysis()

  useEffect(() => {
    loadFavorites()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthGuard>
      <Stack spacing={2}>
        <Typography variant="h5">我的收藏</Typography>
        <ErrorAlert message={error} />
        {loading && <LoadingState label="載入收藏中..." />}

        {!loading && favorites.length === 0 && <Alert severity="info">尚無收藏內容</Alert>}

        <Stack spacing={2}>
          {favorites.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              isFavorite
              onToggleFavorite={(id) => toggleFavorite(id, true)}
              onAddReading={(id) => addToReadingList({ paper_id: id, priority: 0, note: '' })}
              onAnalyze={submitForPaper}
            />
          ))}
        </Stack>

        {!loading && favorites.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="body2">共 {favorites.length} 篇收藏論文</Typography>
            </CardContent>
          </Card>
        )}
      </Stack>
    </AuthGuard>
  )
}

