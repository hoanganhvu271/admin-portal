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
