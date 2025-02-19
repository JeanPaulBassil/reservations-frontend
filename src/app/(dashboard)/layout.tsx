'use client'
import { useAuth } from '@/components/providers/AuthProvider'
import { useEffect } from 'react'
import AppWrapper from '@/components/sidebar'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user === null) {
      fetch('/api/auth/checkSession')
        .then((res) => res.json())
        .then((data) => {
          if (!data.valid) {
            router.push('/login')
          }
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user])

  // if (loading && !localStorage.getItem('loggedIn')) return <div>Loading...</div>

  return (
    <div className="flex h-screen">
      <AppWrapper />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}
