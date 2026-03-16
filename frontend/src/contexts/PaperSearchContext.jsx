import { createContext, useContext, useMemo, useState } from 'react'
import { fetchPapers } from '../services/paperService'
import { useAuth } from './AuthContext'

const PaperSearchContext = createContext(null)

const defaultFilters = {
  q: '',
  year: '',
  domain: '',
  venue: '',
  page: 1,
  page_size: 10,
}

export function PaperSearchProvider({ children }) {
  const { token } = useAuth()
  const [filters, setFilters] = useState(defaultFilters)
  const [results, setResults] = useState([])
  const [meta, setMeta] = useState({ page: 1, page_size: 10, total: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const searchPapers = async (nextFilters = filters) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchPapers(nextFilters, token)
      setResults(res.data || [])
      setMeta(res.meta || { page: 1, page_size: 10, total: 0 })
      setFilters(nextFilters)
    } catch (err) {
      setError(err.message || '搜尋失敗')
    } finally {
      setLoading(false)
    }
  }

  const value = useMemo(
    () => ({
      filters,
      results,
      meta,
      loading,
      error,
      setFilters,
      searchPapers,
    }),
    [filters, results, meta, loading, error],
  )

  return <PaperSearchContext.Provider value={value}>{children}</PaperSearchContext.Provider>
}

export function usePaperSearch() {
  const context = useContext(PaperSearchContext)
  if (!context) {
    throw new Error('usePaperSearch must be used within PaperSearchProvider')
  }
  return context
}

