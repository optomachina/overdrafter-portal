export interface User {
  id: string
  email: string
  tier: 'free' | 'part-time' | 'full-time' | 'team'
  createdAt: string
}

export interface Project {
  id: string
  name: string
  customerId: string
  status: 'active' | 'completed' | 'archived'
  createdAt: string
}

export interface FileUpload {
  id: string
  projectId: string
  filename: string
  fileType: 'sldprt' | 'sldasm' | 'slddrw' | 'step' | 'pdf'
  sizeBytes: number
  storagePath: string
  version: number
  createdAt: string
  expiresAt?: string // for free tier
}

export interface UploadResult {
  success: boolean
  fileId?: string
  uploadUrl?: string
  error?: string
}