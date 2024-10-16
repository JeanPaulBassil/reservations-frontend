'use client'
import Widget from '@/app/_components/shared/Widget'
import { useSidebarContext } from '@/app/contexts/SidebarContext'
import { Button } from '@nextui-org/button'
import { useDisclosure } from '@nextui-org/modal'
import { Plus, Sidebar } from 'lucide-react'
import { Spacer, Spinner } from '@nextui-org/react'
import { useQuery } from '@tanstack/react-query'
import { UserApi } from '@/api/user.api'
import { Employee } from '@/api/models/User'
import { ServerError } from '@/api/utils'
import { useEntity } from '@/app/contexts/EntityContext'
import EmployeeProfile from './_components/TableProfile'
import AddEmployeeModal from './_components/AddTableModal'
import { Table } from '@/api/models/Table'
import { TableApi } from '@/api/table.api'
import TableProfile from './_components/TableProfile'
import AddTableModal from './_components/AddTableModal'

const page = () => {
  const { onToggle } = useSidebarContext()
  const tableApi = new TableApi()
  const { selectedEntityId } = useEntity()

  const {
    isOpen: isOpenCreateModal,
    onOpen: onOpenCreateModal,
    onClose: onCloseCreateModal,
  } = useDisclosure()

  const {
    data: tables,
    isLoading,
    isError,
    error,
  } = useQuery<Table[], ServerError>({
    queryKey: ['tables', selectedEntityId],
    queryFn: async () => {
      const response = await tableApi.getTables(selectedEntityId ?? '')
      return response.payload
    },
  })

  return (
    <div className="h-screen">
      <AddTableModal
        isOpen={isOpenCreateModal}
        onClose={onCloseCreateModal}
        selectedEntityId={selectedEntityId ?? ''}
      />
      <Widget className="border-2 border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={onToggle}
              isIconOnly
              endContent={<Sidebar />}
              variant="light"
              className="max-md:hidden"
            />
            <h2 className="text-lg font-bold">Tables</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              radius="sm"
              className="hidden bg-[#417D7A] text-white md:flex"
              onClick={onOpenCreateModal}
              startContent={<Plus />}
            >
              Add Tables
            </Button>
            <Button
              radius="sm"
              className="bg-[#417D7A] text-white md:hidden"
              onClick={onOpenCreateModal}
              isIconOnly
              startContent={<Plus />}
            />
          </div>
        </div>
      </Widget>
      <Spacer y={2} />
      <Widget className="flex h-[calc(100vh-6rem)] overflow-y-auto flex-col border-2 border-gray-200 px-5">
        <div className="flex flex-wrap gap-x-4 -gap-y-4">
          {isLoading ? (
            <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
              <Spinner color="success" />
            </div>
          ) : tables?.length === 0 ? (
            <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
              <p className="text-lg text-gray-500">No tables found</p>
            </div>
          ) : (
            tables?.map((table, index) => <TableProfile index={index} key={index} table={table} />)
          )}
        </div>
      </Widget>
    </div>
  )
}

export default page
