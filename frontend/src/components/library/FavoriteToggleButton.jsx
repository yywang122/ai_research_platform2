import { Button } from '@mui/material'

export default function FavoriteToggleButton({ active, onClick }) {
  return (
    <Button size="small" variant={active ? 'outlined' : 'contained'} onClick={onClick}>
      {active ? '取消收藏' : '加入收藏'}
    </Button>
  )
}

