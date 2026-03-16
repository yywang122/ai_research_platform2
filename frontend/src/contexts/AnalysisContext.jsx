import { createContext, useContext, useMemo, useState } from 'react'
import {
  getAnalyzeByPaper,
  getAnalyzeHistory,
  submitAnalyze,
} from '../services/analyzeService'
import { fetchRecommendations } from '../services/recommendationsService'
import { useAuth } from './AuthContext'

const AnalysisContext = createContext(null)

export function AnalysisProvider({ children }) {
  const { token, isAuthenticated } = useAuth()
  const [analysisByPaperId, setAnalysisByPaperId] = useState({})
  const [history, setHistory] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const safeRun = async (runner) => {
    setLoading(true)
    setError('')
    try {
      return await runner()
    } catch (err) {
      setError(err.message || '分析操作失敗')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const submitForPaper = async (paperId, forceRefresh = false) => {
    if (!isAuthenticated) throw new Error('請先登入後再使用 AI 分析')
    return safeRun(async () => {
      const res = await submitAnalyze(token, { paper_id: paperId, force_refresh: forceRefresh })
      setAnalysisByPaperId((prev) => ({
        ...prev,
        [paperId]: res.data,
      }))
      return res.data
    })
  }

  const loadByPaper = async (paperId) => {
    if (!isAuthenticated) throw new Error('請先登入後再讀取分析')
    return safeRun(async () => {
      const res = await getAnalyzeByPaper(token, paperId)
      setAnalysisByPaperId((prev) => ({
        ...prev,
        [paperId]: res.data,
      }))
      return res.data
    })
  }

  const loadHistory = async (query = {}) => {
    if (!isAuthenticated) return
    await safeRun(async () => {
      const res = await getAnalyzeHistory(token, query)
      setHistory(res.data || [])
    })
  }

  const loadRecommendations = async (query = {}) => {
    if (!isAuthenticated) return
    await safeRun(async () => {
      const res = await fetchRecommendations(token, query)
      setRecommendations(res.data || [])
    })
  }

  const value = useMemo(
    () => ({
      analysisByPaperId,
      history,
      recommendations,
      loading,
      error,
      submitForPaper,
      loadByPaper,
      loadHistory,
      loadRecommendations,
    }),
    [analysisByPaperId, history, recommendations, loading, error],
  )

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>
}

export function useAnalysis() {
  const context = useContext(AnalysisContext)
  if (!context) {
    throw new Error('useAnalysis must be used within AnalysisProvider')
  }
  return context
}

