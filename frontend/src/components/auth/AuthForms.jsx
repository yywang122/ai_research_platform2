import { useState } from 'react'
import { Alert, Box, Button, Stack, Tab, Tabs, TextField } from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'

export default function AuthForms() {
  const { login, register } = useAuth()
  const [tab, setTab] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', display_name: '' })

  const onLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await login(loginForm)
      setSuccess('登入成功')
    } catch (err) {
      setError(err.message || '登入失敗')
    }
  }

  const onRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await register(registerForm)
      setSuccess('註冊成功，請切換到登入')
      setTab(0)
    } catch (err) {
      setError(err.message || '註冊失敗')
    }
  }

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="登入" />
        <Tab label="註冊" />
      </Tabs>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
      </Stack>

      {tab === 0 ? (
        <Box component="form" onSubmit={onLogin} sx={{ mt: 2, display: 'grid', gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            required
            value={loginForm.email}
            onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
          />
          <TextField
            label="Password"
            type="password"
            required
            value={loginForm.password}
            onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
          />
          <Button type="submit" variant="contained">
            登入
          </Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={onRegister} sx={{ mt: 2, display: 'grid', gap: 2 }}>
          <TextField
            label="Display Name"
            value={registerForm.display_name}
            onChange={(e) => setRegisterForm((p) => ({ ...p, display_name: e.target.value }))}
          />
          <TextField
            label="Email"
            type="email"
            required
            value={registerForm.email}
            onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))}
          />
          <TextField
            label="Password"
            type="password"
            required
            value={registerForm.password}
            onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))}
          />
          <Button type="submit" variant="contained">
            註冊
          </Button>
        </Box>
      )}
    </Box>
  )
}

