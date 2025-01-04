import { TimeInputValue } from "@nextui-org/date-input"

export type Shift = {
  id: string
  startHour: number
  endHour: number
  startMinute: number
  endMinute: number
  title: string
  entityId: string
}

export type CreateShiftInput = {
  startHour: TimeInputValue
  endHour: TimeInputValue
  title: string
  entityId: string
}

export type EditShiftInput = {
  id?: string
  startHour: TimeInputValue
  endHour: TimeInputValue
  title: string
  entityId: string
}

export type CreateShift = {
  startHour: number
  endHour: number
  startMinute: number
  endMinute: number
  title: string
  entityId: string
}

export type EditShift = {
  id: string
  startHour: number
  endHour: number
  startMinute: number
  endMinute: number
  title: string
  entityId: string
}