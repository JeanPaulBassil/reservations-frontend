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
    phoneNumber?: string
    settings: EntitySettings

}

export interface EntitySettings {
    id: string
    entityId: string
    isSmsEnabled: boolean
    smsSenderId?: string | null
    senderState: SmsSenderIdState
}

export enum SmsSenderIdState {
    DISABLED = 'DISABLED',
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    FAILED = 'FAILED',
}

export interface CreateEntity {
    name: string
    location: string
    phoneNumber: string
    smsSenderId?: string
    enableSms: boolean
}

export interface UpdateEntity {
    name: string
    location: string
    phoneNumber?: string
    smsSenderId?: string
    enableSms: boolean
}