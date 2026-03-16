import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/', label: '首頁' },
  { to: '/papers', label: '論文搜尋' },
  { to: '/favorites', label: '收藏' },
  { to: '/reading-list', label: '閱讀清單' },
  { to: '/analysis', label: 'AI 分析' },
]

export default function AppShell({ children }) {
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ mr: 1 }}>
            AI Research Platform
          </Typography>
          {navItems.map((item) => (
            <Button
              key={item.to}
              component={RouterLink}
              to={item.to}
              color="inherit"
              variant={location.pathname.startsWith(item.to) && item.to !== '/' ? 'outlined' : 'text'}
              sx={{ borderColor: 'rgba(255,255,255,0.4)' }}
            >
              {item.label}
            </Button>
          ))}
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAuthenticated ? (
              <>
                <Typography variant="body2">{user?.display_name || user?.email}</Typography>
                <Button color="inherit" onClick={logout}>
                  登出
                </Button>
              </>
            ) : (
              <Button component={RouterLink} to="/auth" color="inherit" variant="outlined">
                註冊 / 登入
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 3 }}>{children}</Container>
    </Box>
  )
}

