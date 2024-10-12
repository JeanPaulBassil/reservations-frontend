import { ReservationSource } from "@/api/models/Reservation"
import { DoorOpen, FileText, Phone } from "lucide-react"

export const reservationSources = [
  { key: ReservationSource.WALK_IN, label: 'Walk-In', icon: <DoorOpen size={16} color="blue" /> },
  { key: ReservationSource.PHONE, label: 'Phone', icon: <Phone size={16} color="green" /> },
  { key: ReservationSource.OTHER, label: 'Other', icon: <FileText size={16} color="red" /> },
]
