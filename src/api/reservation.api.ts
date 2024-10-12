import { Company, CreateCompany } from './models/Company'
import { CreateEntity, Entity, UpdateEntity } from './models/Entity'
import { CreateGuest, Guest, UpdateGuest } from './models/Guest'
import { CreateReservation, Reservation, ReservationStatus, UpdateReservation } from './models/Reservation'
import { Tokens } from './models/Tokens'
import { CreateUser, User } from './models/User'
import { ApiResponse } from './utils'
import { AbstractApi, ApiRequestParams } from './utils/AbstractApi'

export class ReservationApi extends AbstractApi<Reservation> {
  readonly path = 'reservations'
  constructor() {
    super('reservations')
  }

  async create(reservation: CreateReservation): Promise<ApiResponse<Reservation>> {
    const response = this.doFetch({
      requestOptions: {
        method: 'POST',
        body: JSON.stringify(reservation),
      },
    }) as Promise<ApiResponse<Reservation>>

    return response
  }

  public async getReservations(entityId: string, queries: { status?: string }): Promise<ApiResponse<Reservation[]>> {

    const response = (await this.doFetch({
      queries: {
        entityId,
        ...(queries.status === '' ? {} : { status: queries.status }),
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
}
