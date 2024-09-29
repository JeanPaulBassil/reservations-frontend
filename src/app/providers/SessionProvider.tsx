'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/api/models/User'
import { ServerError } from '@/api/utils'
import getAccessTokenVerifiedOrRefreshIfNeeded from '../actions/verify-and-refresh.action'
import { JWTPayload } from 'jose'

interface UserContextType {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  loading: boolean
  error: ServerError | null
  refetch: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ServerError | null>(null)

  const fetchUser = async () => {
    try {
      const accessToken = await getAccessTokenVerifiedOrRefreshIfNeeded()
      if (accessToken) {
        const response = await fetch('/api/user', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        const data: JWTPayload = await response.json()
        setUser(data.payload as User)
      } else {
        setUser(null)
        setError(
          new ServerError({
            error: {
              message: 'An error occurred while fetching data',
              name: 'Error',
              response: 'An error occurred while fetching data',
              status: 400,
            },
            timestamp: new Date().getTime(),
          })
        )
        window.location.reload()
      }
    } catch (error) {
      if (error instanceof ServerError) {
        setError(error)
      }

      if (error instanceof Error) {
        setError(
          new ServerError({
            error: {
              message: error.message,
              name: error.name,
              response: error.message,
              status: error.name === 'TypeError' ? 500 : 400,
            },
            timestamp: new Date().getTime(),
          })
        )
      }

      setError(
        new ServerError({
          error: {
            message: 'An error occurred while fetching data',
            name: 'Error',
            response: 'An error occurred while fetching data',
            status: 400,
          },
          timestamp: new Date().getTime(),
        })
      )
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchUser()
    setLoading(false)
  }, [])

  const refetch = async () => {
    setLoading(true)
    await fetchUser()
    setLoading(false)
  }

  return (
    <UserContext.Provider value={{ user, setUser, loading, error, refetch }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
