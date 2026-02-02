'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/auth'
import FileUploadZone from '@/components/FileUploadZone'

interface Project {
  id: string
  name: string
  status: string
  created_at: string
}

interface FileItem {
  id: string
  filename: string
  file_type: string
  size_bytes: number
  version: number
  created_at: string
  expires_at: string | null
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [user, setUser] = useState<{ id: string; tier: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    loadUser()
    loadProject()
    loadFiles()
  }, [projectId])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Get tier from customers table
      const { data } = await supabase
        .from('customers')
        .select('tier')
        .eq('id', user.id)
        .single()
      
      setUser({
        id: user.id,
        tier: data?.tier || 'free'
      })
    }
  }

  const loadProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) throw error
      setProject(data)
    } catch (err) {
      console.error('Failed to load project:', err)
      router.push('/dashboard')
    }
  }

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFiles(data || [])
    } finally {
      setLoading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'sldprt': return '📐'
      case 'sldasm': return '🔧'
      case 'slddrw': return '📄'
      case 'step': return '📦'
      case 'pdf': return '📑'
      default: return '📎'
    }
  }

  if (loading || !project) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-4xl animate-spin">⏳</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <button 
              onClick={() => router.push('/dashboard')}
              className="hover:text-white"
            >
              Dashboard
            </button>
            <span>→</span>
            <span className="text-white">{project.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium"
            >
              {showUpload ? 'Hide Upload' : 'Upload Files'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Upload Section */}
        {showUpload && user && (
          <div className="mb-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Upload Files</h2>
            <FileUploadZone
              projectId={projectId}
              userId={user.id}
              tier={user.tier as 'free' | 'part-time' | 'full-time' | 'team'}
              onUploadComplete={() => {
                loadFiles()
                setShowUpload(false)
              }}
              redirectOnComplete={false}
            />
          </div>
        )}

        {/* Files List */}
        <div>
          <h2 className="text-xl font-bold mb-4">
            Files ({files.length})
          </h2>

          {files.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
              <div className="text-5xl mb-4">📂</div>
              <p className="text-gray-400 mb-2">No files yet</p>
              <button
                onClick={() => setShowUpload(true)}
                className="text-green-500 hover:underline"
              >
                Upload your first file
              </button>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              {files.map((file, index) => (
                <div
                  key={file.id}
                  className={`p-4 flex items-center gap-4 hover:bg-gray-700 transition-colors
                    ${index !== files.length - 1 ? 'border-b border-gray-700' : ''}`}
                >
                  <div className="text-2xl">{getFileIcon(file.file_type)}</div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.filename}</p>
                    <p className="text-sm text-gray-400">
                      {formatSize(file.size_bytes)} • Version {file.version}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {formatDate(file.created_at)}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-white">
                      ⬇️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}