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
import EmployeeProfile from './_components/EmployeeProfile'
import AddEmployeeModal from './_components/AddEmployeeModal'

const page = () => {
  const { onToggle } = useSidebarContext()
  const userApi = new UserApi()
  const { selectedEntityId } = useEntity()

  const {
    isOpen: isOpenCreateModal,
    onOpen: onOpenCreateModal,
    onClose: onCloseCreateModal,
  } = useDisclosure()

  const {
    data: employees,
    isLoading,
    isError,
    error,
  } = useQuery<Employee[], ServerError>({
    queryKey: ['employees', selectedEntityId],
    queryFn: async () => {
      const response = await userApi.getEmployees({
        queries: {
          entityId: selectedEntityId ?? '',
        },
      })
      return response.payload
    },
  })

  return (
    <div className="h-screen">
      <AddEmployeeModal
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
            <h2 className="text-lg font-bold">Employees</h2>
          </div>
          <Button
            radius="sm"
            className="hidden bg-[#417D7A] text-white md:flex"
            onClick={onOpenCreateModal}
            startContent={<Plus />}
          >
            Add Employee
          </Button>
          <Button
            radius="sm"
            className="bg-[#417D7A] text-white md:hidden"
            onClick={onOpenCreateModal}
            isIconOnly
            startContent={<Plus />}
          />
        </div>
      </Widget>
      <Spacer y={2} />
      <Widget className="flex h-[calc(100vh-6rem)] flex-col border-2 border-gray-200 px-5 pt-4">
        <div className="flex flex-wrap gap-4">
          {isLoading ? (
            <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
              <Spinner color="success" />
            </div>
          ) : (
            employees?.length === 0 ? (
              <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
                <p className="text-lg text-gray-500">No employees found</p>
              </div>
            ) : (
              employees?.map((employee) => (
                <EmployeeProfile key={employee.id} employee={employee} />
              ))
            )
          )}
        </div>
      </Widget>
    </div>
  )
}

export default page
