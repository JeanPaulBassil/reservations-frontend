import { CalendarDate } from '@internationalized/date'
import { CreateReservation, Reservation, ReservationQuery, ReservationStatus, UpdateReservation } from './models/Reservation'
import { ApiResponse } from './utils'
import { AbstractApi, ApiRequestParams } from './utils/AbstractApi'

export class ReservationApi extends AbstractApi<Reservation> {
  readonly path = 'reservations'
  constructor() {
    super('reservations')
  }

  async create(reservation: CreateReservation): Promise<ApiResponse<Reservation>> {
    const reservationDate = reservation.date as unknown as CalendarDate
    const response = this.doFetch({
      requestOptions: {
        method: 'POST',
        body: JSON.stringify({
          ...reservation,
          date: new Date(reservationDate.toString()),
        }),
      },
    }) as Promise<ApiResponse<Reservation>>

    return response
  }

  public async getReservations(entityId: string, queries: ReservationQuery): Promise<ApiResponse<Reservation[]>> {

    const response = (await this.doFetch({
      queries: {
        entityId,
        ...(queries.status && queries.status !== ReservationStatus.ALL ? { status: queries.status } : {}),
        ...(queries.date ? { date: queries.date.toString() } : {}),
      },
      requestOptions: {
        method: 'GET',
      },
    })) as ApiResponse<Reservation[]>


    return response
  }

  public async update(reservation: UpdateReservation, id: string): Promise<ApiResponse<Reservation>> {
    console.log('reservation', reservation)
    console.log('id', id)
    const response = (await this.doFetch({
      requestOptions: {
        method: 'PUT',
        body: JSON.stringify(reservation),
      },
      pathExtension: id,
    })) as ApiResponse<Reservation>

    return response
  }

  public async deleteReservation(id: string): Promise<ApiResponse<Reservation>> {
    const response = (await this.doFetch({
      requestOptions: {
        method: 'DELETE',
      },
      pathExtension: id,
    })) as ApiResponse<Reservation>

    return response
  }

  public async getReservationsPerMonth(entityId: string, month: number): Promise<ApiResponse<Reservation[]>> {
    const response = (await this.doFetch({
      queries: { entityId, month: month.toString() },
      requestOptions: { method: 'GET' },
      pathExtension: 'per-month',
    })) as ApiResponse<Reservation[]>

    return response
  }
}
