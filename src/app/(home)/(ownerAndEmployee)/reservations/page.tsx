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
  User,
} from '@nextui-org/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ServerError } from '@/api/utils'
import { useUser } from '@/app/providers/SessionProvider'
import useOrderedQueries from '@/hooks/useQueries'
import useDebouncedCallback from '@/hooks/useDebounceCallback'
import { useEntity } from '@/app/contexts/EntityContext'
import { GuestApi } from '@/api/guest.api'
import { Guest } from '@/api/models/Guest'
import AddGuestModal from './_components/AddReservationModal'
import { useRouter } from 'next/navigation'
import { useToast } from '@/app/contexts/ToastContext'
import EditGuestModal from './_components/EditReservationModal'
import { ReservationApi } from '@/api/reservation.api'
import { Reservation } from '@/api/models/Reservation'
import EditReservationModal from './_components/EditReservationModal'
import AddReservationModal from './_components/AddReservationModal'
import { format } from 'date-fns'

const page = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { onToggle } = useSidebarContext()
  const reservationApi = new ReservationApi()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const { user } = useUser()
  const { selectedEntityId } = useEntity()

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

  const { data: reservations, isLoading } = useQuery<Reservation[], ServerError>({
    queryKey: ['reservations', selectedEntityId],
    queryFn: async () => {
      const response = await reservationApi.getReservations(selectedEntityId ?? '')
      return response.payload
    },
    enabled: !!selectedEntityId,
  })

  const { mutate: deleteReservation } = useMutation({
    mutationFn: async (reservationId: string) => {
      await reservationApi.deleteReservation(reservationId)
    },
    onSuccess: () => {
      toast.success('Reservation deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onMutate: async (reservationId: string) => {
      await queryClient.cancelQueries({
        queryKey: ['reservations', selectedEntityId],
      })
      const previousReservations = queryClient.getQueryData<Reservation[]>([
        'reservations',
        selectedEntityId,
      ]) as Reservation[]
      queryClient.setQueryData(
        ['reservations', selectedEntityId],
        previousReservations.filter((c) => c.id !== reservationId)
      )

      return { previousReservations }
    },
  })

  const formatDate = (date: Date) => {
    return format(date, 'MM/dd/yyyy')
  }

  const formatTime = (date: Date) => {
    return format(date, 'hh:mm a')
  }

  const renderCell = React.useCallback((reservation: Reservation, columnKey: string) => {
    const cellValue = reservation[columnKey as keyof Reservation]
    console.log('cellValue', reservation)
    switch (columnKey) {
      case 'guest':
        return (
          <User
            name={reservation.guest.name}
            description={reservation.guest.phone}
          />
        )
      case 'table':
        return (
          <div className="relative flex items-center gap-2">
            <h2>{reservation.table.tableNumber}</h2>
          </div>
        )
      case 'status':
        return (
          <div className="relative flex items-center gap-2">
            <h2>{reservation.status}</h2>
          </div>
        )
      case 'numberOfGuests':
        return (
          <div className="relative flex items-center gap-2">
            <h2>{reservation.numberOfGuests}</h2>
          </div>
        )
      case 'date':
        return (
          <div className="relative flex items-center gap-2">
            <h2>{formatDate(reservation.date)}</h2>
          </div>
        )
      case 'time':
        return (
          <div className="relative flex items-center gap-2">
            <h2>{formatTime(reservation.startTime)}</h2>
          </div>
        )
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
                  setReservation(reservation)
                  onOpenEditModal()
                }}
              >
                <PencilIcon size={20} />
              </Button>
            </Tooltip>
            <Tooltip color="danger" content="Delete user" size="sm">
              <Button
                onClick={() => {
                  deleteReservation(reservation.id)
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
      key: 'guest',
      label: 'Guest',
    },
    {
      key: 'table',
      label: 'Table',
    },
    {
      key: 'status',
      label: 'Status',
    },
    {
      key: 'numberOfGuests',
      label: 'Number of Guests',
    },
    {
      key: 'date',
      label: 'Date',
    },
    {
      key: 'time',
      label: 'Time',
    },
    
    {
      key: 'actions',
      label: 'Actions',
    },
  ]

  return (
    <div className="h-screen">
      <EditReservationModal
        isOpen={isOpenEditModal}
        onClose={onCloseEditModal}
        reservation={reservation as Reservation}
        selectedEntityId={selectedEntityId ?? ''}
      />
      <AddReservationModal
        isOpen={isOpenCreateModal}
        onClose={onCloseCreateModal}
        entityId={selectedEntityId ?? ''}
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
            <h2 className="text-lg font-bold">Reservations</h2>
          </div>
          <Button
            radius="sm"
            className="hidden bg-[#417D7A] text-white md:flex"
            onClick={onOpenCreateModal}
            startContent={<Plus />}
          >
            Add Reservation
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
        {!reservations ? (
          <div className="flex h-[calc(100vh-6rem)] w-full items-center justify-center">
            <h2>Error fetching reservations, please contact support</h2>
          </div>
        ) : (
          <Table aria-label="Example table with dynamic content" className="mt-5" removeWrapper>
            <TableHeader columns={columns}>
              {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
            </TableHeader>
            <TableBody
              items={reservations}
              emptyContent={
                <div className="flex w-full items-center justify-center">
                  <h2>No reservations found</h2>
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
      </Widget>
    </div>
  )
}

export default page
