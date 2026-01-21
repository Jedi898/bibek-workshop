'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [view, setView] = useState<'sign_in' | 'sign_up' | 'forgot_password'>('sign_in')
  const [rememberMe, setRememberMe] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (email === 'bibekbhatta.info@gmail.com' && password === '%%Bibek%9818%%') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          })
          if (signUpError) throw signUpError
          if (data.user && !data.session) alert('Super admin created. Please verify email.')
        }
        return
      }

      if (view === 'sign_up') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        alert('Check your email for the login link!')
      } else if (view === 'sign_in') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else if (view === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        })
        if (error) throw error
        alert('Check your email for the password reset link!')
        setView('sign_in')
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="p-8 bg-gray-800 rounded-lg shadow-md w-96 border border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">
          {view === 'sign_up' ? 'Sign Up' : view === 'forgot_password' ? 'Reset Password' : 'Sign In'}
        </h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border placeholder-gray-400"
              required
            />
          </div>
          {view !== 'forgot_password' && (
            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border placeholder-gray-400"
                required
              />
            </div>
          )}
          {view === 'sign_in' && (
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded bg-gray-700 border-gray-600"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : view === 'sign_up' ? 'Sign Up' : view === 'forgot_password' ? 'Send Reset Link' : 'Sign In'}
          </button>
        </form>
        <div className="mt-4 text-center space-y-2">
          {view === 'sign_in' && (
            <>
              <button
                onClick={() => setView('sign_up')}
                className="text-sm text-blue-400 hover:text-blue-300 block w-full"
              >
                Don't have an account? Sign Up
              </button>
              <button
                onClick={() => setView('forgot_password')}
                className="text-sm text-gray-400 hover:text-gray-300 block w-full"
              >
                Forgot Password?
              </button>
            </>
          )}
          {view === 'sign_up' && (
            <button
              onClick={() => setView('sign_in')}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Already have an account? Sign In
            </button>
          )}
          {view === 'forgot_password' && (
            <button
              onClick={() => setView('sign_in')}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  )
}