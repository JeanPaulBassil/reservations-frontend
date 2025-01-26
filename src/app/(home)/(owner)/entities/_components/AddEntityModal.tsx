import { EntityApi } from '@/api/entity.api'
import { CreateEntity } from '@/api/models/Entity'
import { useToast } from '@/app/contexts/ToastContext'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button } from '@nextui-org/button'
import { Input } from '@nextui-org/input'
import { Modal, ModalBody, ModalContent, ModalFooter } from '@nextui-org/modal'
import { Switch } from '@nextui-org/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Joi from 'joi'
import { Building2, MapPin, MessageCircle, Phone, Plus, X } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'

type Props = {
  isOpen: boolean
  onClose: () => void
  search: string
}

const entitySchema = Joi.object({
  name: Joi.string().required(),
  location: Joi.string().required(),
  smsSenderId: Joi.string().optional().allow(''),
  enableSms: Joi.boolean().required().default(false),
  phoneNumber: Joi.string().required(),
})

const AddEntityModal = ({ isOpen, onClose, search }: Props) => {
  const toast = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm<CreateEntity>({
    resolver: joiResolver(entitySchema),
    defaultValues: {
      enableSms: false,
    },
  })

  const onSubmit = (data: CreateEntity) => {
    console.log({ errors })
    createEntity(data)
  }

  const { mutateAsync: createEntity } = useMutation({
    mutationFn: (data: CreateEntity) => {
      const entityApi = new EntityApi()
      return entityApi.create({ ...data })
    },
    onSuccess: () => {
      toast.success('Entity created successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['entities', search] })
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
      isDismissable={false}
    >
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)} className="px-10 py-8">
          {/* Modal Header */}
          <div className="flex flex-row items-start justify-between">
            {/* Left */}
            <div className="flex flex-col space-y-2">
              <h2 className="text-2xl font-normal">Add Entity</h2>
              <p className="text-small font-light text-gray-500 dark:text-gray-300">
                Add a new entity to the system
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
              label="Entity Name"
              aria-label="Entity Name"
              placeholder="Enter the entity name"
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
              label="Entity Location"
              aria-label="Entity Location"
              placeholder="Enter the entity location"
              variant="bordered"
              className="w-full"
              isRequired
              isDisabled={isSubmitting}
              radius="sm"
              {...register('location')}
              errorMessage={errors.location?.message}
              isInvalid={!!errors.location}
            />
            <Input
              label="Phone Number"
              aria-label="Phone Number"
              placeholder="Enter the phone number"
              variant="bordered"
              className="w-full"
              isRequired
              isDisabled={isSubmitting}
              radius="sm"
              {...register('phoneNumber')}
              errorMessage={errors.phoneNumber?.message}
              isInvalid={!!errors.phoneNumber}
            />
            <div className="flex flex-row items-center justify-start space-x-2 w-full">
              <p className="text-small font-light text-gray-500 dark:text-gray-300">Enable SMS</p>
              <Switch
                isSelected={watch('enableSms')}
                onValueChange={() => setValue('enableSms', !watch('enableSms'))}
                title="Enable SMS"
              />
              <Input
                label="SMS Sender ID"
                aria-label="SMS Sender ID"
                placeholder="Enter the SMS sender ID"
                variant="bordered"
                className={`w-full ${!watch('enableSms') ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ease-in-out`}
                isDisabled={isSubmitting || !watch('enableSms')}
                radius="sm"
                {...register('smsSenderId')}
                errorMessage={errors.smsSenderId?.message}
                isInvalid={!!errors.smsSenderId}
              />
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
              onClick={() => {
                console.log('clicked')
                console.log({ errors })
                handleSubmit(onSubmit)()
              }}
            >
              Add Entity
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default AddEntityModal
