import { GuestApi } from '@/api/guest.api'
import { CreateGuest } from '@/api/models/Guest'
import { useToast } from '@/app/contexts/ToastContext'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button } from '@nextui-org/button'
import { Input, Textarea } from '@nextui-org/input'
import { Modal, ModalBody, ModalContent, ModalFooter } from '@nextui-org/modal'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Joi from 'joi'
import { Plus, X } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'

type Props = {
  isOpen: boolean
  onClose: () => void
  entityId: string
  search: string
}

const guestSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().optional(),
  phone: Joi.string().required(),
})

const AddGuestModal = ({ isOpen, onClose, entityId, search }: Props) => {
  const toast = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateGuest>({
    resolver: joiResolver(guestSchema),
  })

  const onSubmit = (data: CreateGuest) => {
    createGuest(data)
  }

  const { mutateAsync: createGuest } = useMutation({
    mutationFn: (data: CreateGuest) => {
      const guestApi = new GuestApi()
      data.entityId = entityId
      console.log("etityId", data.entityId)
      return guestApi.create({ ...data })
    },
    onSuccess: () => {
      toast.success('Guest created successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', search, entityId] })
      reset()
      onClose()
    },
  })

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
              <h2 className="text-2xl font-normal">Add Guest</h2>
              <p className="text-small font-light text-gray-500 dark:text-gray-300">
                Add a new guest to the system
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
              label="Guest Name"
              aria-label="Guest Name"
              placeholder="Enter the guest name"
              variant="bordered"
              className="w-full"
              isRequired
              isDisabled={isSubmitting}
              radius="sm"
              {...register('name')}
              errorMessage={errors.name?.message}
              isInvalid={!!errors.name}
            />
            <Input
              label="Guest Phone"
              aria-label="Guest Phone"
              placeholder="Enter the guest phone"
              variant="bordered"
              className="w-full"
              isRequired
              isDisabled={isSubmitting}
              radius="sm"
              {...register('phone')}
              errorMessage={errors.phone?.message}
              isInvalid={!!errors.phone}
            />
            <Input
              label="Guest Email"
              aria-label="Guest Email"
              placeholder="Enter the guest email"
              variant="bordered"
              className="w-full"
              isDisabled={isSubmitting}
              radius="sm"
              {...register('email')}
              errorMessage={errors.email?.message}
              isInvalid={!!errors.email}
            />
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
              Add Guest
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default AddGuestModal
