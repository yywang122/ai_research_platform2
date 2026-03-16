import { apiRequest } from './apiClient'

export function fetchPapers(filters = {}, token) {
  return apiRequest('/papers', {
    query: filters,
    token,
  })
}

export function fetchPaperById(paperId, token) {
  return apiRequest(`/papers/${paperId}`, { token })
}

