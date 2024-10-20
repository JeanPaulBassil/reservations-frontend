'use client'
import Widget from '@/app/_components/shared/Widget'
import { useSidebarContext } from '@/app/contexts/SidebarContext'
import { Button, ButtonGroup } from '@nextui-org/button'
import { useDisclosure } from '@nextui-org/modal'
import {
  Armchair,
  Ban,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Hand,
  Hourglass,
  List,
  Plus,
  Sidebar,
  Trash,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import React, { useMemo, useRef, useState } from 'react'
import {
  Chip,
  DatePicker,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Select,
  SelectItem,
  Spacer,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  User,
} from '@nextui-org/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ServerError } from '@/api/utils'
import { useUser } from '@/app/providers/SessionProvider'
import useOrderedQueries from '@/hooks/useQueries'
import { useEntity } from '@/app/contexts/EntityContext'
import { useRouter } from 'next/navigation'
import { useToast } from '@/app/contexts/ToastContext'
import { ReservationApi } from '@/api/reservation.api'
import { Reservation, ReservationQuery, ReservationStatus } from '@/api/models/Reservation'
import { format } from 'date-fns'
import { reservationSources } from '../_components/data'
import { parseDate, getLocalTimeZone } from '@internationalized/date'
import { useDateFormatter } from '@react-aria/i18n'
import EditReservationModal from '../_components/EditReservationModal'
import AddReservationModal from '../_components/AddReservationModal'

const ListView = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const toast = useToast()
  const reservationApi = new ReservationApi()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const { user } = useUser()
  const { selectedEntityId } = useEntity()
  const { get: getQueries, set: setQueries } = useOrderedQueries<ReservationQuery>({
    date: parseDate(new Date().toLocaleDateString('en-CA')),
  })

  const {
    isOpen: isOpenEditModal,
    onOpen: onOpenEditModal,
    onClose: onCloseEditModal,
  } = useDisclosure()

  const { data: reservations, isLoading } = useQuery<Reservation[], ServerError>({
    queryKey: ['reservations', selectedEntityId, getQueries()],
    queryFn: async () => {
      const response = await reservationApi.getReservations(selectedEntityId ?? '', getQueries())
      return response.payload
    },
    enabled: !!selectedEntityId,
  })

  const numberOfGuests = useMemo(
    () =>
      reservations?.reduce((acc, reservation) => {
        return acc + reservation.numberOfGuests
      }, 0),
    [reservations]
  )

  const numberOfTables = useMemo(
    () =>
      reservations?.reduce((acc, reservation) => {
        return acc + (reservation.table?.id ? 1 : 0)
      }, 0),
    [reservations]
  )

  const { mutate: updateReservationStatus } = useMutation<
    void,
    ServerError,
    { reservationId: string; status: ReservationStatus }
  >({
    mutationFn: async ({ reservationId, status }) => {
      await reservationApi.update({ status }, reservationId)
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onMutate: async ({ reservationId, status }) => {
      await queryClient.cancelQueries({
        queryKey: ['reservations', selectedEntityId, getQueries()],
      })
      const previousReservations = queryClient.getQueryData<Reservation[]>([
        'reservations',
        selectedEntityId,
        getQueries(),
      ]) as Reservation[]
      queryClient.setQueryData(
        ['reservations', selectedEntityId, getQueries()],
        previousReservations.map((c) => (c.id === reservationId ? { ...c, status } : c))
      )

      return { previousReservations }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations', selectedEntityId, getQueries()] })
    },
  })

  const formatTime = (date: Date) => {
    return format(date, 'hh:mm a')
  }

  const onUpdateStatus = (key: ReservationStatus, reservationId: string) => {
    updateReservationStatus({ reservationId, status: key })
  }

  const reservationStatuses = [
    {
      key: ReservationStatus.PENDING,
      label: 'Pending',
      icon: <Hourglass size={16} color="gray" />,
      color: 'bg-gray-100',
    },
    {
      key: ReservationStatus.SEATED,
      label: 'Seated',
      icon: <Armchair size={16} color="green" />,
      color: 'bg-green-100',
    },
    {
      key: ReservationStatus.LEFT,
      label: 'Left',
      icon: <Hand size={16} color="black" />,
      color: 'bg-gray-100',
    },
    {
      key: ReservationStatus.NO_SHOW,
      label: 'No Show',
      icon: <Ban size={16} color="red" />,
      color: 'bg-red-100',
    },
    {
      key: ReservationStatus.LATE,
      label: 'Late',
      icon: <Clock size={16} color="orange" />,
      color: 'bg-orange-100',
    },
    {
      key: ReservationStatus.CANCELLED,
      label: 'Cancelled',
      icon: <X size={16} color="red" />,
      color: 'bg-red-100',
    },
    {
      key: ReservationStatus.DELETED,
      label: 'Deleted',
      icon: <Trash size={16} color="gray" />,
      color: 'bg-gray-100',
    },
    {
      key: ReservationStatus.WAITLISTED,
      label: 'Waitlisted',
      icon: <List size={16} color="blue" />,
      color: 'bg-blue-100',
    },
  ]

  const renderCell = React.useCallback((reservation: Reservation, columnKey: string) => {
    const cellValue = reservation[columnKey as keyof Reservation]
    switch (columnKey) {
      case 'guest':
        return (
          <User
            name={reservation.guest.name}
            description={reservation.guest.phone}
            avatarProps={{
              className: 'hidden',
            }}
          />
        )
      case 'table':
        return (
          <div className="relative flex items-center gap-2">
            <UtensilsCrossed size={16} />
            <h2>{reservation.table?.tableNumber ?? 'No Table'}</h2>
          </div>
        )
      case 'numberOfGuests':
        return (
          <div className="relative flex items-center gap-2">
            <Users size={16} />
            <h2>{reservation.numberOfGuests}</h2>
          </div>
        )
      case 'time':
        return (
          <div className="relative flex items-center gap-2">
            <Clock size={16} />
            <h2>{formatTime(reservation.startTime)}</h2>
          </div>
        )
      case 'reservationSource':
        return (
          <div className="flex items-center gap-2">
            {reservationSources.find((s) => s.key === reservation.source)?.icon}
          </div>
        )
      case 'status':
        return (
          <Dropdown closeOnSelect>
            <DropdownTrigger key={reservation.id}>
              <Button
                radius="sm"
                color="default"
                variant="light"
                startContent={reservationStatuses.find((s) => s.key === reservation?.status)?.icon}
                isIconOnly
              />
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Static Actions"
              items={reservationStatuses}
              onAction={(key) => onUpdateStatus(key as ReservationStatus, reservation.id)}
            >
              {(status) => (
                <DropdownItem startContent={status.icon} key={status.key}>
                  {status.label}
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
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
      key: 'time',
      label: 'Time',
    },
    {
      key: 'guest',
      label: 'Guest',
    },
    {
      key: 'numberOfGuests',
      label: 'Number of Guests',
    },
    {
      key: 'table',
      label: 'Table',
    },
    {
      key: 'reservationSource',
      label: 'Source',
    },
    {
      key: 'status',
      label: 'Status',
    },
  ]

  const reservationStatusFilterValues = [
    { key: 'all', label: 'All', icon: <List size={16} color="blue" />, color: 'bg-blue-100' },
    ...reservationStatuses,
  ]

  return (
    <div className="h-screen">
      <EditReservationModal
        isOpen={isOpenEditModal}
        onClose={onCloseEditModal}
        reservation={reservation as Reservation}
        selectedEntityId={selectedEntityId ?? ''}
        queries={getQueries()}
      />
      <Widget className="flex h-[calc(100vh-6rem)] flex-col border-2 border-gray-200 px-5 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Chip variant="bordered" startContent={<Users size={16} />}>
              {numberOfGuests} guests
            </Chip>
            <Chip variant="bordered" startContent={<UtensilsCrossed size={16} />}>
              {numberOfTables} tables
            </Chip>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <ButtonGroup>
                <Button
                  variant="light"
                  size="sm"
                  radius="sm"
                  startContent={<ChevronLeft size={16} />}
                  onClick={() =>
                    setQueries({
                      ...getQueries(),
                      date: parseDate(
                        new Date(
                          getQueries()
                            // @ts-expect-error Date is not typed
                            .date.toDate()
                            // @ts-expect-error Date is not typed
                            .setDate(getQueries().date.toDate().getDate() - 1)
                        ).toLocaleDateString('en-CA')
                      ),
                    })
                  }
                  isIconOnly
                ></Button>
                <Button
                  variant="light"
                  size="sm"
                  radius="sm"
                  startContent={<Calendar size={16} />}
                  onClick={() =>
                    setQueries({
                      ...getQueries(),
                      date: parseDate(
                        new Date(
                          getQueries()
                            // @ts-expect-error Date is not typed
                            .date.toDate()
                            .setDate(new Date().getDate())
                        ).toLocaleDateString('en-CA')
                      ),
                    })
                  }
                >
                  Today
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  radius="sm"
                  startContent={<ChevronRight size={16} />}
                  onClick={() =>
                    setQueries({
                      ...getQueries(),
                      date: parseDate(
                        new Date(
                          getQueries()
                            // @ts-expect-error Date is not typed
                            .date.toDate()
                            // @ts-expect-error Date is not typed
                            .setDate(getQueries().date.toDate().getDate() + 1)
                        ).toLocaleDateString('en-CA')
                      ),
                    })
                  }
                  isIconOnly
                />
              </ButtonGroup>
              <DatePicker
                className="max-w-[200px]"
                variant="bordered"
                size="sm"
                radius="sm"
                showMonthAndYearPickers
                value={getQueries().date}
                onChange={(date) =>
                  setQueries({
                    ...getQueries(),
                    date: date,
                  })
                }
              />
            </div>
            <Select
              // @ts-expect-error Selection type is not typed
              defaultSelectedKeys={[
                getQueries().status ? getQueries().status : reservationStatusFilterValues[0].key,
              ]}
              variant="bordered"
              size="sm"
              radius="sm"
              className="w-[200px]"
              onSelectionChange={(key) =>
                setQueries({
                  ...getQueries(),
                  // @ts-expect-error Selection type is not typed
                  status: key.anchorKey === 'all' ? '' : (key.anchorKey as ReservationStatus),
                })
              }
              startContent={
                reservationStatusFilterValues.find((s) => s.key === getQueries().status)?.icon ?? (
                  <List size={16} color="blue" />
                )
              }
            >
              {reservationStatusFilterValues.map((status) => (
                <SelectItem key={status.key} startContent={status.icon}>
                  {status.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        {!reservations && !isLoading ? (
          <div className="flex h-[calc(100vh-6rem)] w-full items-center justify-center">
            <h2>Error fetching reservations, please contact support</h2>
          </div>
        ) : isLoading ? (
          <div className="flex h-[calc(100vh-6rem)] w-full items-center justify-center">
            <Spinner color="success" />
          </div>
        ) : (
          <Table
            aria-label="Example table with dynamic content"
            className="mt-5"
            removeWrapper
            classNames={{
              th: 'bg-[#ffffff] border-b-2 border-gray-200',
            }}
          >
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
                <TableRow
                  key={item.id}
                  className={`cursor-pointer transition-colors duration-200 ${reservationStatuses.find((s) => s.key === item.status)?.color}`}
                  onClick={() => {
                    setReservation(item)
                    onOpenEditModal()
                  }}
                >
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

export default ListView
