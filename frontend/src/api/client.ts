const API_BASE = import.meta.env.VITE_API_URL || ''

export type User = {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'VOTER'
  status: string
  walletAddress?: string | null
  phone?: string | null
  isVerified?: boolean
  createdAt?: string
  updatedAt?: string
}

function getToken(): string | null {
  return localStorage.getItem('blockvote_token')
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token = getToken(), ...rest } = options
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...((rest.headers as Record<string, string>) || {}),
  }
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || res.statusText || 'Request failed')
  return data as T
}

export const authApi = {
  register(body: { name: string; email: string; password: string; phone?: string }) {
    return api<{ message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  verifyEmail(token: string) {
    return api<{ message: string }>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
  },

  login(body: { email: string; password: string }) {
    return api<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  me() {
    return api<User>('/api/auth/me', { token: getToken() })
  },

  updateWallet(walletAddress: string) {
    return api<User>('/api/auth/wallet', {
      method: 'PATCH',
      body: JSON.stringify({ walletAddress }),
      token: getToken(),
    })
  },

  updateProfile(body: { name?: string; phone?: string | null }) {
    return api<User>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(body),
      token: getToken(),
    })
  },

  deleteAccount() {
    return api<{ message: string }>('/api/auth/account', {
      method: 'DELETE',
      token: getToken(),
    })
  },
}

export type UsersListResponse = {
  users: User[]
  total: number
  page: number
  limit: number
}

export const usersApi = {
  getUsers(params?: { status?: string; search?: string; page?: number; limit?: number }) {
    const sp = new URLSearchParams()
    if (params?.status) sp.set('status', params.status)
    if (params?.search) sp.set('search', params.search)
    if (params?.page != null) sp.set('page', String(params.page))
    if (params?.limit != null) sp.set('limit', String(params.limit))
    const qs = sp.toString()
    return api<UsersListResponse>(`/api/users${qs ? `?${qs}` : ''}`, { token: getToken() })
  },

  approveUser(id: string) {
    return api<{ message: string }>(`/api/users/${id}/approve`, {
      method: 'PATCH',
      token: getToken(),
    })
  },

  rejectUser(id: string) {
    return api<{ message: string }>(`/api/users/${id}/reject`, {
      method: 'PATCH',
      token: getToken(),
    })
  },

  revokeUser(id: string) {
    return api<{ message: string }>(`/api/users/${id}/revoke`, {
      method: 'PATCH',
      token: getToken(),
    })
  },

  deleteUser(id: string) {
    return api<{ message: string }>(`/api/users/${id}`, {
      method: 'DELETE',
      token: getToken(),
    })
  },
}

export type ElectionStatus = 'UPCOMING' | 'ACTIVE' | 'CLOSED' | 'PAUSED'

export type ElectionListItem = {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: ElectionStatus
  contractElectionId?: number | null
  createdAt?: string
  updatedAt?: string
  candidateCount: number
}

export type Candidate = {
  id: string
  name: string
  description?: string | null
  electionId: string
  contractCandidateId?: number | null
  createdAt?: string
}

export type ElectionDetail = ElectionListItem & {
  candidates: Candidate[]
}

export const electionsApi = {
  getList(params?: { status?: string }) {
    const sp = new URLSearchParams()
    if (params?.status) sp.set('status', params.status)
    const qs = sp.toString()
    return api<ElectionListItem[]>(`/api/elections${qs ? `?${qs}` : ''}`)
  },

  getById(id: string) {
    return api<ElectionDetail>(`/api/elections/${id}`)
  },

  create(body: { title: string; description: string; startDate: string; endDate: string }) {
    return api<ElectionListItem & { candidateCount: number }>('/api/elections', {
      method: 'POST',
      body: JSON.stringify(body),
      token: getToken(),
    })
  },
}

export const candidatesApi = {
  getList(electionId: string) {
    return api<Candidate[]>(`/api/elections/${electionId}/candidates`)
  },

  create(electionId: string, body: { name: string; description?: string }) {
    return api<Candidate>(`/api/elections/${electionId}/candidates`, {
      method: 'POST',
      body: JSON.stringify(body),
      token: getToken(),
    })
  },
}
