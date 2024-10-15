import { CalendarDate, DateValue } from "@nextui-org/react"
import { Guest } from "./Guest"
import { Table } from "./Table"
import { CircleIcon } from "lucide-react"

export interface Reservation {
  id: string
  table?: Table
  tableId?: string
  guest: Guest
  guestId: string
  date: Date
  startTime: Date
  numberOfGuests: number
  note?: string
  source: ReservationSource
  status: ReservationStatus
  createdAt: Date
  updatedAt: Date
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SEATED = 'SEATED',
  LEFT = 'LEFT',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED',
  LATE = 'LATE',
  DELETED = 'DELETED',
  WAITLISTED = 'WAITLISTED',
}

export enum ReservationSource {
  WALK_IN = 'WALK_IN',
  PHONE = 'PHONE',
  OTHER = 'OTHER',
}

export interface CreateReservation {
  tableId?: string
  guestName: string
  guestEmail?: string
  guestPhone: string
  guestDescription?: string
  entityId: string
  date: Date
  startTime: Date
  numberOfGuests: number
  note?: string
  source: ReservationSource
}

export interface UpdateReservation {
  entityId?: string
  tableId?: string
  guestId?: string
  date?: Date
  startTime?: Date
  numberOfGuests?: number
  note?: string
  source?: ReservationSource
  status?: ReservationStatus
}

export interface ReservationQuery {
  status?: ReservationStatus
  date: CalendarDate
}
