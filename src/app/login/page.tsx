import MagicLinkForm from '@/components/MagicLinkForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Overdrafter</h1>
          <p className="text-gray-400">Sign in to access your projects</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <MagicLinkForm />
        </div>
        
        <p className="text-center text-sm text-gray-500 mt-6">
          New customer?{' '}
          <a href="mailto:blaine@overdrafter.com" className="text-green-500 hover:underline">
            Contact us to get started
          </a>
        </p>
      </div>
    </main>
  )
}