'use client'
import Widget from '@/app/_components/shared/Widget'
import { useSidebarContext } from '@/app/contexts/SidebarContext'
import { Button } from '@nextui-org/button'
import { useDisclosure } from '@nextui-org/modal'
import {
  DeleteIcon,
  EditIcon,
  EyeIcon,
  PencilIcon,
  Plus,
  Search,
  Sidebar,
  TrashIcon,
  X,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {
  getKeyValue,
  Input,
  Spacer,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from '@nextui-org/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ServerError } from '@/api/utils'
import { useUser } from '@/app/providers/SessionProvider'
import useOrderedQueries from '@/hooks/useQueries'
import useDebouncedCallback from '@/hooks/useDebounceCallback'
import { useEntity } from '@/app/contexts/EntityContext'
import { GuestApi } from '@/api/guest.api'
import { Guest } from '@/api/models/Guest'
import AddGuestModal from './_components/AddGuestModal'
import { useRouter } from 'next/navigation'
import { useToast } from '@/app/contexts/ToastContext'
import EditGuestModal from './_components/EditGuestModal'

const page = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { onToggle } = useSidebarContext()
  const guestApi = new GuestApi()
  const { user } = useUser()
  const [search, setSearch] = useState<string>('')
  const { selectedEntityId } = useEntity()
  const [guest, setGuest] = useState<Guest | null>(null)
  const { get: getQueries, set: setQueries } = useOrderedQueries<{
    search: string
  }>({
    search: '',
  })

  const debounceSearch = useDebouncedCallback((value: string) => {
    setQueries({ search: value })
  }, 500)

  const {
    isOpen: isOpenCreateModal,
    onOpen: onOpenCreateModal,
    onClose: onCloseCreateModal,
  } = useDisclosure()

  const {
    isOpen: isOpenEditModal,
    onOpen: onOpenEditModal,
    onClose: onCloseEditModal,
  } = useDisclosure()

  console.log('selectedEntityId', selectedEntityId)

  const { data: guests, isLoading } = useQuery<Guest[], ServerError>({
    queryKey: ['guests', getQueries().search, selectedEntityId],
    queryFn: async () => {
      const response = await guestApi.getGuests(getQueries().search, selectedEntityId ?? '')
      return response.payload
    },
    enabled: !!selectedEntityId,
  })

  const { mutate: deleteEntity, isPending } = useMutation({
    mutationFn: async (guestId: string) => {
      await guestApi.deleteGuest(guestId)
    },
    onSuccess: () => {
      toast.success('Guest deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onMutate: async (guestId: string) => {
      console.log('delete guest', guestId)
      await queryClient.cancelQueries({
        queryKey: ['guests', getQueries().search, selectedEntityId],
      })
      const previousGuests = queryClient.getQueryData<Guest[]>(['guests', getQueries().search, selectedEntityId]) as Guest[]
      queryClient.setQueryData(
        ['guests', getQueries().search, selectedEntityId],
        previousGuests.filter((c) => c.id !== guestId)
      )

      return { previousGuests }
    },
  })

  const renderCell = React.useCallback((guest: Guest, columnKey: string) => {
    const cellValue = guest[columnKey as keyof Guest]

    switch (columnKey) {
      case 'actions':
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit user" size="sm">
              <Button
                color="success"
                isIconOnly
                size="sm"
                radius="sm"
                variant="light"
                className="cursor-pointer text-lg text-default-400 active:opacity-50"
                onClick={() => {
                  setGuest(guest)
                  onOpenEditModal()
                }}
              >
                <PencilIcon size={20} />
              </Button>
            </Tooltip>
            <Tooltip color="danger" content="Delete user" size="sm">
              <Button
                onClick={() => {
                  deleteEntity(guest.id)
                }}
                color="danger"
                isIconOnly
                size="sm"
                radius="sm"
                variant="light"
                className="cursor-pointer text-lg text-danger active:opacity-50"
              >
                <TrashIcon size={20} />
              </Button>
            </Tooltip>
          </div>
        )
      default:
        return cellValue
    }
  }, [])

  if (!user?.companyId) {
    return (
      <div className="h-screen">
        <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
          <Spinner color="success" />
        </div>
      </div>
    )
  }

  if (!selectedEntityId) {
    router.push('/entities')
    toast.error('Please select an entity')
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    {
      key: 'actions',
      label: 'Actions',
    },
  ]

  return (
    <div className="h-screen">
      <EditGuestModal
        isOpen={isOpenEditModal}
        onClose={onCloseEditModal}
        guest={guest as Guest}
        selectedEntityId={selectedEntityId ?? ''}
        search={getQueries().search}
      />
      <AddGuestModal
        isOpen={isOpenCreateModal}
        onClose={onCloseCreateModal}
        entityId={selectedEntityId ?? ''}
        search={getQueries().search}
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
            <h2 className="text-lg font-bold">Guests</h2>
          </div>
          <Button
            radius="sm"
            className="hidden bg-[#417D7A] text-white md:flex"
            onClick={onOpenCreateModal}
            startContent={<Plus />}
          >
            Add Guest
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
        <div className="flex items-center justify-between">
          <Input
            placeholder="Search"
            variant="bordered"
            radius="sm"
            className="max-w-xs"
            startContent={<Search />}
            onChange={(e) => {
              setSearch(e.target.value)
              debounceSearch(e.target.value)
            }}
            value={search}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          {!guests ? (
            <div className="flex h-[calc(100vh-6rem)] w-full items-center justify-center">
              <h2>Error fetching guests, please contact support</h2>
            </div>
          ) : (
            <Table aria-label="Example table with dynamic content" className="mt-5" removeWrapper>
              <TableHeader columns={columns}>
                {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
              </TableHeader>
              <TableBody
                items={guests}
                emptyContent={
                  <div className="flex w-full items-center justify-center">
                    <h2>No guests found</h2>
                  </div>
                }
              >
                {(item) => (
                  <TableRow key={item.id}>
                    {/* @ts-expect-error */}
                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Widget>
    </div>
  )
}

export default page
