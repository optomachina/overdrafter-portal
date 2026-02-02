'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, signOut, getUser } from '@/lib/auth'

interface Project {
  id: string
  name: string
  status: string
  description: string | null
  created_at: string
  file_count?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string | undefined } | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [newProjectName, setNewProjectName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadUser()
    loadProjects()
  }, [])

  const loadUser = async () => {
    try {
      const user = await getUser()
      setUser({ email: user?.email })
    } catch (err) {
      console.error('Failed to load user:', err)
    }
  }

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      console.error('Failed to load projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) return

    setCreating(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: newProjectName,
          customer_id: (await getUser())?.id,
        })
        .select()
        .single()

      if (error) throw error

      setProjects([data, ...projects])
      setNewProjectName('')
    } catch (err) {
      console.error('Failed to create project:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Overdrafter</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Create Project */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
          <form onSubmit={handleCreateProject} className="flex gap-4">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name (e.g., LSST Mount Redesign)"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={creating || !newProjectName.trim()}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700
                         rounded-lg font-semibold transition-colors"
            >
              {creating ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </div>

        {/* Projects List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Projects</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl animate-spin mb-4">⏳</div>
              <p className="text-gray-400">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
              <div className="text-5xl mb-4">📁</div>
              <p className="text-gray-400 mb-2">No projects yet</p>
              <p className="text-sm text-gray-500">
                Create your first project above to start uploading files
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => router.push(`/project/${project.id}`)}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 
                             hover:border-green-500 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{project.name}</h3>
                      <p className="text-sm text-gray-400">
                        Created {formatDate(project.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${project.status === 'active' ? 'bg-green-900/50 text-green-400' : 
                          project.status === 'completed' ? 'bg-blue-900/50 text-blue-400' : 
                          'bg-gray-700 text-gray-400'}
                      `}>
                        {project.status}
                      </span>
                      <span className="text-gray-500">→</span>
                    </div>
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