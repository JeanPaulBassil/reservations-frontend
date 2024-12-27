'use client'
import Widget from '@/app/_components/shared/Widget'
import { useSidebarContext } from '@/app/contexts/SidebarContext'
import { Button } from '@nextui-org/button'
import { useDisclosure } from '@nextui-org/modal'
import { Link, Loader2, Pen, Pencil, Plus, Search, SearchIcon, Sidebar, Trash } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import {
  Chip,
  cn,
  Input,
  Pagination,
  Spacer,
  Spinner,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { useQuery } from '@tanstack/react-query'
import useOrderedQueries from '@/hooks/useQueries'
import useDebouncedCallback from '@/hooks/useDebounceCallback'
import { ApiResponse, ServerError } from '@/api/utils'
import { CompanyApi } from '@/api/company.api'
import { Company } from '@/api/models/Company'
import AddCompanyModal from './_components/AddCompanyModal'
import CompanyProfile from './_components/CompanyProfile'
import ErrorBlock from '@/app/_components/shared/ErrorBlock'
import Table from '@/app/_components/shared/Table'
import SelectNumberOfRows from '@/app/_components/shared/SelectNumberOfRows'
import DeleteConfirmationModal from './_components/DeleteConfirmationModal'
import useAppMutation from '@/app/hooks/useAppHook'
import { UserRole } from '@/api/models/User'
import EditCompanyModal from './_components/EditCompanyModal'

const INITIAL_VISIBLE_COLUMNS = ['name', 'actions']

export const columns = [
  { name: 'Name', uid: 'name' },
  { name: 'Actions', uid: 'actions' },
]

const CompaniesClientPage = () => {
  const { onToggle } = useSidebarContext()
  const companyApi = new CompanyApi()
  const { get: getQuery, set: setQuery } = useOrderedQueries({
    name: '',
    page: '1',
    take: '5',
    offset: '0',
  })
  const [searchValue, setSearchValue] = useState('')
  const debouncedSearch = useDebouncedCallback(setSearchValue, 500)
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)
  const [companyToUpdate, setCompanyToUpdate] = useState<Company | null>(null)

  const {
    isOpen: isOpenCreateModal,
    onOpen: onOpenCreateModal,
    onClose: onCloseCreateModal,
  } = useDisclosure()

  const {
    isOpen: isOpenDeleteModal,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal,
  } = useDisclosure()

  const {
    isOpen: isOpenEditModal,
    onOpen: onOpenEditModal,
    onClose: onCloseEditModal,
  } = useDisclosure()

  const {
    data: companies,
    isLoading: isLoadingCompanies,
    isError: isErrorCompanies,
    error: errorCompanies,
  } = useQuery<ApiResponse<Company[]>, ServerError>({
    queryKey: ['companies', getQuery()],
    queryFn: async () => {
      const response = await companyApi.getCompanies({
        queries: getQuery(),
      })
      return response.payload as unknown as ApiResponse<Company[]>
    },
  })

  const setPage = (value: number) => {
    setQuery({ page: value.toString() })
  }

  const rows = useMemo(() => {
    if (!companies || !companies.payload) return []
    const formatDate = (date: string) => new Date(date).toLocaleDateString()
    return companies.payload.map((company: Company) => {
      return {
        id: Number(company.id),
        name: company.name,
        ownerUsername: company.users.find((user) => user.role === UserRole.OWNER)?.username,
        numberOfEntities: company.entities?.length || 0,
        actions: [
          {
            label: 'Edit',
            icon: <Pencil className="text-primary" width={18} strokeWidth={1.2} />,
            onClick: () => {
              setCompanyToUpdate(company)
              onOpenEditModal()
            },
          },
          {
            label: 'Delete',
            icon: <Trash className="text-primary" width={18} strokeWidth={1.2} />,
            onClick: () => {
              setCompanyToDelete(company)
              onOpenDeleteModal()
            },
          },
        ],
      }
    })
  }, [companies])

  const columns = useMemo(() => {
    return [
      {
        key: 'name',
        label: 'Name',
      },
      {
        key: 'ownerUsername',
        label: 'Owner Username',
      },
      {
        key: 'numberOfEntities',
        label: 'Number of Entities',
      },
      {
        key: 'actions',
        label: 'Actions',
      },
    ] as const
  }, [])

  const setRowsPerPage = (value: number) => {
    setQuery({ take: value.toString(), page: '1' })
  }

  const useDeleteCompany = () => {
    return useAppMutation<Company, { id: string }, Company>({
      mutationFn: async ({ id }) => {
        const response = await companyApi.deleteCompany(id)
        return response.payload
      },
      queryKey: ['companies'],
      successMessage: 'Company deleted successfully!',
      onSuccessCallback: () => {
        onCloseDeleteModal()
        setCompanyToDelete(null)
      },
      errorMessage: 'Failed to delete company. Please try again.',
    })
  }

  const { mutateAsync: deleteCompany, isPending: isDeletingCompany } = useDeleteCompany()

  console.log(companies)
  return (
    <div className="h-screen">
      <DeleteConfirmationModal
        isLoading={isDeletingCompany}
        isOpen={isOpenDeleteModal}
        onClose={onCloseDeleteModal}
        onDelete={() => {
          deleteCompany({ id: companyToDelete?.id.toString() ?? '' })
        }}
        message={`Are you sure you want to delete ${companyToDelete?.name}? Deleting this company will also
        delete all the items in it. This will also delete all the users, entities, guests, and reservations in this company. This action cannot be undone.`}
        assetBeingDeleted="company"
      />
      <EditCompanyModal
        isOpen={isOpenEditModal}
        onClose={onCloseEditModal}
        companyToUpdate={companyToUpdate}
        setCompanyToUpdate={setCompanyToUpdate}
      />
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
        <div className="flex w-full justify-between">
          <Input
            type="text"
            placeholder="Search by company name"
            size="sm"
            radius="sm"
            variant="bordered"
            value={searchValue}
            onClear={() => {
              setSearchValue('')
              setQuery({ name: '', page: '1', take: getQuery().take })
            }}
            onChange={(e) => {
              const value = e.target.value
              setSearchValue(value)
              debouncedSearch(value)
            }}
            className="max-w-xs"
            classNames={{
              base: ['bg-transparent', 'shadow-none'],
              inputWrapper: [
                'bg-white dark:bg-secondary-900',
                'shadow-none',
                'border-[1px] group-data-[focus=true]:border-2 group-data-[focus=true]:border-primary-600 dark:group-data-[focus=true]:border-primary-600',
                'bg-white dark:bg-secondary-900',
                'border-secondary-200 dark:border-secondary-700',
                'text-secondary-600 dark:text-secondary-50',
                'placeholder:text-secondary-400 dark:placeholder:text-secondary-400',
                'transition-colors duration-200 ease-in-out',
              ],
              clearButton: ['text-secondary-300'],
            }}
            isClearable
            startContent={<Search className="text-secondary-400" size={18} strokeWidth={1} />}
          />
        </div>
        <div className="flex w-full justify-between">
          <p className="mt-4 text-small italic text-gray-400">
            Total companies: {companies?.meta?.itemCount ?? 0}
          </p>
          <SelectNumberOfRows
            rowsPerPageT={(rows: number) => `${rows} rows per page`}
            rowsPerPage={Number(getQuery().take)}
            setRowsPerPage={setRowsPerPage}
          />
        </div>
        <Spacer y={4} />
        {isErrorCompanies ? (
          <ErrorBlock error={errorCompanies} />
        ) : (
          <Table
            columns={columns}
            rows={rows}
            setPage={setPage}
            currentPage={Number(getQuery().page)}
            isLoading={isLoadingCompanies}
            totalPages={(companies?.meta?.itemCount || 0) / Number(getQuery().take)}
            emptyContent="No companies found"
            ariaLabel="Companies Table"
          />
        )}
      </Widget>
    </div>
  )
}

export default CompaniesClientPage
