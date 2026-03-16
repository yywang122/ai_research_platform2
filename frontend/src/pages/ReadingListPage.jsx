import { useEffect } from 'react'
import {
  Alert,
  Card,
  CardContent,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import AuthGuard from '../components/auth/AuthGuard'
import LoadingState from '../components/common/LoadingState'
import ErrorAlert from '../components/common/ErrorAlert'
import ReadingListActions from '../components/library/ReadingListActions'
import { useLibrary } from '../contexts/LibraryContext'

const statuses = ['unread', 'reading', 'done']

export default function ReadingListPage() {
  const {
    readingList,
    loading,
    error,
    loadReadingList,
    patchReadingItem,
    deleteReadingItem,
  } = useLibrary()

  useEffect(() => {
    loadReadingList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthGuard>
      <Stack spacing={2}>
        <Typography variant="h5">閱讀清單</Typography>
        <ErrorAlert message={error} />
        {loading && <LoadingState label="載入閱讀清單中..." />}

        {!loading && readingList.length === 0 && <Alert severity="info">尚無閱讀清單項目</Alert>}

        {!loading && readingList.length > 0 && (
          <Card>
            <CardContent>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>狀態</TableCell>
                    <TableCell>優先度</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {readingList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={item.status}
                          onChange={(e) => patchReadingItem(item.id, { status: e.target.value })}
                        >
                          {statuses.map((status) => (
                            <MenuItem key={status} value={status}>
                              {status}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>{item.priority}</TableCell>
                      <TableCell>
                        <ReadingListActions onRemove={() => deleteReadingItem(item.id)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </Stack>
    </AuthGuard>
  )
}

