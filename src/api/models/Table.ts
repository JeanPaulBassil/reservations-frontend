import { Entity } from "./Entity"

export interface Table {
  id: string
  entityId: string
  entity: Entity
  tableNumber: number
  numberOfSeats: number
  createdAt: Date
  updatedAt: Date
}

export interface AddTableForm {
  tableNumber: number
  numberOfSeats: number
}
