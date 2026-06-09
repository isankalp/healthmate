export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (response.status === 401) {
    const body = await response.json().catch(() => ({} as any))
    if (body.error === 'token_expired' || body.error === 'invalid_token') {
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      if (refreshResponse.ok) {
        const refreshed = await refreshResponse.json()
        if (refreshed.success && refreshed.data?.token) {
          localStorage.setItem('token', refreshed.data.token)
          headers.set('Authorization', `Bearer ${refreshed.data.token}`)
          return fetch(`/api${path}`, {
            ...options,
            headers,
            credentials: 'include',
          })
        }
      }
    }
  }

  return response
}
