const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function buildUrl(path, query) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  const url = new URL(`${base}${normalized}`, window.location.origin)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }

  if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
    return url.toString()
  }
  return `${base}${normalized}${url.search}`
}

export async function apiRequest(path, { method = 'GET', token, body, query } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = await response.json().catch(() => ({
    success: false,
    error: { code: 'INVALID_RESPONSE', message: 'Invalid server response' },
  }))

  if (!response.ok || !payload.success) {
    const error = new Error(payload?.error?.message || 'Request failed')
    error.code = payload?.error?.code || 'REQUEST_FAILED'
    error.status = response.status
    throw error
  }

  return payload
}

