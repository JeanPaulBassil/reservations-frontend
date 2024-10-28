import { CompanyApi } from '@/api/company.api'
import { CreateCompany } from '@/api/models/Company'
import { CreateEmployee, CreateUser } from '@/api/models/User'
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

const employeeSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
})

const AddEmployeeModal = ({ isOpen, onClose, selectedEntityId }: Props) => {
  const [isVisible, setIsVisible] = useState(false)
  const toggleVisibility = () => setIsVisible(!isVisible)
  const toast = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateEmployee>({
    resolver: joiResolver(employeeSchema),
  })

  const onSubmit = (data: CreateEmployee) => {
    createEmployee(data)
  }

  const { mutateAsync: createEmployee } = useMutation({
    mutationFn: (data: CreateEmployee) => {
      const userApi = new UserApi()
      return userApi.createEmployee(data, selectedEntityId)
    },
    onSuccess: () => {
      toast.success('Employee created successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
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
              <h2 className="text-2xl font-normal">Add Employee</h2>
              <p className="text-small font-light text-gray-500 dark:text-gray-300">
                Add a new employee to the system
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
              label="Username"
              aria-label="Username"
              placeholder="Enter the username"
              variant="bordered"
              className="w-full"
              isRequired
              isDisabled={isSubmitting}
              radius="sm"
              {...register('username')}
              errorMessage={errors.username?.message}
              isInvalid={!!errors.username}
            />
            <Input
              endContent={
                <button type="button" onClick={toggleVisibility}>
                  {isVisible ? (
                    <Eye size={24} strokeWidth={1.5} />
                  ) : (
                    <EyeOff size={24} strokeWidth={1.5} />
                  )}
                </button>
              }
              label="Password"
              aria-label="Password"
              radius="sm"
              placeholder="Enter the password"
              type={isVisible ? 'text' : 'password'}
              variant="bordered"
              isDisabled={isSubmitting}
              isRequired
              {...register('password')}
              errorMessage={errors.password?.message}
              isInvalid={!!errors.password}
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
              Add Employee
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default AddEmployeeModal
