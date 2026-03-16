import { useEffect } from 'react'
import {
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import AuthGuard from '../components/auth/AuthGuard'
import LoadingState from '../components/common/LoadingState'
import ErrorAlert from '../components/common/ErrorAlert'
import AnalysisResultPanel from '../components/ai/AnalysisResultPanel'
import { useAnalysis } from '../contexts/AnalysisContext'

export default function AIAnalysisPage() {
  const {
    analysisByPaperId,
    history,
    recommendations,
    loading,
    error,
    loadHistory,
    loadRecommendations,
  } = useAnalysis()

  useEffect(() => {
    loadHistory()
    loadRecommendations({ top_k: 10 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthGuard>
      <Stack spacing={2}>
        <Typography variant="h5">AI 分析</Typography>
        <ErrorAlert message={error} />
        {loading && <LoadingState label="載入 AI 分析資料中..." />}

        {!loading && history.length === 0 && <Alert severity="info">尚無 AI 分析歷史紀錄</Alert>}

        {!loading && history.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                分析歷史
              </Typography>
              <List dense>
                {history.map((item) => (
                  <ListItem key={item.id} divider>
                    <ListItemText
                      primary={item.title}
                      secondary={`paper_id=${item.paper_id} / status=${item.status} / created_at=${item.created_at}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              推薦結果（/api/recommendations）
            </Typography>
            {recommendations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                目前無推薦結果
              </Typography>
            ) : (
              <List dense>
                {recommendations.map((item) => (
                  <ListItem key={item.id} divider>
                    <ListItemText
                      primary={item.title}
                      secondary={`score=${item.score} / reason=${item.reason}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {Object.entries(analysisByPaperId).map(([paperId, result]) => (
          <Stack key={paperId} spacing={1}>
            <Typography variant="subtitle2">Paper #{paperId} 最新分析</Typography>
            <AnalysisResultPanel result={result} />
          </Stack>
        ))}
      </Stack>
    </AuthGuard>
  )
}

