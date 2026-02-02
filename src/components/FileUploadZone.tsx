'use client'

import { useState, useCallback } from 'react'
import { validateUpload } from '@/lib/upload'

interface FileUploadZoneProps {
  projectId: string
  userId: string
  tier: 'free' | 'part-time' | 'full-time' | 'team'
  onUploadComplete?: (fileId: string) => void
}

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
}

export default function FileUploadZone({
  projectId,
  userId,
  tier,
  onUploadComplete,
}: FileUploadZoneProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }

  const handleFiles = async (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map(file => ({
      file,
      id: crypto.randomUUID(),
      progress: 0,
      status: 'pending',
    }))

    setFiles(prev => [...prev, ...uploadFiles])

    // Process each file
    for (const uploadFile of uploadFiles) {
      await uploadFileToServer(uploadFile)
    }
  }

  const uploadFileToServer = async (uploadFile: UploadFile) => {
    // Validate
    const validation = validateUpload(uploadFile.file, tier)
    if (!validation.valid) {
      updateFileStatus(uploadFile.id, 'error', validation.error)
      return
    }

    updateFileStatus(uploadFile.id, 'uploading')

    try {
      // Get presigned URL
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: uploadFile.file.name,
          size: uploadFile.file.size,
          projectId,
          userId,
          tier,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to get upload URL')
      }

      const { uploadUrl, fileId, expiresAt } = await response.json()

      // Upload to R2
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          updateFileProgress(uploadFile.id, progress)
        }
      })

      await new Promise((resolve, reject) => {
        xhr.addEventListener('load', resolve)
        xhr.addEventListener('error', reject)
        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', uploadFile.file.type)
        xhr.send(uploadFile.file)
      })

      updateFileStatus(uploadFile.id, 'complete')
      onUploadComplete?.(fileId)

    } catch (error) {
      updateFileStatus(uploadFile.id, 'error', error instanceof Error ? error.message : 'Upload failed')
    }
  }

  const updateFileProgress = (id: string, progress: number) => {
    setFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, progress } : f))
    )
  }

  const updateFileStatus = (id: string, status: UploadFile['status'], error?: string) => {
    setFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, status, error } : f))
    )
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${isDragging 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-600 hover:border-gray-500'
          }
        `}
      >
        <div className="text-4xl mb-4">📎</div>
        <p className="text-lg mb-2">
          Drop CAD files here, or{' '}
          <label className="text-green-500 cursor-pointer hover:underline">
            browse
            <input
              type="file"
              multiple
              accept=".sldprt,.sldasm,.slddrw,.step,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </p>
        <p className="text-sm text-gray-400">
          Supported: .sldprt, .sldasm, .slddrw, .step, .pdf
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Max size: {tier === 'free' ? '100MB' : '500MB'}
        </p>
      </div>

      {/* Free Tier Warning */}
      {tier === 'free' && (
        <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-200">
            ⚠️ Free tier: Files auto-deleted after 30 days.
            {' '}
            <a href="/pricing" className="underline hover:text-yellow-100">
              Upgrade for permanent storage
            </a>
          </p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-gray-800 rounded-lg p-4 flex items-center gap-4"
            >
              <div className="text-2xl">
                {file.status === 'complete' ? '✅' : 
                 file.status === 'error' ? '❌' : 
                 file.status === 'uploading' ? '⬆️' : '📄'}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{file.file.name}</p>
                <p className="text-sm text-gray-400">
                  {formatSize(file.file.size)}
                </p>
                
                {file.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {file.progress}%
                    </p>
                  </div>
                )}
                
                {file.error && (
                  <p className="text-sm text-red-400 mt-1">{file.error}</p>
                )}
              </div>
              
              <button
                onClick={() => removeFile(file.id)}
                className="text-gray-400 hover:text-white p-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}