'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/auth'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code')
      
      if (!code) {
        setError('Invalid or expired magic link')
        return
      }

      try {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (exchangeError) {
          throw exchangeError
        }

        // Create customer record if new user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { error: upsertError } = await supabase
            .from('customers')
            .upsert({
              id: user.id,
              email: user.email,
              tier: 'free', // Default tier
            }, { onConflict: 'id' })
          
          if (upsertError) {
            console.error('Failed to create customer record:', upsertError)
          }
        }

        // Redirect to dashboard
        router.push('/dashboard')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed')
      }
    }

    handleAuth()
  }, [router, searchParams])

  if (error) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Authentication Failed</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <a 
            href="/login" 
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg"
          >
            Try Again
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-spin">⏳</div>
        <h1 className="text-2xl font-bold mb-2">Signing you in...</h1>
        <p className="text-gray-400">Just a moment</p>
      </div>
    </main>
  )
}