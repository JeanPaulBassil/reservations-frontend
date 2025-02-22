'use client'
import { useAuth } from '@/components/providers/AuthProvider'

export default function Home() {
  const { user } = useAuth()
  return (
    <div>
      <h1>{user?.email || 'No user'}</h1>
    </div>
  )
}
