import { Card, CardContent, Chip, Stack, Typography } from '@mui/material'

function toTagList(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function AnalysisResultPanel({ result }) {
  if (!result) return null

  const tags = toTagList(result.tags_json)

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip label={`狀態: ${result.status || '-'}`} color={result.status === 'completed' ? 'success' : 'default'} />
          <Chip label={`模型: ${result.model_name || '-'}`} />
        </Stack>

        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
          摘要
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {result.summary || '尚無摘要'}
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
          研究方法
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {result.methodology || '尚無研究方法'}
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
          可能應用場景
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {result.applications || '尚無應用場景'}
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          標籤
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {tags.length > 0 ? tags.map((tag) => <Chip key={tag} size="small" label={tag} />) : <Typography variant="body2">無標籤</Typography>}
        </Stack>
      </CardContent>
    </Card>
  )
}

