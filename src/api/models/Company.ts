import { Entity } from "./Entity"
import { User } from "./User"

export interface Company {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    users: User[]
    entities: Entity[]
}

export interface CreateCompany {
    adminUsername: string
    adminPassword: string
    name: string
}

export interface UpdateCompany {
    name: string
    adminUsername: string
}
