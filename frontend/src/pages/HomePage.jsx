import { Alert, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Stack spacing={2}>
      <Typography variant="h4">AI Research Paper Intelligence Platform</Typography>
      <Typography variant="body1" color="text.secondary">
        搜尋、收藏、管理閱讀清單，並查看 AI 研究摘要、方法與應用場景。
      </Typography>

      {isAuthenticated ? (
        <Alert severity="success">歡迎回來，{user?.display_name || user?.email}</Alert>
      ) : (
        <Alert severity="info">尚未登入，部分功能（收藏 / 閱讀清單 / AI 分析）需先登入。</Alert>
      )}

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button component={RouterLink} to="/papers" variant="contained">
              進入論文搜尋
            </Button>
            <Button component={RouterLink} to="/analysis" variant="outlined">
              查看 AI 分析
            </Button>
            <Button component={RouterLink} to="/auth" variant="text">
              註冊 / 登入
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

