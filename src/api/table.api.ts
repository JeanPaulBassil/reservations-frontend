import { Table } from './models/Table'
import { ApiResponse } from './utils'
import { AbstractApi } from './utils/AbstractApi'

export class TableApi extends AbstractApi<Table> {
  readonly path = 'tables'
  constructor() {
    super('tables')
  }

  async addTable(
    entityId: string,
    numberOfSeats: number,
    tableNumber: number
  ): Promise<ApiResponse<Table>> {
    const response = this.doFetch({
      queries: {
        entityId,
        numberOfSeats: numberOfSeats.toString(),
        tableNumber: tableNumber.toString(),
      },
      requestOptions: {
        method: 'POST',
      },
    }) as Promise<ApiResponse<Table>>

    return response
  }

  async updateTable(
    id: string,
    numberOfSeats: number,
    tableNumber: number
  ): Promise<ApiResponse<Table>> {
    const response = this.doFetch({
      requestOptions: {
        method: 'PUT',
        body: JSON.stringify({ numberOfSeats, tableNumber }),
      },
      pathExtension: id,
    }) as Promise<ApiResponse<Table>>

    return response
  }

  public async getTables(entityId: string): Promise<ApiResponse<Table[]>> {
    const response = (await this.doFetch({
      queries: {
        entityId,
      },
      requestOptions: {
        method: 'GET',
      },
    })) as ApiResponse<Table[]>

    return response
  }

  public async deleteTable(id: string): Promise<ApiResponse<Table>> {
    const response = (await this.doFetch({
      requestOptions: {
        method: 'DELETE',
      },
      pathExtension: id,
    })) as ApiResponse<Table>

    return response
  }
}
