import { CreateShift, EditShift, EditShiftInput, Shift } from './models/Shift'
import { ApiResponse } from './utils'
import { AbstractApi } from './utils/AbstractApi'

export class ShiftApi extends AbstractApi<Shift> {
  readonly path = 'shifts'
  constructor() {
    super('shifts')
  }

  async create(shift: CreateShift): Promise<ApiResponse<Shift>> {
    const response = this.doFetch({
      requestOptions: {
        method: 'POST',
        body: JSON.stringify(shift),
      },
    }) as Promise<ApiResponse<Shift>>

    return response
  }

  async getShiftsByEntityId(entityId: string, page: string, take: string, name: string): Promise<ApiResponse<Shift[]>> {
    const response = this.doFetch({
      requestOptions: {
        method: 'GET',
      },
      queries: {
        page,
        take,
        name,
      },
      pathExtension: `${entityId}`,
    }) as Promise<ApiResponse<Shift[]>>

    return response
  }

  async editShift(editShiftDto: EditShift): Promise<ApiResponse<Shift>> {
    const response = this.doFetch({ 
      requestOptions: {
        method: 'PUT',
        body: JSON.stringify(editShiftDto),
      },
      pathExtension: `${editShiftDto.id}`,
    }) as Promise<ApiResponse<Shift>>

    return response
  }
}
