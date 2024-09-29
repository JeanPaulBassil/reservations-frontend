import { Company } from "./Company"

export interface Entity {
    id: string
    name: string
    location: string
    companyId: string
    createdAt: Date
    updatedAt: Date
}

export interface CreateEntity {
    name: string
    location: string
}

export interface UpdateEntity {
    name: string
    location: string
}
