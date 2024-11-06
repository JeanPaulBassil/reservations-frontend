'use client'

import { Button, Spacer, Spinner, useDisclosure } from '@nextui-org/react'
import React, { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Widget from '@/app/_components/shared/Widget'
import Tabs from '@/app/_components/shared/Tabs'
import { useSidebarContext } from '@/app/contexts/SidebarContext'
import { Plus, Sidebar } from 'lucide-react'
import AddGuestModal from './_components/AddGuestModal'
import EditGuestModal from './_components/EditGuestModal'
import { useEntity } from '@/app/contexts/EntityContext'
import { useToast } from '@/app/contexts/ToastContext'
import { useRouter } from 'next/navigation'
import useOrderedQueries from '@/hooks/useQueries'
import { parseDate } from '@internationalized/date'

type QueryObject = {
  take: string
  page: string
  [key: string]: string
}

const Normal = dynamic(() => import('./_tabPages/Normal').then((m) => m.default), {
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner color="success" />
    </div>
  ),
  ssr: false,
})

const Blacklisted = dynamic(() => import('./_tabPages/Blacklisted').then((m) => m.default), {
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner color="success" />
    </div>
  ),
  ssr: false,
})

type TabPage = 'Normal' | 'Blacklisted'

export default function ReservationsPage() {
  const { onToggle } = useSidebarContext()
  const { selectedEntityId } = useEntity()
  const { get: getQueries, set: setQueries } = useOrderedQueries<{
    search: string
  }>({
    search: '',
  })
  const router = useRouter()
  const toast = useToast()
  const {
    isOpen: isOpenCreateModal,
    onOpen: onOpenCreateModal,
    onClose: onCloseCreateModal,
  } = useDisclosure()

  const tabs = useMemo(() => {
    return [
      {
        label: 'List',
        id: 'Normal',
        component: <Normal />,
      },
      {
        label: 'Blacklisted',
        id: 'Blacklisted',
        component: <Blacklisted />,
      },
    ]
  }, [])

  const [selectedTab, setSelectedTab] = useState(tabs[0].id)

  if (!selectedEntityId) {
    router.push('/entities')
    toast.error('Please select an entity')
  }

  return (
    <div className="text-secondary-950 flex h-full max-w-full flex-grow flex-col items-start dark:text-white">
      <AddGuestModal
        isOpen={isOpenCreateModal}
        onClose={onCloseCreateModal}
        entityId={selectedEntityId ?? ''}
        search={getQueries().search}
      />
      <Widget className="w-full border-2 border-gray-200 px-4 py-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={onToggle}
                isIconOnly
                endContent={<Sidebar />}
                variant="light"
                className="max-md:hidden"
              />
              <h2 className="text-lg font-bold">Guests</h2>
            </div>

            <Button
              radius="sm"
              className="hidden bg-[#417D7A] text-white md:flex"
              onClick={onOpenCreateModal}
              startContent={<Plus />}
            >
              Add Guest
            </Button>
            <Button
              radius="sm"
              className="bg-[#417D7A] text-white md:hidden"
              onClick={onOpenCreateModal}
              isIconOnly
              startContent={<Plus />}
            />
          </div>
          <div className="w-full pl-2">
            <Tabs
              tabs={tabs}
              selectedTab={selectedTab}
              setTab={(tabId: string) => {
                setSelectedTab(tabId as TabPage)
              }}
            />
          </div>
        </div>
      </Widget>
      <Spacer y={2} />
      <Widget className="relative w-full flex-1 overflow-x-auto">
        {tabs.find((tab) => tab.id === selectedTab)?.component}
      </Widget>
    </div>
  )
}
