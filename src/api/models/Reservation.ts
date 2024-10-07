import { DateValue } from "@nextui-org/react"
import { Guest } from "./Guest"
import { Table } from "./Table"

export interface Reservation {
  id: string
  table: Table
  tableId: string
  guest: Guest
  guestId: string
  date: Date
  startTime: Date
  numberOfGuests: number
  note?: string
  isWalkIn: boolean
  status: ReservationStatus
  createdAt: Date
  updatedAt: Date
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  SEATED = 'SEATED',
  LEFT = 'LEFT',
  NO_SHOW = 'NO_SHOW',
  LATE = 'LATE',
  CANCELLED = 'CANCELLED',
}

export interface CreateReservation {
  tableId: string
  guestName: string
  guestEmail?: string
  guestPhone: string
  guestDescription?: string
  entityId: string
  date: Date
  startTime: Date
  numberOfGuests: number
  note?: string
  isWalkIn: boolean
}

export interface UpdateReservation {
  entityId: string
  tableId: string
  guestId: string
  date: Date
  startTime: Date
  numberOfGuests: number
  note?: string
  isWalkIn: boolean
  status: ReservationStatus
}
