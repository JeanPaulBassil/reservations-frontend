import { Company, CreateCompany } from './models/Company'
import { CreateEntity, Entity, UpdateEntity } from './models/Entity'
import { CreateGuest, Guest, UpdateGuest } from './models/Guest'
import { Tokens } from './models/Tokens'
import { CreateUser, User } from './models/User'
import { ApiResponse } from './utils'
import { AbstractApi, ApiRequestParams } from './utils/AbstractApi'

export class GuestApi extends AbstractApi<Guest> {
  readonly path = 'guests'
  constructor() {
    super('guests')
  }

  async create(guest: CreateGuest): Promise<ApiResponse<Guest>> {
    const response = this.doFetch({
      requestOptions: {
        method: 'POST',
        body: JSON.stringify(guest),
      },
    }) as Promise<ApiResponse<Guest>>

    return response
  }

  public async getGuests(
    search: string,
    entityId: string,
    isBlacklisted: boolean = false,
  ): Promise<ApiResponse<Guest[]>> {
    const response = (await this.doFetch({
      queries: {
        entityId,
        isBlacklisted: isBlacklisted?.toString(),
        search,
      },
      requestOptions: {
        method: 'GET',
      },
    })) as ApiResponse<Guest[]>

    return response
  }

  public async update(guest: UpdateGuest, id: string): Promise<ApiResponse<Guest>> {
    const response = (await this.doFetch({
      requestOptions: {
        method: 'PUT',
        body: JSON.stringify(guest),
      },
      pathExtension: id,
    })) as ApiResponse<Guest>

    return response
  }

  public async deleteGuest(id: string): Promise<ApiResponse<Guest>> {
    const response = (await this.doFetch({
      requestOptions: {
        method: 'DELETE',
      },
      pathExtension: id,
    })) as ApiResponse<Guest>

    return response
  }
}
