import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import LoadingState from '../components/common/LoadingState'
import ErrorAlert from '../components/common/ErrorAlert'
import FavoriteToggleButton from '../components/library/FavoriteToggleButton'
import ReadingListActions from '../components/library/ReadingListActions'
import AnalysisResultPanel from '../components/ai/AnalysisResultPanel'
import { fetchPaperById } from '../services/paperService'
import { useAuth } from '../contexts/AuthContext'
import { useLibrary } from '../contexts/LibraryContext'
import { useAnalysis } from '../contexts/AnalysisContext'

export default function PaperDetailPage() {
  const { paperId } = useParams()
  const { token } = useAuth()
  const { favorites, toggleFavorite, addToReadingList } = useLibrary()
  const { analysisByPaperId, submitForPaper, loadByPaper, error: analysisError } = useAnalysis()

  const [paper, setPaper] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const paperIdNum = Number(paperId)
  const isFavorite = useMemo(
    () => (favorites || []).some((item) => item.id === paperIdNum),
    [favorites, paperIdNum],
  )

  useEffect(() => {
    setLoading(true)
    setError('')
    fetchPaperById(paperIdNum, token)
      .then((res) => setPaper(res.data))
      .catch((err) => setError(err.message || '讀取論文失敗'))
      .finally(() => setLoading(false))
  }, [paperIdNum, token])

  const onToggleFavorite = async () => {
    await toggleFavorite(paperIdNum, isFavorite)
  }

  const onAddReading = async () => {
    await addToReadingList({ paper_id: paperIdNum, priority: 0, note: '' })
  }

  const onAnalyze = async () => {
    await submitForPaper(paperIdNum)
  }

  const onLoadLatest = async () => {
    await loadByPaper(paperIdNum)
  }

  if (loading) return <LoadingState label="讀取論文詳情中..." />

  return (
    <Stack spacing={2}>
      <Typography variant="h5">論文詳情</Typography>
      <ErrorAlert message={error} />
      <ErrorAlert message={analysisError} />

      {paper && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {paper.title}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              <Chip size="small" label={`Year: ${paper.year || '-'}`} />
              <Chip size="small" label={`Domain: ${paper.domain || '-'}`} />
              <Chip size="small" label={`Venue: ${paper.venue || '-'}`} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {paper.abstract || 'No abstract'}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <FavoriteToggleButton active={isFavorite} onClick={onToggleFavorite} />
              <ReadingListActions onAdd={onAddReading} />
              <Button size="small" onClick={onAnalyze} variant="contained">
                執行 AI 分析
              </Button>
              <Button size="small" onClick={onLoadLatest}>
                讀取最新分析
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {analysisByPaperId[paperIdNum] ? (
        <AnalysisResultPanel result={analysisByPaperId[paperIdNum]} />
      ) : (
        <Alert severity="info">尚無此論文分析結果</Alert>
      )}
    </Stack>
  )
}

