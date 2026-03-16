import { Box, CircularProgress, Typography } from '@mui/material'

export default function LoadingState({ label = '載入中...' }) {
  return (
    <Box sx={{ py: 4, textAlign: 'center' }}>
      <CircularProgress size={26} />
      <Typography variant="body2" sx={{ mt: 1 }}>
        {label}
      </Typography>
    </Box>
  )
}

