'use client'
import Widget from '@/app/_components/shared/Widget'
import { useSidebarContext } from '@/app/contexts/SidebarContext'
import { Button } from '@nextui-org/button'
import { useDisclosure } from '@nextui-org/modal'
import { Pencil, Plus, Search, Sidebar, Trash } from 'lucide-react'
import { Input, Spacer, Spinner } from '@nextui-org/react'
import { useQuery } from '@tanstack/react-query'
import { UserApi } from '@/api/user.api'
import { Employee } from '@/api/models/User'
import { ApiResponse, ServerError } from '@/api/utils'
import { useEntity } from '@/app/contexts/EntityContext'
import AddShiftModal from './_components/AddShiftModal'
import { useMemo, useState } from 'react'
import useDebouncedCallback from '@/hooks/useDebounceCallback'
import useOrderedQueries from '@/hooks/useQueries'
import { Shift } from '@/api/models/Shift'
import { ShiftApi } from '@/api/shift.api'
import ErrorBlock from '@/app/_components/shared/ErrorBlock'
import SelectNumberOfRows from '@/app/_components/shared/SelectNumberOfRows'
import { columns } from '../../(admin)/companies/CompaniesClientPage'
import Table from '@/app/_components/shared/Table'
import EditShiftModal from './_components/EditShiftModal'
import DeletionConfirmationModal from '../../(admin)/companies/_components/DeleteConfirmationModal'
import useAppMutation from '@/app/hooks/useAppHook'

const shiftApi = new ShiftApi()

const page = () => {
  const { onToggle } = useSidebarContext()
  const { selectedEntityId } = useEntity()
  const {
    isOpen: isOpenAddShiftModal,
    onOpen: onOpenAddShiftModal,
    onClose: onCloseAddShiftModal,
  } = useDisclosure()
  const {
    isOpen: isOpenEditShiftModal,
    onOpen: onOpenEditShiftModal,
    onClose: onCloseEditShiftModal,
  } = useDisclosure()
  const {
    isOpen: isOpenDeleteModal,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal,
  } = useDisclosure()
  const [nameSearch, setNameSearch] = useState('')
  const [shiftBeingEdited, setShiftBeingEdited] = useState<Shift | null>(null)
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null)

  const { get: getQueries, set: setQueries } = useOrderedQueries<{
    name: string
    page: string
    take: string
  }>({
    name: '',
    page: '1',
    take: '10',
  })

  const debounceName = useDebouncedCallback((value: string) => {
    setQueries({ name: value })
  }, 500)

  const { data: shifts, isLoading, isError: isErrorShifts, error: errorShifts } = useQuery<ApiResponse<Shift[]>, ServerError>({
    queryKey: ['shifts', getQueries().name, getQueries().page, getQueries().take],
    queryFn: async () => {
      const response = await shiftApi.getShiftsByEntityId(selectedEntityId || '', getQueries().page, getQueries().take, getQueries().name)
      return response
    },
    enabled: !!selectedEntityId,
  })

  const columns = useMemo(() => {
    return [
      {
        key: 'name',
        label: 'Name',
      },
      {
        key: 'startTime',
        label: 'Start Time',
      },
      {
        key: 'endTime',
        label: 'End Time',
      },
      {
        key: 'actions',
        label: 'Actions',
      },
    ] as const
  }, [])

  const rows = useMemo(() => {
    if (!shifts || !shifts.payload) return []
    return shifts.payload.map((shift: Shift) => {
      const startIsPm = shift.startHour > 12
      const endIsPm = shift.endHour > 12

      const startMinute = shift.startMinute === 0 ? '00' : shift.startMinute < 10 ? `0${shift.startMinute}` : shift.startMinute
      const endMinute = shift.endMinute === 0 ? '00' : shift.endMinute < 10 ? `0${shift.endMinute}` : shift.endMinute

      const shiftStartTime = `${startIsPm ? shift.startHour - 12 : shift.startHour}:${startMinute} ${startIsPm ? 'PM' : 'AM'}`
      const shiftEndTime = `${endIsPm ? shift.endHour - 12 : shift.endHour}:${endMinute} ${endIsPm ? 'PM' : 'AM'}`

      return {
        id: Number(shift.id),
        name: shift.title,
        startTime: shiftStartTime,
        endTime: shiftEndTime,
        actions: [
          {
            label: 'Edit',
            icon: <Pencil className="text-primary" width={18} strokeWidth={1.2} />,
            onClick: () => {
              setShiftBeingEdited(shift)
              onOpenEditShiftModal()
            },
          },
          {
            label: 'Delete',
            icon: <Trash className="text-primary" width={18} strokeWidth={1.2} />,
            onClick: () => {
              setShiftToDelete(shift)
              onOpenDeleteModal()
            },
          },
        ],
      }
    })
  }, [shifts])

  const setPage = (value: number) => {
    setQueries({ page: value.toString() })
  }

  const useDeleteShift = () => {
    return useAppMutation<Shift, { id: string }, Shift>({
      mutationFn: async (data) => {
        const response = await shiftApi.deleteShift(data.id)
        return response.payload
      },
      queryKey: ['shifts'],
      successMessage: 'Shift deleted successfully!',
      onSuccessCallback: () => {
        onCloseDeleteModal()
      },
      errorMessage: 'Failed to delete shift. Please try again.',
    })
  }

  const { mutateAsync: deleteShift, isPending: isDeletingShift } = useDeleteShift()

  return (
    <div className="h-screen">
      <EditShiftModal
        isOpen={isOpenEditShiftModal}
        onClose={onCloseEditShiftModal}
        entityId={selectedEntityId}
        shiftBeingEdited={shiftBeingEdited}
      />
      <AddShiftModal
        isOpen={isOpenAddShiftModal}
        onClose={onCloseAddShiftModal}
        entityId={selectedEntityId}
      />
      <DeletionConfirmationModal
        isOpen={isOpenDeleteModal}
        onClose={onCloseDeleteModal}
        onDelete={() => deleteShift({ id: shiftToDelete?.id ?? '' })}
        isLoading={isDeletingShift}
        message="Are you sure you want to delete this shift?"
        assetBeingDeleted="shift"
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
            <h2 className="text-lg font-bold">Shifts</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              radius="sm"
              className="hidden bg-[#417D7A] text-white md:flex"
              onClick={onOpenAddShiftModal}
              startContent={<Plus />}
            >
              Add Shift
            </Button>
            <Button
              radius="sm"
              className="bg-[#417D7A] text-white md:hidden"
              onClick={onOpenAddShiftModal}
              isIconOnly
              startContent={<Plus />}
            />
          </div>
        </div>
      </Widget>
      <Spacer y={2} />
      <Widget className="flex h-[calc(100vh-6rem)] flex-col border-2 border-gray-200 px-5 pt-4">
        <div className="flex w-full justify-between">
          <Input
            type="text"
            placeholder="Search by shift name"
            size="sm"
            radius="sm"
            variant="bordered"
            value={nameSearch}
            onClear={() => {
              setNameSearch('')
              setQueries({ name: '', page: '1', take: getQueries().take })
            }}
            onChange={(e) => {
              const value = e.target.value
              setNameSearch(value)
              debounceName(value)
            }}
            className="max-w-xs"
            classNames={{
              base: ['bg-transparent', 'shadow-none'],
              inputWrapper: [
                'bg-white dark:bg-secondary-900',
                'shadow-none',
                'border-[1px] group-data-[focus=true]:border-2 group-data-[focus=true]:border-primary-600 dark:group-data-[focus=true]:border-primary-600',
                'bg-white dark:bg-secondary-900',
                'border-secondary-200 dark:border-secondary-700',
                'text-secondary-600 dark:text-secondary-50',
                'placeholder:text-secondary-400 dark:placeholder:text-secondary-400',
                'transition-colors duration-200 ease-in-out',
              ],
              clearButton: ['text-secondary-300'],
            }}
            isClearable
            startContent={<Search className="text-secondary-400" size={18} strokeWidth={1} />}
          />
        </div>
        <div className="flex w-full justify-between">
          <p className="mt-4 text-small italic text-gray-400">
            Total shifts: {shifts?.meta?.itemCount ?? 0}
          </p>
          <SelectNumberOfRows
            rowsPerPageT={(rows: number) => `${rows} rows per page`}
            rowsPerPage={Number(getQueries().take)}
            setRowsPerPage={(value) => setQueries({ take: value.toString() })}
          />
        </div>
        <Spacer y={4} />
        {isErrorShifts ? (
          <ErrorBlock error={errorShifts} />
        ) : (
          <Table
            columns={columns}
            rows={rows}
            setPage={setPage}
            currentPage={Number(getQueries().page)}
            isLoading={isLoading}
            totalPages={(shifts?.meta?.itemCount || 0) / Number(getQueries().take)}
            emptyContent="No shifts found"
            ariaLabel="Shifts Table"
          />
        )}
      </Widget>
    </div>
  )
}

export default page
