import { apiRequest } from './apiClient'

export function submitAnalyze(token, payload) {
  return apiRequest('/analyze', {
    method: 'POST',
    token,
    body: payload,
  })
}

export function getAnalyzeByPaper(token, paperId) {
  return apiRequest(`/analyze/${paperId}`, {
    token,
  })
}

export function getAnalyzeHistory(token, query = {}) {
  return apiRequest('/analyze/history', {
    token,
    query,
  })
}

