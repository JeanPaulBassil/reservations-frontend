import { Tokens } from './models/Tokens'
import { CreateUser, User, Employee, CreateEmployee } from './models/User'
import { ApiResponse } from './utils'
import { AbstractApi, ApiRequestParams } from './utils/AbstractApi'

export class UserApi extends AbstractApi<User | Employee> {
  readonly path = 'users'
  constructor() {
    super('users')
  }

  async create(user: CreateUser): Promise<ApiResponse<User>> {
    const response = this.doFetch({
      requestOptions: {
        method: 'POST',
        body: JSON.stringify(user),
      },
      pathExtension: '',
    }) as Promise<ApiResponse<User>>

    return response
  }

  public async getUsers(params: ApiRequestParams): Promise<ApiResponse<User[]>> {
    const response = (await this.doFetch({
      queries: params.queries,
      requestOptions: {
        method: 'GET',
      },
    })) as ApiResponse<User[]>


    return response
  }

  public async deleteUser(id: string): Promise<ApiResponse<User>> {
    const response = (await this.doFetch({
      requestOptions: {
        method: 'DELETE',
      },
      pathExtension: id,
    })) as ApiResponse<User>

    return response
  }

  public async getEmployees(params: ApiRequestParams): Promise<ApiResponse<Employee[]>> {
    const response = (await this.doFetch({
      queries: params.queries,
      requestOptions: {
        method: 'GET',
      },
    })) as ApiResponse<Employee[]>

    return response
  }

  public async deleteEmployee(id: string): Promise<ApiResponse<Employee>> {
    const response = (await this.doFetch({
      requestOptions: {
        method: 'DELETE',
      },
      pathExtension: id,
    })) as ApiResponse<Employee>

    return response
  }

  public async createEmployee(employee: CreateEmployee, entityId: string): Promise<ApiResponse<Employee>> {
    const response = (await this.doFetch({
      queries: {
        entityId,
      },
      requestOptions: {
        method: 'POST',
        body: JSON.stringify(employee),
      },
    })) as ApiResponse<Employee>

    return response
  }
}
