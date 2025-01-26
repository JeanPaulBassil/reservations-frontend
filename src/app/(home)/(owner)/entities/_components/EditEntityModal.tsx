import { EntityApi } from '@/api/entity.api'
import { CreateEntity, Entity, SmsSenderIdState, UpdateEntity } from '@/api/models/Entity'
import { ServerError } from '@/api/utils'
import { useToast } from '@/app/contexts/ToastContext'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button } from '@nextui-org/button'
import { Input } from '@nextui-org/input'
import { Modal, ModalBody, ModalContent, ModalFooter } from '@nextui-org/modal'
import { Switch, Tooltip } from '@nextui-org/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Joi from 'joi'
import { CheckCircle, LoaderCircle, XCircle, Plus, X } from 'lucide-react'
import React, { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

type Props = {
  isOpen: boolean
  onClose: () => void
  entity: Entity
}

const entityApi = new EntityApi()
const entitySchema = Joi.object({
  name: Joi.string().required(),
  location: Joi.string().required(),
  phoneNumber: Joi.string().optional().allow(''),
  smsSenderId: Joi.string().optional().allow(''),
  enableSms: Joi.boolean().required().default(false),
})

const EditEntityModal = ({ isOpen, onClose, entity }: Props) => {
  const toast = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<UpdateEntity>({
    resolver: joiResolver(entitySchema),
    defaultValues: {
      name: entity.name,
      location: entity.location,
      phoneNumber: entity.phoneNumber,
      smsSenderId: entity.settings.smsSenderId || '',
      enableSms: entity.settings.isSmsEnabled,
    },
  })

  const {
    data: entityData,
    isLoading,
  } = useQuery<Entity, ServerError>({
    queryKey: ['entity', entity.id],
    queryFn: async () => {
      const response = await entityApi.getEntity(entity.id)
      return response.payload
    },
    enabled: !!entity.id,
  })

  const onSubmit = (data: UpdateEntity) => {
    updateEntity(data)
  }

  const { mutateAsync: updateEntity } = useMutation({
    mutationFn: (data: UpdateEntity) => {
      const entityApi = new EntityApi()
      return entityApi.update({ ...data }, entity.id)
    },
    onSuccess: () => {
      toast.success('Entity updated successfully')
      queryClient.invalidateQueries({ queryKey: ['entities'] })
      queryClient.invalidateQueries({ queryKey: ['entity', entity.id] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] })
      queryClient.invalidateQueries({ queryKey: ['entity', entity.id] })
      reset()
      onClose()
    },
  })

  useEffect(() => {
    if (entityData) {
      setValue('name', entityData.name)
      setValue('location', entityData.location)
      setValue('phoneNumber', entityData.phoneNumber)
      setValue('smsSenderId', entityData.settings.smsSenderId || '')
      setValue('enableSms', entityData.settings.isSmsEnabled)
    }
  }, [entityData])

  const statusIcon = useMemo(() => {
    console.log(entity)
    switch (entity.settings.senderState) {
      case SmsSenderIdState.VERIFIED:
        return (
          <Tooltip content="Verified" color="success">
            <CheckCircle className="text-green-500" />
          </Tooltip>
        )
      case SmsSenderIdState.PENDING:
        return (
          <Tooltip content="Pending" color="warning">
            <LoaderCircle className="text-yellow-500" />
          </Tooltip>
        )
      case SmsSenderIdState.FAILED:
        return (
          <Tooltip content="Failed" color="danger">
            <XCircle className="text-red-500" />
          </Tooltip>
        )
      default:
        // they just enabled sms and they are submitting the sender id
        return (
          <Tooltip content="Pending" color="warning">
            <LoaderCircle className="text-yellow-500" />
          </Tooltip>
        )
    }
  }, [entity.settings.senderState])

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
              <h2 className="text-2xl font-normal">Edit Entity</h2>
              <p className="text-small font-light text-gray-500 dark:text-gray-300">
                Edit the entity
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
              defaultValue={entity.name}
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
              defaultValue={entity.location}
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
            <div className="mt-4 flex w-full flex-row items-center justify-start space-x-2">
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
                className={`w-full ${
                  !watch('enableSms') ? 'pointer-events-none opacity-0' : ''
                } transition-opacity duration-300 ease-in-out`}
                isDisabled={isSubmitting || !watch('enableSms')}
                radius="sm"
                {...register('smsSenderId')}
                errorMessage={errors.smsSenderId?.message}
                isInvalid={!!errors.smsSenderId}
                endContent={statusIcon}
              />
            </div>
          </ModalBody>

          <ModalFooter className="px-0">
            <Button color="secondary" variant="light" onPress={() => {
              reset()
              onClose()
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
              Update Entity
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default EditEntityModal
