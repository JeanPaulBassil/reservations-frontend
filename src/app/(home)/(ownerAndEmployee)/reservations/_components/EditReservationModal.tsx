import { EntityApi } from '@/api/entity.api'
import { GuestApi } from '@/api/guest.api'
import { CreateEntity, Entity, UpdateEntity } from '@/api/models/Entity'
import { Guest, UpdateGuest } from '@/api/models/Guest'
import { Reservation, UpdateReservation } from '@/api/models/Reservation'
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
import { DatePicker, Select, SelectItem, Switch, TimeInput, Tooltip } from '@nextui-org/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Joi from 'joi'
import { DoorOpen, FileText, Mail, Pencil, Phone, Plus, User, Users, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

type Props = {
  isOpen: boolean
  onClose: () => void
  reservation: Reservation
  selectedEntityId: string
}

const reservationSchema = Joi.object({
  tableId: Joi.string().required(),
  date: Joi.date().required(),
  startTime: Joi.date().required(),
  numberOfGuests: Joi.number().required(),
  note: Joi.string().optional().allow(''),
  isWalkIn: Joi.boolean().required(),
})

const EditReservationModal = ({ isOpen, onClose, reservation, selectedEntityId }: Props) => {
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
  } = useForm<UpdateReservation>({
    resolver: joiResolver(reservationSchema),
    defaultValues: {
      date: reservation?.date || new Date(),
      startTime: reservation?.startTime || new Date(),
      numberOfGuests: reservation?.numberOfGuests || 1,
      note: reservation?.note || '',
      isWalkIn: reservation?.isWalkIn || false,
      tableId: reservation?.tableId || '',
    },
  })

  console.log('errors', errors)

  const onSubmit = (data: UpdateReservation) => {
    updateReservation(data)
  }

  const { mutateAsync: updateReservation } = useMutation({
    mutationFn: (data: UpdateReservation) => {
      const reservationApi = new ReservationApi()
      return reservationApi.update({ ...data }, reservation.id)
    },
    onSuccess: () => {
      toast.success('Reservation updated successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations', selectedEntityId] })
      reset()
      onClose()
    },
  })

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

  useEffect(() => {
    if (reservation) {
      reset({
        tableId: reservation.tableId,
        date: reservation.date,
        startTime: reservation.startTime,
        numberOfGuests: reservation.numberOfGuests,
        note: reservation.note,
        isWalkIn: reservation.isWalkIn,
      })
    }
  }, [reservation, reset])

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
              <h2 className="text-2xl font-normal">Edit Reservation</h2>
              <p className="text-small font-light text-gray-500 dark:text-gray-300">
                Edit the reservation
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
                name="date"
                render={({ field }) => {
                  return (
                    <DatePicker
                      variant="bordered"
                      size="md"
                      radius="sm"
                      className="max-w-[284px]"
                      label="Date"
                      labelPlacement="outside"
                      value={parseDate((new Date(field.value)).toISOString().split('T')[0])}
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
                      label="Time"
                      hideTimeZone
                      labelPlacement="outside"
                      value={parseAbsoluteToLocal((new Date(field.value)).toISOString())}
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
                labelPlacement="outside"
                label="Select a Table"
                className="max-w-xs"
                isLoading={isLoading}
                isDisabled={isLoading}
                defaultSelectedKeys={[selectItems[0]?.key]}
                {...register('tableId')}
                errorMessage={errors.tableId?.message}
                isInvalid={!!errors.tableId}
              >
                {selectItems?.map((item) => <SelectItem key={item.key}>{item.label}</SelectItem>)}
              </Select>
            </div>
            <div className="flex w-full flex-row gap-2">
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
              <div className="flex w-full flex-col gap-2">
                <Input
                  placeholder="Number of Guests"
                  startContent={<Users size={16} strokeWidth={1.5} />}
                  variant="bordered"
                  className="w-full"
                  isDisabled={isSubmitting}
                  radius="sm"
                  {...register('numberOfGuests')}
                  errorMessage={errors.numberOfGuests?.message}
                  isInvalid={!!errors.numberOfGuests}
                />
                <Controller
                  control={control}
                  name="isWalkIn"
                  render={({ field }) => {
                    return (
                      <Tooltip
                        content={field.value ? 'Is Walk-In' : 'Is Not Walk-In'}
                        placement="right-end"
                        offset={50}
                      >
                        <Switch
                          isSelected={field.value}
                          onChange={(checked) => {
                            field.onChange(checked)
                          }}
                          isDisabled={isSubmitting}
                          size="lg"
                          color="success"
                          thumbIcon={({ isSelected, className }) =>
                            isSelected ? (
                              <DoorOpen size={16} strokeWidth={1.5} />
                            ) : (
                              <Phone size={16} strokeWidth={1.5} />
                            )
                          }
                        ></Switch>
                      </Tooltip>
                    )
                  }}
                />
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
              Update Reservation
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default EditReservationModal
