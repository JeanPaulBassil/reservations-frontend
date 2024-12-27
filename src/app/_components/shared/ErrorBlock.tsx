import { ServerError } from '@/api/utils'
import { Code } from '@nextui-org/react'
import { OctagonX } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

function ErrorBlock({ error }: { error: ServerError }) {
  const router = useRouter()
  if (error.status === 401) {
    router.refresh()
  }
  return (
    <div className="mt-12 flex w-full items-center justify-center">
      <div className="w-fit rounded-md border border-t-8 border-danger-200 border-t-danger-500 bg-secondary-50 px-12 py-8 dark:border-danger-800 dark:bg-secondary-950">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <div className="flex flex-row items-center space-x-2">
              <OctagonX className="text-danger-500" aria-hidden="true" width={20} />
              <h1 className="text-lg font-bold text-red-500">Something went wrong</h1>
            </div>
            <p className="text-tiny text-red-400">
              {error.name} - {error.status}
            </p>
          </div>
          <Code className="mt-4 text-lg font-medium text-red-400" color="danger">
            {error.message}
          </Code>
          <p className="text-tiny text-red-400">{error.timestamp}</p>
        </div>
      </div>
    </div>
  )
}

export default ErrorBlock
