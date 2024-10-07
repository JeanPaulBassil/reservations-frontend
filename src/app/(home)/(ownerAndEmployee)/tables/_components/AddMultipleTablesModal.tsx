import { CompanyApi } from '@/api/company.api'
import { CreateCompany } from '@/api/models/Company'
import { CreateEmployee, CreateUser } from '@/api/models/User'
import { TableApi } from '@/api/table.api'
import { UserApi } from '@/api/user.api'
import { useToast } from '@/app/contexts/ToastContext'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button } from '@nextui-org/button'
import { Input } from '@nextui-org/input'
import { Modal, ModalBody, ModalContent, ModalFooter } from '@nextui-org/modal'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Joi from 'joi'
import { Eye, EyeOff, Icon, Lock, Plus, X } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

type Props = {
  isOpen: boolean
  onClose: () => void
  selectedEntityId: string
}

const tablesSchema = Joi.object({
  numberOfTables: Joi.number().required(),
  startNumber: Joi.number().required(),
})

const AddMultipleTablesModal = ({ isOpen, onClose, selectedEntityId }: Props) => {
  const [isVisible, setIsVisible] = useState(false)
  const toggleVisibility = () => setIsVisible(!isVisible)
  const toast = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<{ numberOfTables: number; startNumber: number }>({
    resolver: joiResolver(tablesSchema),
  })

  const onSubmit = (data: { numberOfTables: number; startNumber: number }) => {
    createEmployee(data)
  }

  const { mutateAsync: createEmployee } = useMutation({
    mutationFn: (data: { numberOfTables: number; startNumber: number }) => {
      const tableApi = new TableApi()
      return tableApi.addMultipleTables(selectedEntityId, data.numberOfTables, data.startNumber)
    },
    onSuccess: () => {
      toast.success('Tables created successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', selectedEntityId] })
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
              <h2 className="text-2xl font-normal">Add Multiple Tables</h2>
              <p className="text-small font-light text-gray-500 dark:text-gray-300">
                Add multiple tables to the system
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
              label="Number of Tables"
              aria-label="Number of Tables"
              placeholder="Enter the number of tables"
              variant="bordered"
              className="w-full"
              isRequired
              isDisabled={isSubmitting}
              radius="sm"
              {...register('numberOfTables')}
              errorMessage={errors.numberOfTables?.message}
              isInvalid={!!errors.numberOfTables}
            />
            <Input
              label="Start Number"
              aria-label="Start Number"
              placeholder="Enter the start number"
              variant="bordered"
              className="w-full"
              isRequired
              isDisabled={isSubmitting}
              radius="sm"
              {...register('startNumber')}
              errorMessage={errors.startNumber?.message}
              isInvalid={!!errors.startNumber}
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
              Add Tables
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default AddMultipleTablesModal
