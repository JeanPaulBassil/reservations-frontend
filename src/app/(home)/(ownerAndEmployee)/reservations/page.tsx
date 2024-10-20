import React from 'react'
import { Metadata } from 'next'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/api/utils/GetQueryClient'
import { ReservationApi } from '@/api/reservation.api'
import ReservationsPage from './ReservationsPage'

export const metadata: Metadata = {
  title: 'Reservations',
  description: 'View Reservations',
}

async function ReservationsServerPage() {
  return (
      <ReservationsPage />
  )
}

export default ReservationsServerPage
