import { Entity } from './Entity'
import { User } from './User'

export interface Company {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  users: User[]
  entities: Entity[]
  companySettings: CompanySettings
  isBlocked: boolean
}

export interface CompanySettings {
  id: string
  companyId: string
  isTableObligatory: boolean
  createdAt: Date
  updatedAt: Date
  company: Company
  smsUsername?: string
  smsPassword?: string
}

export interface CreateCompany {
  adminUsername: string
  adminPassword: string
  name: string
  isTableObligatory: boolean
  smsUsername?: string
  smsPassword?: string
}

export interface UpdateCompany {
  name: string
  adminUsername: string
  isTableObligatory: boolean
  smsUsername?: string
  smsPassword?: string
}
