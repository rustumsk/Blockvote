const API_BASE = import.meta.env.VITE_API_URL || ''

export type User = {
  id: string
  name: string
  email: string
  role: 'SUPERADMIN' | 'ADMIN' | 'VOTER'
  status: string
  walletAddress?: string | null
  phone?: string | null
  isVerified?: boolean
  canCreateGlobalElections?: boolean
  createdAt?: string
  updatedAt?: string
  organizationId?: string | null
  organization?: { id: string; name: string } | null
}

export type Organization = {
  id: string
  name: string
  createdAt?: string
}

export type WalletRegistrationStatus = {
  walletAddress: string
  isRegistered: boolean
  isVerified?: boolean
  status?: string
  maskedEmail?: string
}

function getToken(): string | null {
  return localStorage.getItem('blockvote_token')
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token = getToken(), ...rest } = options
  const isFormData = typeof FormData !== 'undefined' && rest.body instanceof FormData
  const headers: HeadersInit = {
    ...((rest.headers as Record<string, string>) || {}),
  }
  if (!isFormData) {
    ;(headers as Record<string, string>)['Content-Type'] = 'application/json'
  }
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || res.statusText || 'Request failed')
  return data as T
}

export const authApi = {
  register(body: { name: string; email: string; password: string; phone?: string; walletAddress: string; organizationId: string }) {
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

  requestWalletLoginNonce(walletAddress: string) {
    return api<{ walletAddress: string; message: string }>('/api/auth/wallet/nonce', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    })
  },

  getWalletStatus(walletAddress: string) {
    return api<WalletRegistrationStatus>(
      `/api/auth/wallet/status?walletAddress=${encodeURIComponent(walletAddress)}`
    )
  },

  loginWithWallet(body: { walletAddress: string; signature: string }) {
    return api<{ token: string; user: User }>('/api/auth/wallet/login', {
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

  assignRoleScope(
    id: string,
    body: { role: 'ADMIN' | 'VOTER'; organizationId?: string; canCreateGlobalElections?: boolean }
  ) {
    return api<{ message: string }>(`/api/users/${id}/role-scope`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      token: getToken(),
    })
  },
}

export type ElectionStatus = 'UPCOMING' | 'ACTIVE' | 'CLOSED' | 'PAUSED'

export type ElectionListItem = {
  id: string
  title: string
  description: string
  scope: 'GLOBAL' | 'ORGANIZATION'
  organizationId?: string | null
  organization?: { id: string; name: string } | null
  startDate: string
  endDate: string
  status: ElectionStatus
  contractElectionId?: number | null
  resultsPublished?: boolean
  resultsPublishedAt?: string | null
  createdAt?: string
  updatedAt?: string
  candidateCount: number
}

export type Candidate = {
  id: string
  name: string
  description?: string | null
  credentials?: string | null
  photoUrl?: string | null
  electionId: string
  contractCandidateId?: number | null
  createdAt?: string
}

export function getCandidatePhotoSrc(candidate: Pick<Candidate, 'id' | 'electionId' | 'photoUrl'>) {
  if (!candidate.photoUrl) return null
  return `${API_BASE}/api/elections/${candidate.electionId}/candidates/${candidate.id}/photo`
}

export type ElectionDetail = ElectionListItem & {
  candidates: Candidate[]
}

export type ElectionResults = {
  candidates: { candidateId: string; name: string; voteCount: number }[]
  winner: { candidateId: string; name: string; voteCount: number } | null
  totalVotes: number
  published: boolean
  publishedAt: string | null
  statistics: {
    candidateCount: number
    approvedVoterCount: number
    turnoutPercentage: number
  }
}

export const electionsApi = {
  getList(params?: { status?: string; scope?: 'GLOBAL' | 'ORGANIZATION' }) {
    const sp = new URLSearchParams()
    if (params?.status) sp.set('status', params.status)
    if (params?.scope) sp.set('scope', params.scope)
    const qs = sp.toString()
    return api<ElectionListItem[]>(`/api/elections${qs ? `?${qs}` : ''}`)
  },

  getMyList(params?: { status?: string }) {
    const sp = new URLSearchParams()
    if (params?.status) sp.set('status', params.status)
    const qs = sp.toString()
    return api<ElectionListItem[]>(`/api/elections/mine${qs ? `?${qs}` : ''}`, { token: getToken() })
  },

  getManageList(params?: { status?: string }) {
    const sp = new URLSearchParams()
    if (params?.status) sp.set('status', params.status)
    const qs = sp.toString()
    return api<ElectionListItem[]>(`/api/elections/manage${qs ? `?${qs}` : ''}`, { token: getToken() })
  },

  getById(id: string) {
    return api<ElectionDetail>(`/api/elections/${id}`)
  },

  create(body: { title: string; description: string; startDate: string; endDate: string; scope?: 'GLOBAL' | 'ORGANIZATION'; organizationId?: string }) {
    return api<ElectionListItem & { candidateCount: number }>('/api/elections', {
      method: 'POST',
      body: JSON.stringify(body),
      token: getToken(),
    })
  },

  delete(id: string) {
    return api<{ message: string }>(`/api/elections/${id}`, {
      method: 'DELETE',
      token: getToken(),
    })
  },

  syncContractIds(id: string) {
    return api<{ message: string; contractElectionId: number; syncedCandidates: number }>(`/api/elections/${id}/sync-contract`, {
      method: 'POST',
      token: getToken(),
    })
  },
}

export const organizationsApi = {
  list() {
    return api<Organization[]>('/api/organizations')
  },
  create(name: string) {
    return api<Organization>('/api/organizations', {
      method: 'POST',
      body: JSON.stringify({ name }),
      token: getToken(),
    })
  },
}

export const candidatesApi = {
  getList(electionId: string) {
    return api<Candidate[]>(`/api/elections/${electionId}/candidates`)
  },

  create(
    electionId: string,
    body: { name: string; description?: string; credentials?: string; photo?: File | null }
  ) {
    const formData = new FormData()
    formData.append('name', body.name)
    if (body.description) formData.append('description', body.description)
    if (body.credentials) formData.append('credentials', body.credentials)
    if (body.photo) formData.append('photo', body.photo)

    return api<Candidate>(`/api/elections/${electionId}/candidates`, {
      method: 'POST',
      body: formData,
      token: getToken(),
    })
  },
}

export const votesApi = {
  recordVote(body: { electionId: string; candidateId: string; txHash: string }) {
    return api<{
      message: string
      txHash: string
      election: { id: string; title: string }
      candidate: { id: string; name: string }
      wallet?: string | null
    }>('/api/votes', {
      method: 'POST',
      body: JSON.stringify(body),
      token: getToken(),
    })
  },

  myVotes() {
    return api<
      {
        id: string
        txHash: string
        createdAt: string
        election: { id: string; title: string }
        candidate: { id: string; name: string }
      }[]
    >('/api/votes/my', { token: getToken() })
  },

  verify(txHash: string) {
    return api<{
      verified: boolean
      vote: {
        election: { id: string; title: string }
        candidate: { id: string; name: string }
        user: { walletAddress: string | null }
        createdAt: string
        txHash: string
      }
      receipt: unknown
    }>(`/api/votes/verify/${encodeURIComponent(txHash)}`)
  },
}

export const resultsApi = {
  getElectionResults(electionId: string) {
    return api<ElectionResults>(`/api/results/${electionId}`)
  },

  getElectionLogs(electionId: string) {
    return api<
      {
        id: string
        txHash: string
        candidateId: string
        timestamp: string
      }[]
    >(`/api/results/${electionId}/logs`, { token: getToken() })
  },

  publishElectionResults(electionId: string) {
    return api<{ message: string; results: ElectionResults }>(`/api/results/${electionId}/publish`, {
      method: 'POST',
      token: getToken(),
    })
  },
}
