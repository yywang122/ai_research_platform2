import { apiRequest } from './apiClient'

export function fetchFavorites(token) {
  return apiRequest('/favorites', { token })
}

export function addFavorite(token, paperId) {
  return apiRequest('/favorites', {
    method: 'POST',
    token,
    body: { paper_id: paperId },
  })
}

export function removeFavorite(token, paperId) {
  return apiRequest(`/favorites/${paperId}`, {
    method: 'DELETE',
    token,
  })
}

