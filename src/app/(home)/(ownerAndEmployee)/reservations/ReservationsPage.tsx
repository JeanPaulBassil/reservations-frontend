'use client'

import { Button, Spacer, Spinner, useDisclosure } from '@nextui-org/react'
import React, { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Widget from '@/app/_components/shared/Widget'
import Tabs from '@/app/_components/shared/Tabs'
import { useSidebarContext } from '@/app/contexts/SidebarContext'
import { Plus, Sidebar } from 'lucide-react'
import AddReservationModal from './_components/AddReservationModal'
import { useEntity } from '@/app/contexts/EntityContext'
import { useToast } from '@/app/contexts/ToastContext'
import { useRouter } from 'next/navigation'
import useOrderedQueries from '@/hooks/useQueries'
import { ReservationQuery } from '@/api/models/Reservation'
import { parseDate } from '@internationalized/date'

const CalendarView = dynamic(() => import('./_tabPages/CalendarView').then((m) => m.default), {
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner color="success" />
    </div>
  ),
  ssr: false,
})

const ListView = dynamic(() => import('./_tabPages/ListView').then((m) => m.default), {
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner color="success" />
    </div>
  ),
  ssr: false,
})

type TabPage = 'Calendar' | 'List'

export default function ReservationsPage() {
  const { onToggle } = useSidebarContext()
  const { selectedEntityId } = useEntity()

  const { get: getQueries, set: setQueries } = useOrderedQueries<ReservationQuery>({
    date: parseDate(new Date().toLocaleDateString('en-CA')),
  })
  const router = useRouter()
  const toast = useToast()
  const {
    isOpen: isOpenCreateModal,
    onOpen: onOpenCreateModal,
    onClose: onCloseCreateModal,
  } = useDisclosure()

  const tabs = useMemo(
    () => [
      {
        label: 'List',
        id: 'List',
        component: <ListView />,
      },
      {
        label: 'Calendar',
        id: 'Calendar',
        component: <CalendarView />,
      },
    ],
    []
  )

  const [selectedTab, setSelectedTab] = useState(tabs[0].id)

  if (!selectedEntityId) {
    router.push('/entities')
    toast.error('Please select an entity')
  }

  return (
    <div className="text-secondary-950 flex h-full w-full flex-grow flex-col items-start overflow-x-hidden dark:text-white">
      <AddReservationModal
        isOpen={isOpenCreateModal}
        onClose={onCloseCreateModal}
        entityId={selectedEntityId ?? ''}
        queries={getQueries()}
      />

      {/* Widget Header */}
      <Widget className="w-full max-w-full border-2 border-gray-200 px-4 py-2">
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
              <h2 className="text-lg font-bold">Reservations</h2>
            </div>
            <Button
              radius="sm"
              className="hidden bg-[#417D7A] text-white md:flex"
              onClick={onOpenCreateModal}
              startContent={<Plus />}
            >
              Add Reservation
            </Button>
            <Button
              radius="sm"
              className="bg-[#417D7A] text-white md:hidden"
              onClick={onOpenCreateModal}
              isIconOnly
              startContent={<Plus />}
            />
          </div>

          {/* Tabs Navigation */}
          <div className="hidden w-full pl-2 sm:block">
            <Tabs
              tabs={tabs}
              selectedTab={selectedTab}
              setTab={(tabId: string) => setSelectedTab(tabId as TabPage)}
            />
          </div>
        </div>
      </Widget>

      <Spacer y={2} />

      {/* Dynamic Tab Content */}
      <div className="w-full overflow-x-auto">
        {tabs.find((tab) => tab.id === selectedTab)?.component}
      </div>
    </div>
  )
}
