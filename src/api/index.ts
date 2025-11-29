const API_BASE = 'http://localhost:8080'

// ==================== TYPES ====================

export interface WoodDatabase {
  id: string
  title: string
  size: number
  description: string
  image: string
}

export interface WoodPiece {
  id: string
  database_id: string
  name: string
  description: string
  image_urls: string[]
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export interface PaginationParams {
  limit?: number
  offset?: number
  order_by?: string
  desc?: boolean
}

// ==================== WOOD DATABASE (Collections) ====================

// Get all collections with pagination
export async function getCollections(params?: PaginationParams): Promise<PaginatedResult<WoodDatabase>> {
  const searchParams = new URLSearchParams()
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.offset) searchParams.set('offset', params.offset.toString())
  if (params?.order_by) searchParams.set('order_by', params.order_by)
  if (params?.desc) searchParams.set('desc', 'true')

    console.log("Call api...")

  const res = await fetch(`${API_BASE}/library-api/database/list?${searchParams}`)
  if (!res.ok) throw new Error('Failed to fetch collections')
  return res.json()
}

// Get single collection
export async function getCollection(id: string): Promise<WoodDatabase> {
  const res = await fetch(`${API_BASE}/library-api/database/get?id=${id}`)
  if (!res.ok) throw new Error('Failed to fetch collection')
  return res.json()
}

// Create new collection
export async function createCollection(data: WoodDatabase): Promise<WoodDatabase> {
  const res = await fetch(`${API_BASE}/library-api/database/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to create collection')
  }
  const result = await res.json()
  return result.data
}

// Update collection
export async function updateCollection(id: string, data: WoodDatabase): Promise<WoodDatabase> {
  const res = await fetch(`${API_BASE}/library-api/database/update/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to update collection')
  }
  const result = await res.json()
  return result.data
}

// Delete collection
export async function deleteCollection(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/library-api/database/delete?id=${id}`, {
    method: 'DELETE'
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to delete collection')
  }
}

// ==================== WOOD PIECES ====================

// Get pieces by database ID with pagination
export async function getPiecesByDatabase(
  databaseId: string,
  params?: PaginationParams
): Promise<PaginatedResult<WoodPiece>> {
  const searchParams = new URLSearchParams()
  searchParams.set('database_id', databaseId)
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.offset) searchParams.set('offset', params.offset.toString())
  if (params?.order_by) searchParams.set('order_by', params.order_by)
  if (params?.desc) searchParams.set('desc', 'true')

  const res = await fetch(`${API_BASE}/library-api/piece/list?${searchParams}`)
  if (!res.ok) throw new Error('Failed to fetch pieces')
  return res.json()
}

// Get single piece
export async function getPiece(id: string): Promise<WoodPiece> {
  const res = await fetch(`${API_BASE}/library-api/piece/get?id=${id}`)
  if (!res.ok) throw new Error('Failed to fetch piece')
  return res.json()
}

// Create new piece
export async function createPiece(data: WoodPiece): Promise<WoodPiece> {
    console.log(data)
  const res = await fetch(`${API_BASE}/library-api/piece/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const error = await res.json()
    console.log(error)
    throw new Error(error.error || 'Failed to create piece')
  }
  const result = await res.json()
  return result.data
}

// Update piece
export async function updatePiece(id: string, data: WoodPiece): Promise<WoodPiece> {
    console.log(data)
  const res = await fetch(`${API_BASE}/library-api/piece/update/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const error = await res.json()
    console.error(error)
    throw new Error(error.error || 'Failed to update piece')
  }
  const result = await res.json()
  return result.data
}

// Delete piece
export async function deletePiece(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/library-api/piece/delete?id=${id}`, {
    method: 'DELETE'
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to delete piece')
  }
}

// ==================== UPLOAD IMAGE ====================

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/library-api/upload_image`, {
    method: 'POST',
    body: formData
  })

  if (!res.ok) throw new Error('Failed to upload image')
  const data = await res.json()
  return data.url
}