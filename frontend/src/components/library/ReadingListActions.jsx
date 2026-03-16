import { Button, Stack } from '@mui/material'

export default function ReadingListActions({ onAdd, onUpdateStatus, onRemove }) {
  return (
    <Stack direction="row" spacing={1}>
      {onAdd && (
        <Button size="small" onClick={onAdd}>
          加入閱讀清單
        </Button>
      )}
      {onUpdateStatus && (
        <Button size="small" onClick={onUpdateStatus}>
          更新狀態
        </Button>
      )}
      {onRemove && (
        <Button size="small" color="error" onClick={onRemove}>
          移除
        </Button>
      )}
    </Stack>
  )
}

