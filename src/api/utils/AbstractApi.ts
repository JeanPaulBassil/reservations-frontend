import getAccessTokenVerifiedOrRefreshIfNeeded from '@/app/actions/verify-and-refresh.action'
import { ApiResponse, ServerError, ResponseError } from '.'

export const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3200/api/'

export interface ApiRequestParams {
  queries?: Record<string, string | string[]>
  requestOptions?: RequestInit
  pathExtension?: string
  file?: boolean
}

export abstract class AbstractApi<T> {
  readonly path: string
  readonly secure: boolean

  constructor(path: string, secure = true) {
    this.path = path
    this.secure = secure
  }

  protected async doFetch(
    requestParams: ApiRequestParams = { file: false }
  ): Promise<ApiResponse<T | T[]>> {
    let url = `${baseUrl}${this.path}`

    if (requestParams && requestParams.pathExtension) {
      url += `/${requestParams.pathExtension}`
    }

    if (requestParams && requestParams.queries) {
      const query = new URLSearchParams(requestParams.queries as Record<string, string>)
      query.toString() && (url += `?${query.toString()}`)
    }

    let accessToken: string | undefined
    console.log("in abstract api")
    if (this.secure) {
      console.log("in secure")
      accessToken = await getAccessTokenVerifiedOrRefreshIfNeeded()

      if (!accessToken) {
        throw new ServerError({
          error: {
            message: 'Unauthorized',
            response: 'Unauthorized',
            name: 'Unauthorized',
            status: 401,
          },
          timestamp: new Date().getTime(),
        })
      }
    }
    console.log("in try")
    try {
      const response = await fetch(url, {
        ...requestParams?.requestOptions,
        headers: {
          ...(!requestParams.file ? { 'Content-Type': 'application/json' } : {}),
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          ...(requestParams?.requestOptions?.headers ?? {}),
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        const errorBody = await response.json()
        throw new ServerError(errorBody as ResponseError)
      }


      const body = await response.json()
      return { payload: body.payload, meta: body.meta }
    } catch (error) {
      console.log("in catch")
      // If the error is from the backend, it should follow the ResponseError structure
      if (error instanceof ServerError) {
        throw error
      }

      // If the error is not from the backend, we create a similar structure to maintain consistency
      if (error instanceof Error) {
        throw new ServerError({
          error: {
            message: error.message,
            name: error.name,
            response: error.message,
            status: error.name === 'TypeError' ? 500 : 400,
          },
          timestamp: new Date().getTime(),
        })
      }

      throw new ServerError({
        error: {
          message: 'An error occurred while fetching data',
          name: 'Error',
          response: 'An error occurred while fetching data',
          status: 400,
        },
        timestamp: new Date().getTime(),
      })
    }
  }
}
