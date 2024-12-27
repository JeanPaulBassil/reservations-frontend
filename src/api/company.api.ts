import { Company, CreateCompany, UpdateCompany } from './models/Company'
import { Tokens } from './models/Tokens'
import { CreateUser, User } from './models/User'
import { ApiResponse } from './utils'
import { AbstractApi, ApiRequestParams } from './utils/AbstractApi'

export class CompanyApi extends AbstractApi<Company> {
  readonly path = 'companies'
  constructor() {
    super('companies')
  }

  async create(company: CreateCompany): Promise<ApiResponse<Company>> {
    const response = this.doFetch({
      requestOptions: {
        method: 'POST',
        body: JSON.stringify(company),
      },
    }) as Promise<ApiResponse<Company>>

    return response
  }

  public async getCompanies(queries: ApiRequestParams): Promise<ApiResponse<Company[]>> {
    const response = (await this.doFetch({
      requestOptions: {
        method: 'GET',
      },
    })) as ApiResponse<Company[]>


    return response
  }

  public async deleteCompany(id: string): Promise<ApiResponse<Company>> {
    const response = (await this.doFetch({
      requestOptions: {
        method: 'DELETE',
      },
      pathExtension: id,
    })) as ApiResponse<Company>

    return response
  }

  public async update(id: string, data: UpdateCompany): Promise<ApiResponse<Company>> {
    const response = (await this.doFetch({
      requestOptions: {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      pathExtension: id,
    })) as ApiResponse<Company>

    return response
  }
}