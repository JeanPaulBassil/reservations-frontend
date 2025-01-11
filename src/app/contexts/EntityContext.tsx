'use client'
import { EntityApi } from '@/api/entity.api'
import { Entity } from '@/api/models/Entity'
import { ServerError } from '@/api/utils/ResponseError'
import { useQuery } from '@tanstack/react-query'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from './ToastContext'
interface EntityContextType {
  selectedEntityId: string | null
  setSelectedEntityId: (id: string | null) => void
}

const EntityContext = createContext<EntityContextType | undefined>(undefined)

const entityApi = new EntityApi()

export const EntityProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedEntityId') || null
    }
    return null
  })

  const { data: entities, isLoading } = useQuery<Entity[], ServerError>({
    queryKey: ['entities'],
    queryFn: async () => {
      const response = await entityApi.getEntities()
      return response.payload
    },
  })

  const router = useRouter()
  const toast = useToast()

  if(entities?.length === 0 && !isLoading) {
    router.push('/entities')
  }

  useEffect(() => {
    if (selectedEntityId && typeof window !== 'undefined') {
      localStorage.setItem('selectedEntityId', selectedEntityId)
    }
  }, [selectedEntityId])

  return (
    <EntityContext.Provider value={{ selectedEntityId, setSelectedEntityId }}>
      {children}
    </EntityContext.Provider>
  )
}

export const useEntity = () => {
  const context = useContext(EntityContext)
  if (!context) {
    throw new Error('useEntity must be used within an EntityProvider')
  }
  return context
}
