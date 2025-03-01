'use client'
import Widget from '@/app/_components/shared/Widget'
import { useSidebarContext } from '@/app/contexts/SidebarContext'
import { Button } from '@nextui-org/button'
import { useDisclosure } from '@nextui-org/modal'
import {
  Check,
  Copy,
  DeleteIcon,
  EditIcon,
  EyeIcon,
  PencilIcon,
  Plus,
  Search,
  Sidebar,
  TrashIcon,
  X,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {
  getKeyValue,
  Input,
  Link,
  Spacer,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from '@nextui-org/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ServerError } from '@/api/utils'
import { useUser } from '@/app/providers/SessionProvider'
import useOrderedQueries from '@/hooks/useQueries'
import useDebouncedCallback from '@/hooks/useDebounceCallback'
import { useEntity } from '@/app/contexts/EntityContext'
import { GuestApi } from '@/api/guest.api'
import { Guest } from '@/api/models/Guest'
import { useRouter } from 'next/navigation'
import { useToast } from '@/app/contexts/ToastContext'
import EditGuestModal from '../_components/EditGuestModal'

interface BlacklistedProps {
  search?: string;
}

const Blacklisted = ({ search = '' }: BlacklistedProps) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { onToggle } = useSidebarContext()
  const guestApi = new GuestApi()
  const { user } = useUser()
  const [searchValue, setSearchValue] = useState<string>(search)
  const { selectedEntityId } = useEntity()
  const [guest, setGuest] = useState<Guest | null>(null)
  const { get: getQueries, set: setQueries } = useOrderedQueries<{
    search: string
  }>({
    search: '',
  })

  const debounceSearch = useDebouncedCallback((value: string) => {
    setQueries({ search: value })
  }, 500)

  const {
    isOpen: isOpenEditModal,
    onOpen: onOpenEditModal,
    onClose: onCloseEditModal,
  } = useDisclosure()

  const { data: guests, isLoading } = useQuery<Guest[], ServerError>({
    queryKey: ['guests', getQueries().search, selectedEntityId, 'blacklisted'],
    queryFn: async () => {
      const response = await guestApi.getGuests(getQueries().search, selectedEntityId ?? '', true)
      return response.payload
    },
    enabled: !!selectedEntityId,
  })

  const { mutate: deleteGuest, isPending } = useMutation({
    mutationFn: async (guestId: string) => {
      await guestApi.deleteGuest(guestId)
    },
    onSuccess: () => {
      toast.success('Guest deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onMutate: async (guestId: string) => {
      await queryClient.cancelQueries({
        queryKey: ['guests', getQueries().search, selectedEntityId, 'blacklisted'],
      })
      const previousGuests = queryClient.getQueryData<Guest[]>([
        'guests',
        getQueries().search,
        selectedEntityId,
        'blacklisted',
      ]) as Guest[]
      queryClient.setQueryData(
        ['guests', getQueries().search, selectedEntityId, 'blacklisted'],
        previousGuests.filter((c) => c.id !== guestId)
      )

      return { previousGuests }
    },
  })

  const { mutate: unblacklistGuest, isPending: isUnblacklisting } = useMutation({
    mutationFn: async (guestId: string) => {
      await guestApi.update({ isBlacklisted: false }, guestId)
    },
    onSuccess: () => {
      toast.success('Guest unblacklisted successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onMutate: async (guestId: string) => {
      await queryClient.cancelQueries({
        queryKey: ['guests', getQueries().search, selectedEntityId, 'blacklisted'],
      })
      const previousGuests = queryClient.getQueryData<Guest[]>([
        'guests',
        getQueries().search,
        selectedEntityId,
        'blacklisted',
      ]) as Guest[]
      queryClient.setQueryData(
        ['guests', getQueries().search, selectedEntityId, 'blacklisted'],
        previousGuests.filter((c) => c.id !== guestId)
      )

      return { previousGuests }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['guests', getQueries().search, selectedEntityId, 'blacklisted'],
      })

      queryClient.invalidateQueries({
        queryKey: ['guests', getQueries().search, selectedEntityId],
      })
    },
  })

  useEffect(() => {
    // Fetch blacklisted guests with the search parameter
    if (selectedEntityId) {
      fetchGuests(searchValue);
    }
  }, [selectedEntityId, searchValue]);

  const fetchGuests = async (searchTerm: string) => {
    // ... loading state
    try {
      const response = await guestApi.getGuests(searchTerm, selectedEntityId || '', true);
      // ... handle response
    } catch (error) {
      // ... handle error
    } finally {
      // ... finish loading
    }
  };

  const renderCell = React.useCallback((guest: Guest, columnKey: string) => {
    const cellValue = guest[columnKey as keyof Guest]

    switch (columnKey) {
      case 'actions':
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Unblacklist" color="success" className="text-[#ffffff]" size="sm">
              <Button
                isIconOnly
                size="sm"
                radius="sm"
                variant="light"
                onClick={() => {
                  unblacklistGuest(guest.id)
                }}
              >
                <Check color="green" size={16} />
              </Button>
            </Tooltip>
            <Tooltip content="Edit user" size="sm">
              <Button
                color="success"
                isIconOnly
                size="sm"
                radius="sm"
                variant="light"
                className="cursor-pointer text-lg text-default-400 active:opacity-50"
                onClick={() => {
                  setGuest(guest)
                  onOpenEditModal()
                }}
              >
                <PencilIcon size={16} />
              </Button>
            </Tooltip>
            <Tooltip color="danger" content="Delete user" size="sm">
              <Button
                onClick={() => {
                  deleteGuest(guest.id)
                }}
                color="danger"
                isIconOnly
                size="sm"
                radius="sm"
                variant="light"
                className="cursor-pointer text-lg text-danger active:opacity-50"
              >
                <TrashIcon size={16} />
              </Button>
            </Tooltip>
          </div>
        )
      case 'email':
        return cellValue ? (
          <div className="flex items-center gap-2">
            <Link
              href={`mailto:${cellValue as string}`}
              className="text-md transition-all duration-300 ease-in-out hover:text-primary-500 hover:underline"
            >
              {cellValue as string}
            </Link>
            <Button
              isIconOnly
              size="sm"
              radius="sm"
              variant="light"
              className="cursor-pointer text-lg text-default-400 active:opacity-50"
              onClick={() => {
                navigator.clipboard.writeText(cellValue as string)
                toast.success('Email copied to clipboard')
              }}
            >
              <Copy size={16} color="grey" />
            </Button>
          </div>
        ) : (
          'No email'
        )
      case 'phone':
        return cellValue ? (
          <div className="flex items-center gap-2">
            <Link
              href={`tel:${cellValue as string}`}
              className="text-md transition-all duration-300 ease-in-out hover:text-primary-500 hover:underline"
            >
              {cellValue as string}
            </Link>
            <Button
              isIconOnly
              size="sm"
              radius="sm"
              variant="light"
              className="cursor-pointer text-lg text-default-400 active:opacity-50"
              onClick={() => {
                navigator.clipboard.writeText(cellValue as string)
                toast.success('Phone number copied to clipboard')
              }}
            >
              <Copy size={16} color="grey" />
            </Button>
          </div>
        ) : (
          'No phone number'
        )
      default:
        return cellValue
    }
  }, [])

  if (!user?.companyId) {
    return (
      <div className="h-screen">
        <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
          <Spinner color="success" />
        </div>
      </div>
    )
  }

  if (!selectedEntityId) {
    router.push('/entities')
    toast.error('Please select an entity')
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    {
      key: 'actions',
      label: 'Actions',
    },
  ]

  return (
    <div className="h-screen">
      <EditGuestModal
        isOpen={isOpenEditModal}
        onClose={onCloseEditModal}
        guest={guest as Guest}
        selectedEntityId={selectedEntityId ?? ''}
        search={getQueries().search}
      />
      <Widget className="flex h-[calc(100vh-6rem)] flex-col border-2 border-gray-200 px-5 pt-4">
        <div className="flex items-center justify-between">
          <Input
            placeholder="Search"
            variant="bordered"
            radius="sm"
            className="max-w-xs"
            startContent={<Search />}
            onChange={(e) => {
              setSearchValue(e.target.value)
              debounceSearch(e.target.value)
            }}
            value={searchValue}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          {!guests ? (
            <div className="flex h-[calc(100vh-6rem)] w-full items-center justify-center">
              <Spinner color="success" />
            </div>
          ) : (
            <Table aria-label="Example table with dynamic content" className="mt-5" removeWrapper>
              <TableHeader columns={columns}>
                {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
              </TableHeader>
              <TableBody
                items={guests}
                emptyContent={
                  <div className="flex w-full items-center justify-center">
                    <h2>No guests found</h2>
                  </div>
                }
              >
                {(item) => (
                  <TableRow key={item.id}>
                    {/* @ts-expect-error */}
                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Widget>
    </div>
  )
}

export default Blacklisted
