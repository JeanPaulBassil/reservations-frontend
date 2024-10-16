import { CompanyApi } from '@/api/company.api'
import { CreateCompany } from '@/api/models/Company'
import { AddTableForm, Table } from '@/api/models/Table'
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
import { Eye, EyeOff, Icon, Lock, Pen, Plus, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

type Props = {
  isOpen: boolean
  onClose: () => void
  table?: Table
}

const tableSchema = Joi.object({
  tableNumber: Joi.number().required(),
  numberOfSeats: Joi.number().required(),
})

const EditTableModal = ({ isOpen, onClose, table }: Props) => {
  const toast = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<{ tableNumber: number; numberOfSeats: number }>({
    resolver: joiResolver(tableSchema),
    defaultValues: {
      tableNumber: table?.tableNumber,
      numberOfSeats: table?.numberOfSeats,
    },
  })

  const onSubmit = (data: AddTableForm) => {
    updateTable(data)
  }

  const { mutateAsync: updateTable } = useMutation({
    mutationFn: (data: AddTableForm) => {
      const tableApi = new TableApi()
      return tableApi.updateTable(table?.id ?? '', data.numberOfSeats, data.tableNumber)
    },
    onSuccess: () => {
      toast.success('Table updated successfully')
      reset()
      onClose()
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', table?.entityId ?? ''] })
    },
  })

  useEffect(() => {
    reset({
      tableNumber: table?.tableNumber,
      numberOfSeats: table?.numberOfSeats,
    })
  }, [table])

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
              <h2 className="text-2xl font-normal">Edit Table</h2>
              <p className="text-small font-light text-gray-500 dark:text-gray-300">
                Edit a table to the system
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
              label="Table Number"
              aria-label="Table Number"
              placeholder="Enter the table number"
              variant="bordered"
              className="w-full"
              isRequired
              isDisabled={isSubmitting}
              radius="sm"
              {...register('tableNumber')}
              errorMessage={errors.tableNumber?.message}
              isInvalid={!!errors.tableNumber}
            />
            <Input
              label="Number of Seats"
              aria-label="Number of Seats"
              placeholder="Enter the number of seats"
              variant="bordered"
              className="w-full"
              isRequired
              isDisabled={isSubmitting}
              radius="sm"
              {...register('numberOfSeats')}
              errorMessage={errors.numberOfSeats?.message}
              isInvalid={!!errors.numberOfSeats}
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
              startContent={<Pen />}
              isLoading={isSubmitting}
              type="submit"
            >
              Edit Table
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default EditTableModal
