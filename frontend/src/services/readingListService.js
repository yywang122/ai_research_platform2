import { apiRequest } from './apiClient'

export function fetchReadingList(token, query = {}) {
  return apiRequest('/reading-list', {
    token,
    query,
  })
}

export function addReadingList(token, payload) {
  return apiRequest('/reading-list', {
    method: 'POST',
    token,
    body: payload,
  })
}

export function updateReadingList(token, paperId, payload) {
  return apiRequest(`/reading-list/${paperId}`, {
    method: 'PATCH',
    token,
    body: payload,
  })
}

export function removeReadingList(token, paperId) {
  return apiRequest(`/reading-list/${paperId}`, {
    method: 'DELETE',
    token,
  })
}

