import { Box, Button, Grid, TextField } from '@mui/material'

export default function PaperFilterPanel({ filters, onChange, onSubmit }) {
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="關鍵字"
            value={filters.q}
            onChange={(e) => onChange('q', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="年份"
            value={filters.year}
            onChange={(e) => onChange('year', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="領域"
            value={filters.domain}
            onChange={(e) => onChange('domain', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="會議"
            value={filters.venue}
            onChange={(e) => onChange('venue', e.target.value)}
          />
        </Grid>
      </Grid>
      <Button sx={{ mt: 2 }} type="submit" variant="contained">
        搜尋 / 篩選
      </Button>
    </Box>
  )
}
