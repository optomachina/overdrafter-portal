import FileUploadZone from '@/components/FileUploadZone'

export default function UploadPage() {
  // TODO: Get from auth context
  const mockUser = {
    id: 'user-123',
    tier: 'free' as const,
  }
  
  const mockProject = {
    id: 'project-456',
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Upload Files</h1>
        <p className="text-gray-400 mb-8">
          Project: {mockProject.id}
        </p>
        
        <FileUploadZone
          projectId={mockProject.id}
          userId={mockUser.id}
          tier={mockUser.tier}
          onUploadComplete={(fileId) => {
            console.log('Upload complete:', fileId)
          }}
        />
      </div>
    </main>
  )
}