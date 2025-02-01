'use client'
import Widget from '@/app/_components/shared/Widget'
import React, { useMemo } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import { ReservationApi } from '@/api/reservation.api'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarReservationSummary,
  Reservation,
  ReservationQuery,
  ReservationStatus,
} from '@/api/models/Reservation'
import { ServerError } from '@/api/utils'
import { useEntity } from '@/app/contexts/EntityContext'
import useOrderedQueries from '@/hooks/useQueries'
import { parseDate } from '@internationalized/date'
import { Chip } from '@nextui-org/chip'
import {
  ChevronLeft,
  Users,
  UtensilsCrossed,
  Calendar as CalendarIcon,
  ChevronRight,
  Hourglass,
  Armchair,
  Hand,
  Ban,
  Clock,
  X,
  Trash,
  List,
} from 'lucide-react'
import { Button, ButtonGroup } from '@nextui-org/button'
import { DatePicker, Select, SelectItem } from '@nextui-org/react'

type Props = {}

const CalendarView = (props: Props) => {
  const localizer = momentLocalizer(moment)
  const { selectedEntityId } = useEntity()
  const reservationApi = new ReservationApi()
  const { get: getQueries, set: setQueries } = useOrderedQueries<ReservationQuery>({
    date: parseDate(new Date().toLocaleDateString('en-CA')),
  })
  const { data: reservations, isLoading } = useQuery<Reservation[], ServerError>({
    queryKey: ['reservations', selectedEntityId, getQueries().date.month],
    queryFn: async () => {
      const response = await reservationApi.getReservationsPerMonth(
        selectedEntityId ?? '',
        getQueries().date.month
      )
      return response.payload
    },
    enabled: !!selectedEntityId,
  })
  console.log('reservations', reservations)

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

  function getReservationsSummaryByDay(reservations: Reservation[]): CalendarReservationSummary[] {
    // Create a map to store reservation summaries per date
    const summaryMap: { [key: string]: CalendarReservationSummary } = {}

    reservations.forEach((reservation) => {
      // @ts-expect-error Date not typed
      const dateKey = reservation.date.split('T')[0]

      if (!summaryMap[dateKey]) {
        // Initialize the summary object for this date
        summaryMap[dateKey] = {
          date: dateKey,
          totalReservations: 0,
          totalGuests: 0,
        }
      }

      // Update the summary for this date
      summaryMap[dateKey].totalReservations += 1
      summaryMap[dateKey].totalGuests += reservation.numberOfGuests
    })

    // Convert the map to an array of summaries
    return Object.values(summaryMap)
  }

  console.log('reservations', reservations)

  const summary = getReservationsSummaryByDay(reservations ?? [])

  console.log('summary', summary)

  const events = useMemo(() => {
    return summary.map((s) => ({
      allDay: true,
      start: new Date(s.date),
      end: new Date(s.date),
      title: `${s.totalReservations} reservations (${s.totalGuests} guests)`,
    }))
  }, [summary])

  console.log('events', events)

  return (
    <Widget className="h-full w-full border-2 border-gray-200 px-4 py-2">
      <Calendar
        localizer={localizer}
        startAccessor="start"
        endAccessor="end"
        className="h-full rounded-md"
        events={events}
        components={{
          toolbar: (toolbarProps) => {
            return (
              <div className="mb-4 flex items-center justify-between">
                {moment(toolbarProps.date).format('MMMM YYYY')}
                <div className="flex items-center gap-2">
                  <ButtonGroup>
                    <Button
                      variant="light"
                      size="sm"
                      radius="sm"
                      startContent={<ChevronLeft size={16} />}
                      onClick={() => {
                        toolbarProps.onNavigate('PREV')
                        setQueries({
                          ...getQueries(),
                          date: parseDate(
                            new Date(
                              getQueries()
                                // @ts-expect-error Date is not typed
                                .date.toDate()
                                // @ts-expect-error Date is not typed
                                .setDate(getQueries().date.toDate().getDate() - 30)
                            ).toLocaleDateString('en-CA')
                          ),
                        })
                      }}
                      isIconOnly
                    ></Button>
                    <Button
                      variant="light"
                      size="sm"
                      radius="sm"
                      startContent={<CalendarIcon size={16} />}
                      onClick={() => {
                        toolbarProps.onNavigate('TODAY')
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
                      }}
                    >
                      Today
                    </Button>
                    <Button
                      variant="light"
                      size="sm"
                      radius="sm"
                      startContent={<ChevronRight size={16} />}
                      onClick={() => {
                        toolbarProps.onNavigate('NEXT')
                        setQueries({
                          ...getQueries(),
                          date: parseDate(
                            new Date(
                              getQueries()
                                // @ts-expect-error Date is not typed
                                .date.toDate()
                                // @ts-expect-error Date is not typed
                                .setDate(getQueries().date.toDate().getDate() + 30)
                            ).toLocaleDateString('en-CA')
                          ),
                        })
                      }}
                      isIconOnly
                    />
                  </ButtonGroup>
                </div>
              </div>
            )
          },
          event: (eventProps) => {
            return <div>{eventProps.event?.title}</div>
          },
        }}
      />
    </Widget>
  )
}

export default CalendarView
