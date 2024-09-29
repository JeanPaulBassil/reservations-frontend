'use client'
import Widget from '@/app/_components/shared/Widget'
import { useSidebarContext } from '@/app/contexts/SidebarContext'
import { Button } from '@nextui-org/button'
import { useDisclosure } from '@nextui-org/modal'
import { Plus, Search, Sidebar } from 'lucide-react'
import React, { useState } from 'react'
import AddUserModal from './_components/AddCompanyModal'
import { Input, Spacer, Spinner } from '@nextui-org/react'
import UserProfile from './_components/CompanyProfile'
import { useQuery } from '@tanstack/react-query'
import { UserApi } from '@/api/user.api'
import { User } from '@/api/models/User'
import useOrderedQueries from '@/hooks/useQueries'
import useDebouncedCallback from '@/hooks/useDebounceCallback'
import { ServerError } from '@/api/utils'
import { CompanyApi } from '@/api/company.api'
import { Company } from '@/api/models/Company'
import AddCompanyModal from './_components/AddCompanyModal'
import CompanyProfile from './_components/CompanyProfile'

const page = () => {
  const { onToggle } = useSidebarContext()
  const companyApi = new CompanyApi()

  const {
    isOpen: isOpenCreateModal,
    onOpen: onOpenCreateModal,
    onClose: onCloseCreateModal,
  } = useDisclosure()

  const {
    data: companies,
    isLoading,
    isError,
    error,
  } = useQuery<Company[], ServerError>({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await companyApi.getCompanies()
      return response.payload
    },
  })

  return (
    <div className="h-screen">
      <AddCompanyModal isOpen={isOpenCreateModal} onClose={onCloseCreateModal} />
      <Widget className="border-2 border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={onToggle}
              isIconOnly
              endContent={<Sidebar />}
              variant="light"
              className="max-md:hidden"
            />
            <h2 className="text-lg font-bold">Companies</h2>
          </div>
          <Button
            radius="sm"
            className="hidden bg-[#417D7A] text-white md:flex"
            onClick={onOpenCreateModal}
            startContent={<Plus />}
          >
            Add Company
          </Button>
          <Button
            radius="sm"
            className="bg-[#417D7A] text-white md:hidden"
            onClick={onOpenCreateModal}
            isIconOnly
            startContent={<Plus />}
          />
        </div>
      </Widget>
      <Spacer y={2} />
      <Widget className="flex h-[calc(100vh-6rem)] flex-col border-2 border-gray-200 px-5 pt-4">
        <div className="flex flex-wrap gap-4">
          {isLoading ? (
            <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
              <Spinner color="success" />
            </div>
          ) : (
            companies?.length === 0 ? <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
              <p className="text-lg text-gray-500">No companies found</p>
            </div> :
            companies?.map((company) => <CompanyProfile key={company.id} company={company} />)
          )}
        </div>
      </Widget>
    </div>
  )
}

export default page
