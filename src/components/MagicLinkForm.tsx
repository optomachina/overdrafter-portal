'use client'

import { useState } from 'react'
import { signInWithMagicLink } from '@/lib/auth'

export default function MagicLinkForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signInWithMagicLink(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center p-8">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-2xl font-bold mb-2">Check your email</h2>
        <p className="text-gray-400">
          We sent a magic link to <strong>{email}</strong>
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Click the link to sign in. No password needed.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg 
                     focus:ring-2 focus:ring-green-500 focus:border-transparent
                     text-white placeholder-gray-500"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700
                   rounded-lg font-semibold transition-colors
                   flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin">⏳</span>
            Sending...
          </>
        ) : (
          'Send Magic Link'
        )}
      </button>

      <p className="text-center text-sm text-gray-500">
        No password required. We'll email you a secure sign-in link.
      </p>
    </form>
  )
}