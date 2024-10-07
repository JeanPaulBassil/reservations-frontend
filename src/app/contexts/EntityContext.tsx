'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

interface EntityContextType {
  selectedEntityId: string | null
  setSelectedEntityId: (id: string | null) => void
}

const EntityContext = createContext<EntityContextType | undefined>(undefined)

export const EntityProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedEntityId') || null
    }
    return null
  })

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
