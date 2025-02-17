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
import { GuestApi } from '@/api/guest.api'
import { Guest } from '@/api/models/Guest'
import useOrderedQueries from '@/hooks/useQueries'
import useDebouncedCallback from '@/hooks/useDebounceCallback'
import { CreateShift, CreateShiftInput, Shift } from '@/api/models/Shift'
import { ShiftApi } from '@/api/shift.api'
import useAppMutation from '@/app/hooks/useAppHook'

type Props = {
  isOpen: boolean
  onClose: () => void
  entityId: string | null
}

const shiftSchema = Joi.object({
  entityId: Joi.string().required(),
  startHour: Joi.object({
    hour: Joi.number().required(),
    minute: Joi.number().required(),
    second: Joi.number().required(),
    millisecond: Joi.number().required(),
  }).required(),
  endHour: Joi.object({
    hour: Joi.number().required(),
    minute: Joi.number().required(),
    second: Joi.number().required(),
    millisecond: Joi.number().required(),
  }).required(),
  title: Joi.string().required(),
})

const shiftApi = new ShiftApi()

const AddShiftModal = ({ isOpen, onClose, entityId }: Props) => {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [selectItems, setSelectItems] = useState<{ key: string; label: string }[]>([])
  const [existingGuestSelected, setExistingGuestSelected] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    watch,
    setValue,
  } = useForm<CreateShiftInput>({
    resolver: joiResolver(shiftSchema),
    defaultValues: {
      entityId: entityId ?? '',
    },
  })

  useEffect(() => {
    if (entityId) {
      setValue('entityId', entityId)
    }
  }, [entityId])

  const onSubmit = (data: CreateShiftInput) => {
    const shift: CreateShift = {
      startHour: data.startHour.hour,
      endHour: data.endHour.hour,
      startMinute: data.startHour.minute,
      endMinute: data.endHour.minute,
      title: data.title,
      entityId: data.entityId,
    }
    createShift(shift)
  }


  const useCreateShift = () => {
    return useAppMutation<Shift, CreateShift, Shift>({
      mutationFn: async (data) => {
        const response = await shiftApi.create(data)
        return response.payload
      },
      queryKey: ['shifts'],
      additionalInvalidateQueries: [['reservations']],
      successMessage: 'Shift created successfully!',
      onSuccessCallback: () => {
        onClose()
        reset()
      },
      errorMessage: 'Failed to create shift. Please try again.',
    })
  }

  const { mutateAsync: createShift, isPending: isCreatingShift } = useCreateShift()

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
      isDismissable={false}
    >
      <ModalContent>
        <form className="px-10 py-8" onSubmit={handleSubmit(onSubmit)}>
          {/* Modal Header */}
          <div className="flex flex-row items-start justify-between">
            {/* Left */}
            <div className="flex flex-col space-y-2">
              <h2 className="text-2xl font-normal">Add Shift</h2>
              <p className="text-small font-light text-gray-500 dark:text-gray-300">
                Add a new shift to the system
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
            <Input
              variant="bordered"
              radius="sm"
              size="md"
              label="Title"
              {...register('title')}
              isRequired
            />
            <div className='flex flex-row gap-2 w-full'>
              <Controller
                control={control}
                name="startHour"
                render={({ field }) => (
                  <TimeInput
                    variant="bordered"
                    radius="sm"
                    size="md"
                    label="Start Hour"
                    value={field.value}
                    onChange={field.onChange}
                    isRequired
                    hourCycle={12}
                  />
                )}
              />
              <Controller
                control={control}
                name="endHour"
                render={({ field }) => (
                  <TimeInput
                    variant="bordered"
                    radius="sm"
                    size="md"
                    label="End Hour"
                    value={field.value}
                    onChange={field.onChange}
                    isRequired
                    hourCycle={12}
                  />
                )}
              />
            </div>
          </ModalBody>

          <ModalFooter className="px-0">
            <Button color="secondary" variant="light" onPress={() => {
              onClose()
              reset()
            }} size="sm">
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
              Add Shift
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default AddShiftModal
