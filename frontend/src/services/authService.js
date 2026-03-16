import { apiRequest } from './apiClient'

export function register(payload) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: payload,
  })
}

export function login(payload) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: payload,
  })
}

export function me(token) {
  return apiRequest('/auth/me', {
    token,
  })
}

