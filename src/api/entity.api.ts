import { Company, CreateCompany } from './models/Company'
import { CreateEntity, Entity, UpdateEntity } from './models/Entity'
import { Tokens } from './models/Tokens'
import { CreateUser, User } from './models/User'
import { ApiResponse } from './utils'
import { AbstractApi, ApiRequestParams } from './utils/AbstractApi'

export class EntityApi extends AbstractApi<Entity | boolean> {
  readonly path = 'entities'
  constructor() {
    super('entities')
  }

  async create(entity: CreateEntity): Promise<ApiResponse<Entity>> {
    const response = this.doFetch({
      requestOptions: {
        method: 'POST',
        body: JSON.stringify(entity),
      },
    }) as Promise<ApiResponse<Entity>>

    return response
  }

  public async getEntities(nameSearch?: string): Promise<ApiResponse<Entity[]>> {
    const response = (await this.doFetch({
      queries: {
        nameSearch: nameSearch || '',
      },
      requestOptions: {
        method: 'GET',
      },
    })) as ApiResponse<Entity[]>

    return response
  }

  public async update(entity: UpdateEntity, id: string): Promise<ApiResponse<Entity>> {
    const response = (await this.doFetch({
      requestOptions: {
        method: 'PUT',
        body: JSON.stringify(entity),
      },
      pathExtension: id,
    })) as ApiResponse<Entity>

    return response
  }

  public async deleteEntity(id: string): Promise<ApiResponse<Entity>> {
    const response = (await this.doFetch({
      requestOptions: {
        method: 'DELETE',
      },
      pathExtension: id,
    })) as ApiResponse<Entity>

    return response
  }

  // @Get(":id/table-required")
  // async getTableRequiredByEntityId(@Param("id") id: string) {
  //   return this.entityService.getTableRequredByEntityId(id);
  // }

  public async getTableRequiredByEntityId(id: string): Promise<ApiResponse<boolean>> {
    const response = (await this.doFetch({
      requestOptions: {
        method: 'GET',
      },
      pathExtension: `${id}/table-required`,
    })) as ApiResponse<boolean>

    return response
  }

  public async getEntity(id: string): Promise<ApiResponse<Entity>> {
    const response = (await this.doFetch({
      requestOptions: {
        method: 'GET',
      },
      pathExtension: id,
    })) as ApiResponse<Entity>

    return response
  }
}
