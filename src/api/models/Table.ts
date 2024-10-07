import { Entity } from "./Entity"

export interface Table {
  id: string
  entityId: string
  entity: Entity
  tableNumber: number
  createdAt: Date
  updatedAt: Date
}
