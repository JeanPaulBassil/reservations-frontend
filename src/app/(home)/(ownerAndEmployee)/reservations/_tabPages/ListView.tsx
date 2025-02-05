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
  Percent,
  Plus,
  Sidebar,
  Trash,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import React, { useMemo, useRef, useState } from 'react'
import {
  Accordion,
  AccordionItem,
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
  Tooltip,
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
import { TableApi } from '@/api/table.api'
import { Table as TableType } from '@/api/models/Table'
import { Shift } from '@/api/models/Shift'

const ListView = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const toast = useToast()
  const reservationApi = new ReservationApi()
  const tableApi = new TableApi()
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

  const shiftsFromTheReservations = useMemo(() => {
    if (!reservations) return []
    
    const shifts = reservations.reduce((acc, reservation) => {
      if (reservation.shift && !acc.find(s => s.id === reservation.shift?.id)) {
        acc.push(reservation.shift)
      }
      return acc
    }, [] as Shift[])

    // Add "no shift" option
    shifts.push({
      id: 'no-shift',
      title: 'No Shift',
    } as Shift)

    return shifts
  }, [reservations])

  const { data: tables } = useQuery<TableType[], ServerError>({
    queryKey: ['tables', selectedEntityId],
    queryFn: async () => {
      const response = await tableApi.getTables(selectedEntityId ?? '')
      return response.payload
    },
  })

  const numberOfFreeSeats = useMemo(() => {
    return tables?.reduce((acc, table) => {
      return acc + table.numberOfSeats
    }, 0)
  }, [tables])

  const occupiedSeats = useMemo(() => {
    return reservations?.reduce((acc, reservation) => {
      return acc + reservation.numberOfGuests
    }, 0)
  }, [reservations])

  const occupancyPercentage = useMemo(() => {
    if (!numberOfFreeSeats || !occupiedSeats) {
      return 0
    }
    return ((occupiedSeats ?? 0) / (numberOfFreeSeats ?? 0)) * 100
  }, [occupiedSeats, numberOfFreeSeats])

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
      icon: <Hourglass size={20} color="gray" />,
      color: 'bg-gray-100',
    },
    {
      key: ReservationStatus.SEATED,
      label: 'Seated',
      icon: <Armchair size={20} color="green" />,
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
      icon: <Ban size={20} color="red" />,
      color: 'bg-red-100',
    },
    {
      key: ReservationStatus.LATE,
      label: 'Late',
      icon: <Clock size={20} color="orange" />,
      color: 'bg-orange-100',
    },
    {
      key: ReservationStatus.CANCELLED,
      label: 'Cancelled',
      icon: <X size={20} color="red" />,
      color: 'bg-red-100',
    },
    {
      key: ReservationStatus.DELETED,
      label: 'Deleted',
      icon: <Trash size={20} color="gray" />,
      color: 'bg-gray-100',
    },
    {
      key: ReservationStatus.WAITLISTED,
      label: 'Waitlisted',
      icon: <List size={20} color="blue" />,
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
                size="lg"
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


  console.log('shiftsFromTheReservations', shiftsFromTheReservations)

  console.log('reservations', reservations)
  return (
    <div className="flex h-[calc(100vh-6.5rem)] w-full flex-col overflow-hidden">
      <EditReservationModal
        isOpen={isOpenEditModal}
        onClose={onCloseEditModal}
        reservation={reservation as Reservation}
        selectedEntityId={selectedEntityId ?? ''}
        queries={getQueries()}
      />

      {/* Filters and Widget Header */}
      <Widget className="flex h-full w-full max-w-full flex-col border-2 border-gray-200 px-5 py-4">
        <div className="flex w-full items-center justify-center md:justify-between">
          <div className="hidden w-full flex-wrap items-center gap-2 md:flex">
            <Tooltip content="Number of Guests" size="sm" radius="sm">
              <Chip variant="bordered" startContent={<Users size={16} />} radius="sm">
                <span className="cursor-default text-sm">{numberOfGuests} guests</span>
              </Chip>
            </Tooltip>
            <Tooltip content="Number of Tables" size="sm" radius="sm">
              <Chip variant="bordered" startContent={<UtensilsCrossed size={16} />} radius="sm">
                <span className="cursor-default text-sm">{numberOfTables} tables</span>
              </Chip>
            </Tooltip>
            <Tooltip content="Occupancy Percentage" size="sm" radius="sm">
              <Chip variant="bordered" startContent={<Percent size={16} />} radius="sm">
                <span className="cursor-default text-sm">{occupancyPercentage.toFixed(2)}%</span>
              </Chip>
            </Tooltip>
          </div>
          <div className="flex flex-col items-center gap-2 md:flex-row">
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
                          // @ts-expect-error ts is dumb
                          .date.toDate()
                          // @ts-expect-error ts is dumb
                          .setDate(getQueries().date.toDate().getDate() - 1)
                      ).toLocaleDateString('en-CA')
                    ),
                  })
                }
                isIconOnly
              />
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
                        // @ts-expect-error ts is dumb
                        getQueries().date.toDate().setDate(new Date().getDate())
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
                          // @ts-expect-error ts is dumb
                          .date.toDate()
                          // @ts-expect-error ts is dumb
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
            <Select
              // @ts-expect-error ts is dumb
              defaultSelectedKeys={[
                getQueries().status ? getQueries().status : ReservationStatus.PENDING,
              ]}
              variant="bordered"
              size="sm"
              radius="sm"
              className="w-[200px]"
              onSelectionChange={(key) =>
                setQueries({
                  ...getQueries(),
                  // @ts-expect-error ts is dumb
                  status: key.anchorKey as ReservationStatus,
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
        <div className="w-full flex-1 overflow-x-auto">
          {!reservations && !isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <h2>Error fetching reservations, please contact support</h2>
            </div>
          ) : isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <Spinner color="success" />
            </div>
          ) : (
            <Accordion defaultExpandedKeys={shiftsFromTheReservations.map((shift) => shift.id)} className='mt-5'>
              {shiftsFromTheReservations.map((shift) => (
                <AccordionItem
                  key={shift.id}
                  aria-label="Accordion 1"
                  subtitle={`${reservations?.filter((reservation) => reservation.shiftId === shift.id).length} reservations`}
                  title={shift.title}
                  className="p-0 mt-0"
                classNames={{
                  content: 'p-0 mt-0',
                  title: 'p-0 mt-0',
                  indicator: 'p-0 mt-0',
                  startContent: 'p-0 mt-0',
                  base: 'p-0 mt-0',
                  heading: 'p-0 mt-0',
                  subtitle: 'p-0 mt-0',
                }}
              >
                <Table
                  aria-label="Example table with dynamic content"
                  classNames={{
                    th: 'bg-[#ffffff] border-b-2 border-gray-200',
                    wrapper: 'p-0',
                  }}
                  hideHeader
                  className="w-full"
                  radius="sm"
                >
                  <TableHeader columns={columns}>
                    {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                  </TableHeader>
                  <TableBody
                    items={reservations?.filter((reservation) => {
                      if (shift.id === 'no-shift') {
                        return reservation.shiftId === null
                      }
                      return reservation.shiftId === shift.id
                    })}
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
                        {/* @ts-expect-error ts is dumb */}
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </Widget>

      {/* Table Container with Horizontal Scroll */}
    </div>
  )
}

export default ListView
