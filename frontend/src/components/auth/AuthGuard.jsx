import { Alert, Button, Stack } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function AuthGuard({ children }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <Stack spacing={2}>
        <Alert severity="warning">此頁面需要先登入</Alert>
        <Button component={RouterLink} to="/auth" variant="contained">
          前往登入
        </Button>
      </Stack>
    )
  }

  return children
}

