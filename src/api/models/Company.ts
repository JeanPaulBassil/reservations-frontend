import { User } from "./User"

export interface Company {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    users: User[]
}

export interface CreateCompany {
    adminUsername: string
    adminPassword: string
    name: string
}
