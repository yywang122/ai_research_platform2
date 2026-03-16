import { Box, Button, Stack, TextField } from '@mui/material'

export default function PaperFilterPanel({ filters, onChange, onSubmit }) {
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ mb: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          fullWidth
          label="關鍵字"
          value={filters.q}
          onChange={(e) => onChange('q', e.target.value)}
        />
        <TextField
          fullWidth
          label="年份"
          value={filters.year}
          onChange={(e) => onChange('year', e.target.value)}
        />
        <TextField
          fullWidth
          label="領域"
          value={filters.domain}
          onChange={(e) => onChange('domain', e.target.value)}
        />
        <TextField
          fullWidth
          label="會議"
          value={filters.venue}
          onChange={(e) => onChange('venue', e.target.value)}
        />
      </Stack>
      <Button sx={{ mt: 2 }} type="submit" variant="contained">
        搜尋 / 篩選
      </Button>
    </Box>
  )
}
