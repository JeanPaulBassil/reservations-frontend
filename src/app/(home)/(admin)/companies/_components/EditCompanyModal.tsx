import { CompanyApi } from '@/api/company.api'
import { Company, CreateCompany, UpdateCompany } from '@/api/models/Company'
import { CreateUser } from '@/api/models/User'
import { UserApi } from '@/api/user.api'
import { useToast } from '@/app/contexts/ToastContext'
import useAppMutation from '@/app/hooks/useAppHook'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button } from '@nextui-org/button'
import { Input } from '@nextui-org/input'
import { Modal, ModalBody, ModalContent, ModalFooter } from '@nextui-org/modal'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Joi from 'joi'
import { Eye, EyeOff, Icon, Lock, Plus, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

type Props = {
  isOpen: boolean
  onClose: () => void
  companyToUpdate: Company | null
  setCompanyToUpdate: (company: Company | null) => void
}

const companySchema = Joi.object({
  adminUsername: Joi.string().required(),
  name: Joi.string().required(),
})

const companyApi = new CompanyApi()
const EditCompanyModal = ({ isOpen, onClose, companyToUpdate, setCompanyToUpdate }: Props) => {
  const toast = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateCompany>({
    resolver: joiResolver(companySchema),
  })

  const useUpdateCompany = () => {
    return useAppMutation<Company, UpdateCompany & { id: string }, Company>({
      mutationFn: async ({ id, ...data }) => {
        const response = await companyApi.update(id, data)
        return response.payload
      },
      queryKey: ['companies'],
      successMessage: 'Company updated successfully!',
      onSuccessCallback: () => {
        onClose()
        setCompanyToUpdate(null)
      },
      errorMessage: 'Failed to update company. Please try again.',
    })
  }

  const { mutateAsync: updateCompany, isPending: isUpdatingCompany } = useUpdateCompany()

  const onSubmit = (data: UpdateCompany) => {
    updateCompany({ id: companyToUpdate?.id.toString() ?? '', ...data })
  }

  useEffect(() => {
    if (companyToUpdate) {
      reset({
        name: companyToUpdate.name,
        adminUsername: companyToUpdate.users[0].username,
      })
    }
  }, [companyToUpdate])

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
              <h2 className="text-2xl font-normal">Update Company</h2>
              <p className="text-small font-light text-gray-500 dark:text-gray-300">
                Update the company details
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
              label="Company Name"
              aria-label="Company Name"
              placeholder="Enter the company name"
              variant="bordered"
              className="w-full"
              isRequired
              autoComplete="off"
              isDisabled={isSubmitting}
              radius="sm"
              {...register('name')}
              errorMessage={errors.name?.message}
              isInvalid={!!errors.name}
            />
            <Input
              label="Admin Username"
              aria-label="Admin Username"
              placeholder="Enter the admin username"
              variant="bordered"
              className="w-full"
              isRequired
              isDisabled={isSubmitting}
              radius="sm"
              autoComplete="none"
              aria-autocomplete="none"
              {...register('adminUsername')}
              errorMessage={errors.adminUsername?.message}
              isInvalid={!!errors.adminUsername}
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
              Update Company
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default EditCompanyModal
