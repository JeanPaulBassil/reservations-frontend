'use client'

import React from 'react'
import { Card, CardHeader, CardBody, Button, Avatar } from '@nextui-org/react'
import { Employee } from '@/api/models/User'
import { Trash } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserApi } from '@/api/user.api'
import { useToast } from '@/app/contexts/ToastContext'

export default function EmployeeProfile({
  employee,
}: {
  employee: Employee
}) {
  const userApi = new UserApi()
  const toast = useToast()
  const queryClient = useQueryClient()

  const { mutate: deleteEmployee, isPending } = useMutation({
    mutationFn: async () => {
      await userApi.deleteEmployee(employee.id)
    },
    onSuccess: () => {
      toast.success('Employee deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['employees'],
      })
      const previousEmployees = queryClient.getQueryData<Employee[]>(['employees']) as Employee[]
      queryClient.setQueryData(
        ['employees'],
        previousEmployees.filter((e) => e.id !== employee.id)
      )

      return { previousEmployees }
    },
  })

  return (
    <Card className={`my-10 h-[170px] w-[200px] ${isPending ? 'opacity-50' : ''}`}>
      <CardHeader className="relative flex items-center justify-between overflow-visible bg-gradient-to-br from-[#92d7d3] via-[#59b6b2] to-[#0e958f]">
        <Avatar name={employee.username} />
        <Button
          radius="full"
          size="sm"
          variant="light"
          endContent={<Trash color="white" />}
          isIconOnly
          onClick={() => deleteEmployee()}
        ></Button>
      </CardHeader>
      <CardBody>
        <div className="py-2">
          <p className="text-base font-medium">{employee.username}</p>
        </div>
      </CardBody>
    </Card>
  )
}
