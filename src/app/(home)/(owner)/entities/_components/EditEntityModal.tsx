import { EntityApi } from '@/api/entity.api'
import { CreateEntity, Entity, UpdateEntity } from '@/api/models/Entity'
import { useToast } from '@/app/contexts/ToastContext'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button } from '@nextui-org/button'
import { Input } from '@nextui-org/input'
import { Modal, ModalBody, ModalContent, ModalFooter } from '@nextui-org/modal'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Joi from 'joi'
import { Plus, X } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'

type Props = {
  isOpen: boolean
  onClose: () => void
  entity: Entity
}

const entitySchema = Joi.object({
  name: Joi.string().required(),
  location: Joi.string().required(),
})

const EditEntityModal = ({ isOpen, onClose, entity }: Props) => {
  const toast = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateEntity>({
    resolver: joiResolver(entitySchema),
    defaultValues: {
      name: entity.name,
      location: entity.location,
    },
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
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] })
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
              Update Entity
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default EditEntityModal
