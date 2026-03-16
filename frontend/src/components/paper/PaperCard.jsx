import { Card, CardActions, CardContent, Chip, Stack, Typography, Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function PaperCard({
  paper,
  isFavorite,
  onToggleFavorite,
  onAddReading,
  onAnalyze,
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {paper.title}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
          <Chip size="small" label={`Year: ${paper.year || '-'}`} />
          <Chip size="small" label={`Domain: ${paper.domain || '-'}`} />
          <Chip size="small" label={`Venue: ${paper.venue || '-'}`} />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {paper.abstract || 'No abstract'}
        </Typography>
      </CardContent>
      <CardActions sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Button component={RouterLink} to={`/papers/${paper.id}`} size="small">
          查看詳情
        </Button>
        <Button size="small" variant={isFavorite ? 'outlined' : 'contained'} onClick={() => onToggleFavorite(paper.id)}>
          {isFavorite ? '取消收藏' : '加入收藏'}
        </Button>
        <Button size="small" onClick={() => onAddReading(paper.id)}>
          加入閱讀清單
        </Button>
        <Button size="small" onClick={() => onAnalyze(paper.id)}>
          AI 分析
        </Button>
      </CardActions>
    </Card>
  )
}

