import { CreateReservation, ReservationQuery, ReservationSource } from '@/api/models/Reservation'
import { Table } from '@/api/models/Table'
import { ReservationApi } from '@/api/reservation.api'
import { TableApi } from '@/api/table.api'
import { ServerError } from '@/api/utils/ResponseError'
import { useToast } from '@/app/contexts/ToastContext'
import { joiResolver } from '@hookform/resolvers/joi'
import { getLocalTimeZone, parseAbsoluteToLocal, parseDate } from '@internationalized/date'
import { Button } from '@nextui-org/button'
import { Input, Textarea } from '@nextui-org/input'
import { Modal, ModalBody, ModalContent, ModalFooter } from '@nextui-org/modal'
import {
  Autocomplete,
  AutocompleteItem,
  DatePicker,
  Select,
  SelectItem,
  TimeInput,
} from '@nextui-org/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Joi from 'joi'
import { Armchair, FileText, Mail, Pencil, Plus, User, Users, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { reservationSources } from './data'
import { GuestApi } from '@/api/guest.api'
import { Guest } from '@/api/models/Guest'
import useOrderedQueries from '@/hooks/useQueries'
import useDebouncedCallback from '@/hooks/useDebounceCallback'
import { CompanyApi } from '@/api/company.api'
import { EntityApi } from '@/api/entity.api'

type Props = {
  isOpen: boolean
  onClose: () => void
  entityId: string
  queries: ReservationQuery
}

const reservationSchema = Joi.object({
  tableId: Joi.string().when('tablesAreObligatory', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().optional().allow(''),
  }),
  guestName: Joi.string().required(),
  guestEmail: Joi.string().optional().allow(''),
  guestPhone: Joi.string().required(),
  guestDescription: Joi.string().optional().allow(''),
  entityId: Joi.string().required(),
  date: Joi.date().required(),
  startTime: Joi.date().required(),
  numberOfGuests: Joi.number().required(),
  note: Joi.string().optional().allow(''),
  source: Joi.string().required(),
  tablesAreObligatory: Joi.boolean().required(),
})

const AddReservationModal = ({ isOpen, onClose, entityId, queries }: Props) => {
  const toast = useToast()
  const queryClient = useQueryClient()
  const tableApi = new TableApi()
  const guestsApi = new GuestApi()
  const [selectItems, setSelectItems] = useState<{ key: string; label: string }[]>([])
  const [existingGuestSelected, setExistingGuestSelected] = useState<boolean>(false)

  const { get: getPhoneQueries, set: setPhoneQueries } = useOrderedQueries<{
    phoneSearch: string
  }>({
    phoneSearch: '',
  })

  const { data: guests, isLoading: isLoadingGuests } = useQuery<Guest[], ServerError>({
    queryKey: ['guests', entityId, getPhoneQueries().phoneSearch],
    queryFn: async () => {
      const response = await guestsApi.getGuests(
        '',
        entityId ?? '',
        false,
        getPhoneQueries().phoneSearch
      )
      return response.payload
    },
  })

  const entityApi = new EntityApi()
  const { data: tablesAreObligatory } = useQuery<boolean, ServerError>({
    queryKey: ['tablesAreObligatory', entityId],
    queryFn: async () => {
      const response = await entityApi.getTableRequiredByEntityId(entityId ?? '')
      return response.payload
    },
  })

  useEffect(() => {
    if (tablesAreObligatory) {
      setValue('tablesAreObligatory', true)
    }
  }, [tablesAreObligatory])

  const debouncePhoneSearch = useDebouncedCallback((value: string) => {
    setPhoneQueries({ phoneSearch: value })
  }, 500)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    watch,
    setValue,
  } = useForm<CreateReservation>({
    resolver: joiResolver(reservationSchema),
    defaultValues: {
      entityId,
      date: new Date(),
      startTime: new Date(),
      source: ReservationSource.PHONE,
      tablesAreObligatory: false,
    },
  })

  console.log('startTime', watch('startTime'))
  const onSubmit = (data: CreateReservation) => {
    createReservation(data)
  }

  const { data: tables, isLoading } = useQuery<Table[], ServerError>({
    queryKey: ['tables', entityId],
    queryFn: async () => {
      const response = await tableApi.getTables(entityId ?? '')
      return response.payload
    },
  })

  const { mutateAsync: createReservation } = useMutation({
    mutationFn: (data: CreateReservation) => {
      const reservationApi = new ReservationApi()
      data.entityId = entityId
      return reservationApi.create(data)
    },
    onSuccess: () => {
      onClose()
      reset()
      toast.success('Reservation created successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations', entityId, queries] })
    },
  })

  useEffect(() => {
    if (tables) {
      setSelectItems(
        tables.map((table) => ({
          key: table.id,
          label: table.tableNumber.toString(),
        }))
      )
    }
  }, [tables])

  const guestPhoneValue = watch('guestPhone', '')

  // Generate the autocomplete items, including the extra option if needed
  const autocompleteItems = React.useMemo(() => {
    const items =
      guests?.map((guest) => ({
        key: guest.phone,
        label: guest.phone,
        isNew: false,
      })) || []

    // Check if the current input value matches any existing guest phone numbers
    const isExistingGuest = items.some((item) => item.label === guestPhoneValue)

    // If not, add an extra option to use the current input value
    if (guestPhoneValue && !isExistingGuest) {
      items.push({
        key: 'new',
        label: `${guestPhoneValue}`,
        isNew: true,
      })
    }

    return items
  }, [guests, guestPhoneValue])

  useEffect(() => {
    const selectedGuest = guests?.find((guest) => guest.phone === guestPhoneValue)
    if (selectedGuest) {
      console.log('Selected guest:', selectedGuest)
    }
  }, [guests, guestPhoneValue])

  return (
    <Modal
      classNames={{
        closeButton: 'hidden',
      }}
      backdrop={'blur'}
      size={'4xl'}
      isOpen={isOpen}
      onClose={onClose}
      radius="sm"
      isDismissable={false}
    >
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)} className="px-10 py-8">
          {/* Modal Header */}
          <div className="flex flex-row items-start justify-between">
            {/* Left */}
            <div className="flex flex-col space-y-2">
              <h2 className="text-2xl font-normal">Add Reservation</h2>
              <p className="text-small font-light text-gray-500 dark:text-gray-300">
                Add a new reservation to the system
              </p>
            </div>
            {/* Right */}
            <Button
              isIconOnly
              onClick={onClose}
              startContent={<X size={24} strokeWidth={1.5} />}
              variant="light"
            />
          </div>

          {/* Modal Content */}
          <ModalBody className="my-4 flex flex-col items-start justify-center px-0">
            <div className="flex w-full flex-row gap-2">
              <Controller
                control={control}
                name="guestPhone"
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    label="Guest Phone"
                    placeholder="Guest Phone"
                    className="max-w-xs"
                    variant="bordered"
                    radius="sm"
                    labelPlacement="outside"
                    isRequired
                    size="md"
                    value={guestPhoneValue}
                    errorMessage={errors.guestPhone?.message}
                    isInvalid={!!errors.guestPhone}
                    onInputChange={(value) => {
                      field.onChange(value)
                      debouncePhoneSearch(value)
                    }}
                    onSelectionChange={(key) => {
                      if (key === 'new') {
                        // User wants to use the entered value
                        setValue('guestPhone', guestPhoneValue, { shouldValidate: true })
                        setValue('guestName', '')
                        setValue('guestEmail', '')
                        setExistingGuestSelected(false)
                      } else {
                        // An existing guest was selected
                        const selectedGuest = guests?.find((guest) => guest.phone === key)
                        if (selectedGuest) {
                          setValue('guestPhone', selectedGuest.phone, { shouldValidate: true })
                          setValue('guestName', selectedGuest.name, { shouldValidate: true })
                          setValue('guestEmail', selectedGuest.email || '', { shouldValidate: true })
                          setExistingGuestSelected(true)
                        }
                      }
                    }}
                    items={autocompleteItems}
                  >
                    {(item) => (
                      <AutocompleteItem key={item.key} textValue={item.label}>
                        {item.isNew ? (
                          <span className="text-blue-500">{item.label}</span>
                        ) : (
                          item.label
                        )}
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                )}
              />
              <Input
                placeholder="Guest Name"
                startContent={<User />}
                variant="bordered"
                className="w-full"
                isRequired
                labelPlacement="outside"
                label="Guest Name"
                isDisabled={isSubmitting || isLoadingGuests || existingGuestSelected}
                radius="sm"
                value={watch('guestName')}
                onChange={(e) => {
                  setValue('guestName', e.target.value)
                }}
                errorMessage={errors.guestName?.message}
                isInvalid={!!errors.guestName}
              />

              <Input
                placeholder="Guest Email"
                startContent={<Mail />}
                variant="bordered"
                className="w-full"
                isDisabled={isSubmitting || isLoadingGuests || existingGuestSelected}
                labelPlacement="outside"
                label="Guest Email"
                radius="sm"
                value={watch('guestEmail')}
                onChange={(e) => {
                  setValue('guestEmail', e.target.value)
                }}
                errorMessage={errors.guestEmail?.message}
                isInvalid={!!errors.guestEmail}
              />
            </div>
            <div className="flex w-full flex-row gap-2">
              <Controller
                control={control}
                name="date"
                render={({ field }) => {
                  return (
                    <DatePicker
                      variant="bordered"
                      size="md"
                      radius="sm"
                      className="max-w-[284px]"
                      value={parseDate(field.value.toISOString().split('T')[0])}
                      onChange={(value) => {
                        const date = value.toDate(getLocalTimeZone())
                        date.setHours(12, 0, 0, 0)
                        field.onChange(date)
                      }}
                      isInvalid={!!errors.date}
                      errorMessage={errors.date?.message}
                    />
                  )
                }}
              />
              <Controller
                control={control}
                name="startTime"
                render={({ field }) => {
                  return (
                    <TimeInput
                      variant="bordered"
                      size="md"
                      radius="sm"
                      className="max-w-[284px]"
                      hideTimeZone
                      hourCycle={12}
                      value={parseAbsoluteToLocal(field.value.toISOString())}
                      onChange={(value) => {
                        field.onChange(value.toDate())
                      }}
                      isInvalid={!!errors.startTime}
                      errorMessage={errors.startTime?.message}
                    />
                  )
                }}
              />
              <Select
                variant="bordered"
                size="md"
                radius="sm"
                className="max-w-xs"
                isLoading={isLoading}
                isDisabled={isLoading}
                {...register('tableId')}
                errorMessage={errors.tableId?.message}
                isInvalid={!!errors.tableId}
                placeholder="Select a Table"
                startContent={<Armchair />}
              >
                {selectItems?.map((item) => <SelectItem key={item.key}>{item.label}</SelectItem>)}
              </Select>
            </div>

            <div className="flex w-full flex-row gap-2">
              <Textarea
                startContent={<Pencil />}
                placeholder="Guest Description"
                variant="bordered"
                className="w-full"
                isDisabled={isSubmitting}
                radius="sm"
                {...register('guestDescription')}
                errorMessage={errors.guestDescription?.message}
                isInvalid={!!errors.guestDescription}
              />
              <Textarea
                startContent={<FileText />}
                placeholder="Note"
                variant="bordered"
                className="w-full"
                isDisabled={isSubmitting}
                radius="sm"
                {...register('note')}
                errorMessage={errors.note?.message}
                isInvalid={!!errors.note}
              />
              <div className="flex w-full flex-col gap-1">
                <Input
                  placeholder="Number of Guests"
                  startContent={<Users />}
                  variant="bordered"
                  className="w-full"
                  isDisabled={isSubmitting}
                  radius="sm"
                  {...register('numberOfGuests')}
                  errorMessage={errors.numberOfGuests?.message}
                  isInvalid={!!errors.numberOfGuests}
                />
                <Select
                  variant="bordered"
                  size="md"
                  placeholder="Select a Source"
                  radius="sm"
                  labelPlacement="outside"
                  className="max-w-xs"
                  isLoading={isLoading}
                  isDisabled={isLoading}
                  defaultSelectedKeys={[reservationSources[1].key]}
                  {...register('source')}
                  errorMessage={errors.source?.message}
                  isInvalid={!!errors.source}
                  disallowEmptySelection
                >
                  {reservationSources.map((source) => (
                    <SelectItem key={source.key} startContent={source.icon}>
                      {source.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="px-0">
            <Button color="secondary" variant="light" onPress={onClose} size="sm">
              Cancel
            </Button>
            <Button
              color="primary"
              variant="solid"
              radius="sm"
              size="sm"
              className="bg-[#417D7A] text-white"
              startContent={<Plus />}
              isLoading={isSubmitting}
              type="submit"
            >
              Add Reservation
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default AddReservationModal
