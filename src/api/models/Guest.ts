export interface Guest {
    id: string
    name: string
    email: string
    phone: string
    description: string
    entityId: string
    createdAt: Date
    updatedAt: Date
}

export interface CreateGuest {
    name: string
    email?: string
    phone: string
    description?: string
    entityId: string
}

export interface UpdateGuest {
    name?: string
    email?: string
    phone?: string
    description?: string
    isBlacklisted?: boolean
}