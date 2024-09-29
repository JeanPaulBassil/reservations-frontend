'use client'

import React from 'react'
import { Card, CardHeader, CardBody, Button, Avatar, Tabs, Tab, Chip } from '@nextui-org/react'
import { User } from '@/api/models/User'
import { Trash } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserApi } from '@/api/user.api'
import { useToast } from '@/app/contexts/ToastContext'
import { Company } from '@/api/models/Company'
import { CompanyApi } from '@/api/company.api'

export default function CompanyProfile({
  company,
}: {
  company: Company
}) {
  const companyApi = new CompanyApi()
  const toast = useToast()
  const queryClient = useQueryClient()

  const { mutate: deleteCompany, isPending } = useMutation({
    mutationFn: async () => {
      await companyApi.deleteCompany(company.id)
    },
    onSuccess: () => {
      toast.success('Company deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['companies'],
      })
      const previousCompanies = queryClient.getQueryData<Company[]>(['companies']) as Company[]
      queryClient.setQueryData(
        ['companies'],
        previousCompanies.filter((c) => c.id !== company.id)
      )

      return { previousCompanies }
    },
  })

  return (
    <Card className={`my-10 h-[170px] w-[200px] ${isPending ? 'opacity-50' : ''}`}>
      <CardHeader className="relative flex items-center justify-between overflow-visible bg-gradient-to-br from-[#92d7d3] via-[#59b6b2] to-[#0e958f]">
        <Avatar name={company.name} />
        <Button
          radius="full"
          size="sm"
          variant="light"
          endContent={<Trash color="white" />}
          isIconOnly
          onClick={() => deleteCompany()}
        ></Button>
      </CardHeader>
      <CardBody>
        <div className="py-2">
          <p className="text-base font-medium">{company.name}</p>
        </div>
      </CardBody>
    </Card>
  )
}
