import { createContext, useContext, useMemo, useState } from 'react'
import { addFavorite, fetchFavorites, removeFavorite } from '../services/favoritesService'
import {
  addReadingList,
  fetchReadingList,
  removeReadingList,
  updateReadingList,
} from '../services/readingListService'
import { useAuth } from './AuthContext'

const LibraryContext = createContext(null)

export function LibraryProvider({ children }) {
  const { token, isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [readingList, setReadingList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const safeRun = async (runner) => {
    setLoading(true)
    setError('')
    try {
      return await runner()
    } catch (err) {
      setError(err.message || '操作失敗')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const loadFavorites = async () => {
    if (!isAuthenticated) return
    await safeRun(async () => {
      const res = await fetchFavorites(token)
      setFavorites(res.data || [])
    })
  }

  const toggleFavorite = async (paperId, currentFavorite) => {
    if (!isAuthenticated) throw new Error('請先登入後再操作收藏')
    await safeRun(async () => {
      if (currentFavorite) {
        await removeFavorite(token, paperId)
      } else {
        await addFavorite(token, paperId)
      }
      const res = await fetchFavorites(token)
      setFavorites(res.data || [])
    })
  }

  const loadReadingList = async (query = {}) => {
    if (!isAuthenticated) return
    await safeRun(async () => {
      const res = await fetchReadingList(token, query)
      setReadingList(res.data || [])
    })
  }

  const addToReadingList = async (payload) => {
    if (!isAuthenticated) throw new Error('請先登入後再加入閱讀清單')
    await safeRun(async () => {
      await addReadingList(token, payload)
      const res = await fetchReadingList(token)
      setReadingList(res.data || [])
    })
  }

  const patchReadingItem = async (paperId, payload) => {
    if (!isAuthenticated) throw new Error('請先登入後再更新閱讀清單')
    await safeRun(async () => {
      await updateReadingList(token, paperId, payload)
      const res = await fetchReadingList(token)
      setReadingList(res.data || [])
    })
  }

  const deleteReadingItem = async (paperId) => {
    if (!isAuthenticated) throw new Error('請先登入後再刪除閱讀清單')
    await safeRun(async () => {
      await removeReadingList(token, paperId)
      const res = await fetchReadingList(token)
      setReadingList(res.data || [])
    })
  }

  const value = useMemo(
    () => ({
      favorites,
      readingList,
      loading,
      error,
      loadFavorites,
      toggleFavorite,
      loadReadingList,
      addToReadingList,
      patchReadingItem,
      deleteReadingItem,
    }),
    [favorites, readingList, loading, error],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const context = useContext(LibraryContext)
  if (!context) {
    throw new Error('useLibrary must be used within LibraryProvider')
  }
  return context
}

