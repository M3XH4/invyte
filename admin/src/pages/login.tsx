import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'
import { BRAND_ICON, BRAND_LOGO } from '@/constants/category-assets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ApiError } from '@/lib/api'

export function LoginPage() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('admin@invyte.app')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 dark:bg-[#070812]">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <img
              src={BRAND_LOGO}
              alt="Invyte"
              className="mb-4 h-16 w-auto max-w-[200px] object-contain"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = BRAND_ICON
              }}
            />
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Invyte Admin</h1>
            <p className="mt-1 text-sm text-gray-500">Sign in with your admin account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
