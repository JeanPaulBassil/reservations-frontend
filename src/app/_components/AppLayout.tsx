'use client'

import React from 'react'
import { Avatar, Button, ScrollShadow, Skeleton, Spacer, Tooltip } from '@nextui-org/react'
import { Icon } from '@iconify/react'
import { useMediaQuery } from 'usehooks-ts'
import { cn } from '@/lib/utils'
import { sectionItemsWithTeams } from '../types/SidebarItems'
import Sidebar from './Sidebar'
import { Calendar } from 'lucide-react'
import { SidebarProvider } from '../contexts/SidebarContext'
import { useRouter } from 'next/navigation'
import logoutAction from '../actions/logout.action'
import { useUser } from '../providers/SessionProvider'

export default function Component({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(true)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const router = useRouter()
  const { user, loading } = useUser()
  const isCompact = isCollapsed || isMobile

  const onToggle = React.useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  return (
    <SidebarProvider onToggle={onToggle}>
      <div className="flex h-[100dvh] w-screen overflow-hidden">
        {/* Sidebar with responsive behavior */}
        <div
          className={cn(
            'relative flex flex-col border-r border-divider bg-[#417D7A] transition-all',
            isCompact ? 'w-16 items-center p-4' : 'w-72 p-6'
          )}
        >
          {/* Header with Calendar Icon */}
          <div
            className={cn('flex items-center gap-3 px-3', { 'justify-center gap-0': isCompact })}
          >
            <Calendar color="white" />
            <span
              className={cn('text-small font-bold uppercase text-white', { hidden: isCompact })}
            >
              Reservation
            </span>
          </div>

          {/* Spacer and User Info */}
          <Spacer y={8} />
          <div className="flex items-center gap-3 px-3">
            <Avatar
              isBordered
              className="flex-none"
              size="sm"
              name={user?.username}
              isDisabled={!user}
            />
            {!isCompact && (
              <div className="flex max-w-full flex-col">
                {user ? (
                  <p className="truncate text-small font-medium text-white">{user?.username}</p>
                ) : (
                  <Skeleton className="h-4 w-full" />
                )}
              </div>
            )}
          </div>

          {/* Sidebar Scrollable Content */}
          <ScrollShadow className="flex-1 overflow-y-auto py-6">
            <Sidebar
              defaultSelectedKey="home"
              isCompact={isCompact}
              items={sectionItemsWithTeams}
            />
          </ScrollShadow>

          {/* Logout Button */}
          <Spacer y={2} />
          <div className={cn('mt-auto flex', { 'items-center': isCompact })}>
            <Tooltip content="Log Out" isDisabled={!isCompact} placement="right">
              <Button
                className="text-white"
                isIconOnly={isCompact}
                endContent={
                  !isCompact && (
                    <p>Log Out</p>
                  )
                }
                variant="light"
                onClick={async () => {
                  await logoutAction()
                  router.push('/login')
                }}
              >
                <Icon
                  className="rotate-180 text-white"
                  icon="solar:minus-circle-line-duotone"
                  width={24}
                />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-x-hidden p-4">{children}</div>
      </div>
    </SidebarProvider>
  )
}
