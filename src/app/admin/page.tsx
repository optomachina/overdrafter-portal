'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/auth'

interface Worker {
  id: string
  email: string
  bio: string | null
  skills: string[] | null
  availability_status: string
  max_projects: number
  current_projects?: number
}

interface Project {
  id: string
  name: string
  customer_id: string
  status: string
  created_at: string
  customer_email?: string
}

interface Assignment {
  id: string
  project_id: string
  worker_id: string
  status: string
  worker_email?: string
  project_name?: string
}

export default function AdminDashboard() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedWorker, setSelectedWorker] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load workers
      const { data: workersData } = await supabase
        .from('workers')
        .select('*, customers(email)')
      
      if (workersData) {
        setWorkers(workersData.map((w: any) => ({
          ...w,
          email: w.customers?.email
        })))
      }

      // Load projects with customer emails
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*, customers(email)')
        .eq('status', 'active')
      
      if (projectsData) {
        setProjects(projectsData.map((p: any) => ({
          ...p,
          customer_email: p.customers?.email
        })))
      }

      // Load assignments
      const { data: assignmentsData } = await supabase
        .from('project_assignments')
        .select('*, workers(customers(email)), projects(name)')
      
      if (assignmentsData) {
        setAssignments(assignmentsData.map((a: any) => ({
          ...a,
          worker_email: a.workers?.customers?.email,
          project_name: a.projects?.name
        })))
      }
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject || !selectedWorker) return

    try {
      const { error } = await supabase
        .from('project_assignments')
        .insert({
          project_id: selectedProject,
          worker_id: selectedWorker,
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
          status: 'assigned'
        })

      if (error) throw error

      // Reset form
      setSelectedProject('')
      setSelectedWorker('')
      
      // Reload data
      loadData()
    } catch (err) {
      console.error('Failed to assign:', err)
      alert('Failed to assign worker to project')
    }
  }

  const unassignedProjects = projects.filter(
    p => !assignments.some(a => a.project_id === p.id)
  )

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-4xl animate-spin">⏳</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Assign Worker Form */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-bold mb-4">Assign Worker to Project</h2>
          
          <form onSubmit={handleAssign} className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                required
              >
                <option value="">Select project...</option>
                {unassignedProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.customer_email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Worker</label>
              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                required
              >
                <option value="">Select worker...</option>
                {workers
                  .filter(w => w.availability_status === 'available')
                  .map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.email} ({worker.skills?.join(', ')})
                    </option>
                  ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold"
            >
              Assign
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Workers */}
          <div>
            <h2 className="text-xl font-bold mb-4">Workers ({workers.length})</h2>
            <div className="space-y-3">
              {workers.map((worker) => (
                <div
                  key={worker.id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{worker.email}</span>
                    <span className={`
                      px-2 py-1 rounded text-xs
                      ${worker.availability_status === 'available' ? 'bg-green-900/50 text-green-400' : 
                        worker.availability_status === 'busy' ? 'bg-yellow-900/50 text-yellow-400' :
                        'bg-red-900/50 text-red-400'}
                    `}>
                      {worker.availability_status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Skills: {worker.skills?.join(', ') || 'None listed'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Assignments */}
          <div>
            <h2 className="text-xl font-bold mb-4">Active Assignments ({assignments.length})</h2>
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                >
                  <p className="font-medium">{assignment.project_name}</p>
                  <p className="text-sm text-gray-400">
                    Assigned to: {assignment.worker_email}
                  </p>
                  <span className={`
                    inline-block mt-2 px-2 py-1 rounded text-xs
                    ${assignment.status === 'completed' ? 'bg-green-900/50 text-green-400' : 
                      assignment.status === 'in_progress' ? 'bg-blue-900/50 text-blue-400' :
                      'bg-gray-700 text-gray-400'}
                  `}>
                    {assignment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}