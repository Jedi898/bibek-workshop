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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <div className="p-8 bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-white/10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>
          </div>
          <h1 className="text-3xl font-bold text-white">
          {view === 'sign_up' ? 'Sign Up' : view === 'forgot_password' ? 'Reset Password' : 'Sign In'}
          </h1>
          <p className="text-gray-400 mt-2">Welcome to your production workspace</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border-gray-600 bg-gray-800/50 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 p-3 border placeholder-gray-500 transition-colors"
              placeholder="name@example.com"
              required
            />
          </div>
          {view !== 'forgot_password' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border-gray-600 bg-gray-800/50 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 p-3 border placeholder-gray-500 transition-colors"
                placeholder="••••••••"
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
                className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-600 rounded bg-gray-700"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
          >
            {loading ? 'Loading...' : view === 'sign_up' ? 'Sign Up' : view === 'forgot_password' ? 'Send Reset Link' : 'Sign In'}
          </button>
        </form>
        <div className="mt-6 text-center space-y-3">
          {view === 'sign_in' && (
            <>
              <button
                onClick={() => setView('sign_up')}
                className="text-sm text-amber-400 hover:text-amber-300 block w-full transition-colors"
              >
                Don't have an account? Sign Up
              </button>
              <button
                onClick={() => setView('forgot_password')}
                className="text-sm text-gray-400 hover:text-gray-300 block w-full transition-colors"
              >
                Forgot Password?
              </button>
            </>
          )}
          {view === 'sign_up' && (
            <button
              onClick={() => setView('sign_in')}
              className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              Already have an account? Sign In
            </button>
          )}
          {view === 'forgot_password' && (
            <button
              onClick={() => setView('sign_in')}
              className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  )
}