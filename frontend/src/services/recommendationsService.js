import { apiRequest } from './apiClient'

export function fetchRecommendations(token, query = {}) {
  return apiRequest('/recommendations', {
    token,
    query,
  })
}

