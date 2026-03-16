import { useEffect, useMemo, useState } from 'react'
import { Alert, Pagination, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PaperCard from '../components/paper/PaperCard'
import PaperFilterPanel from '../components/paper/PaperFilterPanel'
import LoadingState from '../components/common/LoadingState'
import ErrorAlert from '../components/common/ErrorAlert'
import { usePaperSearch } from '../contexts/PaperSearchContext'
import { useLibrary } from '../contexts/LibraryContext'
import { useAnalysis } from '../contexts/AnalysisContext'

export default function PaperSearchPage() {
  const navigate = useNavigate()
  const { filters, results, meta, loading, error, setFilters, searchPapers } = usePaperSearch()
  const { favorites, toggleFavorite, addToReadingList } = useLibrary()
  const { submitForPaper } = useAnalysis()
  const [localFilters, setLocalFilters] = useState(filters)
  const favoriteIds = useMemo(() => new Set((favorites || []).map((item) => item.id)), [favorites])

  useEffect(() => {
    searchPapers(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = { ...localFilters, page: 1 }
    setFilters(next)
    await searchPapers(next)
  }

  const onChangeField = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }))
  }

  const onPageChange = async (_, page) => {
    const next = { ...filters, page }
    setFilters(next)
    await searchPapers(next)
  }

  const onToggleFavorite = async (paperId) => {
    await toggleFavorite(paperId, favoriteIds.has(paperId))
  }

  const onAddReading = async (paperId) => {
    await addToReadingList({ paper_id: paperId, priority: 0, note: '' })
  }

  const onAnalyze = async (paperId) => {
    await submitForPaper(paperId)
    navigate('/analysis')
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">論文搜尋</Typography>
      <PaperFilterPanel filters={localFilters} onChange={onChangeField} onSubmit={handleSubmit} />
      <ErrorAlert message={error} />
      {loading && <LoadingState label="搜尋中..." />}

      {!loading && results.length === 0 && <Alert severity="info">目前沒有符合條件的論文</Alert>}

      <Stack spacing={2}>
        {results.map((paper) => (
          <PaperCard
            key={paper.id}
            paper={paper}
            isFavorite={favoriteIds.has(paper.id)}
            onToggleFavorite={onToggleFavorite}
            onAddReading={onAddReading}
            onAnalyze={onAnalyze}
          />
        ))}
      </Stack>

      {meta.total > meta.page_size && (
        <Pagination
          page={meta.page || 1}
          count={Math.ceil(meta.total / meta.page_size)}
          onChange={onPageChange}
        />
      )}
    </Stack>
  )
}

