import { joiResolver } from '@hookform/resolvers/joi'
import { parseAbsoluteToLocal } from '@internationalized/date'
import { Button } from '@nextui-org/button'
import { Input } from '@nextui-org/input'
import { Modal, ModalBody, ModalContent, ModalFooter } from '@nextui-org/modal'
import { TimeInput } from '@nextui-org/react'
import Joi from 'joi'
import { Pencil, X } from 'lucide-react'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { EditShift, EditShiftInput, Shift } from '@/api/models/Shift'
import { ShiftApi } from '@/api/shift.api'
import useAppMutation from '@/app/hooks/useAppHook'

type Props = {
  isOpen: boolean
  onClose: () => void
  entityId: string | null
  shiftBeingEdited: Shift | null
}

const shiftSchema = Joi.object({
  entityId: Joi.string().required(),
  startHour: Joi.object({
    hour: Joi.number().required(),
    minute: Joi.number().required(),
    second: Joi.number().required(),
    millisecond: Joi.number().required(),
    calendar: Joi.optional(),
    day: Joi.optional(),
    month: Joi.optional(),
    year: Joi.optional(),
    era: Joi.optional(),
    offset: Joi.optional(),
    timeZone: Joi.optional(),
  }).required(),
  endHour: Joi.object({
    hour: Joi.number().required(),
    minute: Joi.number().required(),
    second: Joi.number().required(),
    millisecond: Joi.number().required(),
    calendar: Joi.optional(),
    day: Joi.optional(),
    month: Joi.optional(),
    year: Joi.optional(),
    era: Joi.optional(),
    offset: Joi.optional(),
    timeZone: Joi.optional(),
  }).required(),
  title: Joi.string().required(),
})

const shiftApi = new ShiftApi()

const EditShiftModal = ({ isOpen, onClose, entityId, shiftBeingEdited }: Props) => {
  const currentTime = new Date()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    setValue,
    watch,
  } = useForm<EditShiftInput>({
    resolver: joiResolver(shiftSchema),
    defaultValues: {
      entityId: entityId ?? '',
      startHour: currentTime,
      endHour: currentTime,
      title: shiftBeingEdited?.title ?? '',
    },
  })

  const onSubmit = (data: EditShiftInput) => {
    const shift: EditShift = {
      id: shiftBeingEdited?.id ?? '',
      startHour: data.startHour.hour,
      endHour: data.endHour.hour,
      startMinute: data.startHour.minute,
      endMinute: data.endHour.minute,
      title: data.title,
      entityId: data.entityId,
    }
    editShift(shift)
  }

  const useEditShift = () => {
    return useAppMutation<Shift, EditShift, Shift>({
      mutationFn: async (data) => {
        const response = await shiftApi.editShift(data)
        return response.payload
      },
      queryKey: ['shifts'],
      additionalInvalidateQueries: [['reservations']],
      successMessage: 'Shift edited successfully!',
      onSuccessCallback: () => {
        onClose()
        reset()
      },
      errorMessage: 'Failed to edit shift. Please try again.',
    })
  }

  const { mutateAsync: editShift, isPending: isEditingShift } = useEditShift()

  useEffect(() => {
    if (entityId) {
      setValue('entityId', entityId)
    }
    if (shiftBeingEdited) {
      console.log('updating shift title to', shiftBeingEdited.title)
      setValue('title', shiftBeingEdited.title)

      let startHr =
        shiftBeingEdited.startHour < 10
          ? `0${shiftBeingEdited.startHour}`
          : shiftBeingEdited.startHour
      const startMin =
        shiftBeingEdited.startMinute < 10
          ? `0${shiftBeingEdited.startMinute}`
          : shiftBeingEdited.startMinute
      let endHr =
        shiftBeingEdited.endHour < 10 ? `0${shiftBeingEdited.endHour}` : shiftBeingEdited.endHour
      const endMin =
        shiftBeingEdited.endMinute < 10
          ? `0${shiftBeingEdited.endMinute}`
          : shiftBeingEdited.endMinute
      // Adjust for timezone offset
      const tzOffset = new Date().getTimezoneOffset() / 60 - 1 // Get timezone offset in hours plus one more hour

      // Add timezone offset to get correct local time
      const adjustedStartHr = Number(startHr) + tzOffset
      const adjustedEndHr = Number(endHr) + tzOffset

      // Format with leading zeros if needed
      const formattedStartHr = adjustedStartHr < 10 ? `0${adjustedStartHr}` : adjustedStartHr
      const formattedEndHr = adjustedEndHr < 10 ? `0${adjustedEndHr}` : adjustedEndHr

      // Use adjusted hours in the time strings
      startHr = formattedStartHr.toString()
      endHr = formattedEndHr.toString()

      setValue('startHour', parseAbsoluteToLocal(`2024-04-08T${startHr}:${startMin}:22Z`))
      setValue('endHour', parseAbsoluteToLocal(`2024-04-08T${endHr}:${endMin}:22Z`))
    }
  }, [shiftBeingEdited, setValue, entityId])

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
              value={watch('title')}
              onChange={(e) => setValue('title', e.target.value)}
              isRequired
            />
            <div className="flex w-full flex-row gap-2">
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
                    hideTimeZone
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
                    hideTimeZone
                  />
                )}
              />
            </div>
          </ModalBody>

          <ModalFooter className="px-0">
            <Button
              color="secondary"
              variant="light"
              onPress={() => {
                onClose()
                reset()
              }}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              color="primary"
              variant="solid"
              radius="sm"
              size="sm"
              className="bg-[#417D7A] text-white"
              startContent={<Pencil size={18} strokeWidth={1.2} />}
              isLoading={isSubmitting}
              type="submit"
            >
              Edit Shift
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default EditShiftModal
