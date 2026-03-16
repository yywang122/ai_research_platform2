import { Card, CardContent, Typography } from '@mui/material'
import AuthForms from '../components/auth/AuthForms'

export default function AuthPage() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2 }}>
          註冊 / 登入
        </Typography>
        <AuthForms />
      </CardContent>
    </Card>
  )
}

