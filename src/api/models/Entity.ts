import { Company } from "./Company"
import { Reservation } from "./Reservation"

export interface Entity {
    id: string
    name: string
    location: string
    companyId: string
    createdAt: Date
    updatedAt: Date
    reservations: Reservation[]
}

export interface CreateEntity {
    name: string
    location: string
}

export interface UpdateEntity {
    name: string
    location: string
}