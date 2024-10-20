import { CreateReservation, ReservationQuery, ReservationSource } from '@/api/models/Reservation'
import { Table } from '@/api/models/Table'
import { ReservationApi } from '@/api/reservation.api'
import { TableApi } from '@/api/table.api'
import { ServerError } from '@/api/utils/ResponseError'
import { useToast } from '@/app/contexts/ToastContext'
import { joiResolver } from '@hookform/resolvers/joi'
import {
  getLocalTimeZone,
  parseAbsoluteToLocal,
  parseDate,
} from '@internationalized/date'
import { Button } from '@nextui-org/button'
import { Input, Textarea } from '@nextui-org/input'
import { Modal, ModalBody, ModalContent, ModalFooter } from '@nextui-org/modal'
import {
  DatePicker,
  Select,
  SelectItem,
  TimeInput,
} from '@nextui-org/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Joi from 'joi'
import {
  Armchair,
  Calendar,
  FileText,
  Mail,
  Pencil,
  Phone,
  Plus,
  User,
  Users,
  X,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { reservationSources } from './data'

type Props = {
  isOpen: boolean
  onClose: () => void
  entityId: string
  queries: ReservationQuery
}

const reservationSchema = Joi.object({
  tableId: Joi.string().optional().allow(''),
  guestName: Joi.string().required(),
  guestEmail: Joi.string().optional().email({ tlds: false }).allow(''),
  guestPhone: Joi.string().required(),
  guestDescription: Joi.string().optional().allow(''),
  entityId: Joi.string().required(),
  date: Joi.date().required(),
  startTime: Joi.date().required(),
  numberOfGuests: Joi.number().required(),
  note: Joi.string().optional().allow(''),
  source: Joi.string().required(),
})

const AddReservationModal = ({ isOpen, onClose, entityId, queries }: Props) => {
  const toast = useToast()
  const queryClient = useQueryClient()
  const tableApi = new TableApi()
  const [selectItems, setSelectItems] = useState<{ key: string; label: string }[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<CreateReservation>({
    resolver: joiResolver(reservationSchema),
    defaultValues: {
      entityId,
      date: new Date(),
      startTime: new Date(),
      source: ReservationSource.WALK_IN,
    },
  })

  const onSubmit = (data: CreateReservation) => {
    createReservation(data)
  }

  const {
    data: tables,
    isLoading,
  } = useQuery<Table[], ServerError>({
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

  return (
    <Modal
      classNames={{
        closeButton: 'hidden',
      }}
      backdrop={'blur'}
      size={'3xl'}
      isOpen={isOpen}
      onClose={onClose}
      radius="sm"
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
              <Input
                placeholder="Guest Name"
                startContent={<User />}
                variant="bordered"
                className="w-full"
                isRequired
                labelPlacement="outside"
                label="Guest Name"
                isDisabled={isSubmitting}
                radius="sm"
                {...register('guestName')}
                errorMessage={errors.guestName?.message}
                isInvalid={!!errors.guestName}
              />
              <Input
                placeholder="Guest Phone"
                startContent={<Phone />}
                variant="bordered"
                className="w-full"
                isRequired
                labelPlacement="outside"
                label="Guest Phone"
                isDisabled={isSubmitting}
                radius="sm"
                {...register('guestPhone')}
                errorMessage={errors.guestPhone?.message}
                isInvalid={!!errors.guestPhone}
              />
              <Input
                placeholder="Guest Email"
                startContent={<Mail />}
                variant="bordered"
                className="w-full"
                isDisabled={isSubmitting}
                labelPlacement="outside"
                label="Guest Email"
                radius="sm"
                {...register('guestEmail')}
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
                        field.onChange(value.toDate(getLocalTimeZone()))
                      }}
                      isInvalid={!!errors.date}
                      errorMessage={errors.date?.message}
                    />
                  )
                }}
              />
              <Controller
                control={control}
                name="date"
                render={({ field }) => {
                  return (
                    <TimeInput
                      variant="bordered"
                      size="md"
                      radius="sm"
                      className="max-w-[284px]"
                      hideTimeZone
                      value={parseAbsoluteToLocal(field.value.toISOString())}
                      onChange={(value) => {
                        field.onChange(value.toDate())
                      }}
                      isInvalid={!!errors.date}
                      errorMessage={errors.date?.message}
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
                  defaultSelectedKeys={[reservationSources[0].key]}
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
