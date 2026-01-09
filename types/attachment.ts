// Attachment types
import type { User } from './auth'

export interface Attachment {
  id: number
  request_id: number
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  uploaded_by: number
  created_at: string
  updated_at: string

  // Relationships
  uploader?: User
}

export interface UploadProgress {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
  attachment?: Attachment
}
