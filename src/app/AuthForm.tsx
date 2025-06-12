'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Session } from '@supabase/supabase-js'

interface AuthFormProps {
  isLogin: boolean
  setIsLogin: (b: boolean) => void
  onAuthSuccess: (session: Session) => void
  setError: (msg: string | null) => void
}

export default function AuthForm({
  isLogin,
  setIsLogin,
  onAuthSuccess,
  setError
}: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const validateInputs = () => {
    if (!email || !password) {
      setError('Email and password are required.')
      return false
    }
    return true
  }

  const performAuth = async () => {
    return isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
  }

  const handleAuth = async () => {
    setError(null)
    if (!validateInputs()) return

    setLoading(true)
    const { error, data } = await performAuth()

    if (error || !data.session) {
      setError(error?.message || 'Authentication failed.')
    } else {
      onAuthSuccess(data.session)
    }

    setLoading(false)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleAuth()
  }

  const buttonClass =
    'w-full bg-blue-600 border-2 border-purple-600 text-white py-2 rounded hover:bg-blue-700 transition'

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">
        {isLogin ? 'Log In' : 'Sign Up'}
      </h1>
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 w-full max-w-xs">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button type="submit" className={buttonClass} disabled={loading}>
          {loading ? 'Loading...' : isLogin ? 'Log In' : 'Sign Up'}
        </button>
        <p className="text-sm text-center">
          {isLogin ? 'No account?' : 'Already have an account?'}{' '}
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </form>
    </div>
  )
}
