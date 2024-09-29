'use client'

import React from 'react'
import { Avatar, Button, ScrollShadow, Skeleton, Spacer, Tooltip } from '@nextui-org/react'
import { Icon } from '@iconify/react'
import { useMediaQuery } from 'usehooks-ts'
import { cn } from '@/lib/utils'
import { sectionItemsWithTeams } from '../types/SidebarItems'
import Sidebar from './Sidebar'
import { Calendar, Home } from 'lucide-react'
import { SidebarProvider } from '../contexts/SidebarContext'
import { useRouter } from 'next/navigation'
import logoutAction from '../actions/logout.action'
import getAccessTokenVerifiedOrRefreshIfNeeded from '../actions/verify-and-refresh.action'
import { useUser } from '../providers/SessionProvider'

/**
 *  This example requires installing the `usehooks-ts` package:
 * `npm install usehooks-ts`
 *
 * import {useMediaQuery} from "usehooks-ts";
 *
 * 💡 TIP: You can use the usePathname hook from Next.js App Router to get the current pathname
 * and use it as the active key for the Sidebar component.
 *
 * ```tsx
 * import {usePathname} from "next/navigation";
 *
 * const pathname = usePathname();
 * const currentPath = pathname.split("/")?.[1]
 *
 * <Sidebar defaultSelectedKey="home" selectedKeys={[currentPath]} />
 * ```
 */
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
      <div className="flex h-screen w-full overflow-hidden">
        <div
          className={cn(
            'relative flex h-full w-72 flex-col !border-r-small border-divider bg-[#417D7A] p-6 transition-width',
            {
              'w-16 items-center px-2 py-6': isCompact,
            }
          )}
        >
          <div
            className={cn(
              'flex items-center gap-3 px-3',

              {
                'justify-center gap-0': isCompact,
              }
            )}
          >
              <Calendar color="white" />
            <span
              className={cn('text-small font-bold uppercase text-[#ffffff] opacity-100', {
                'w-0 opacity-0': isCompact,
              })}
            >
              Reservation
            </span>
          </div>
          <Spacer y={8} />
          <div className="flex items-center gap-3 px-3">
            <Avatar isBordered className="flex-none" size="sm" name={user?.username} isDisabled={!user}/>
            <div className={cn('flex max-w-full flex-col', { hidden: isCompact })}>
              {
                user ? (
                  <p className="truncate text-small font-medium text-[#ffffff]">{user?.username}</p>
                ) : (
                  <Skeleton className="h-4 w-full" />
                )
              }
            </div>
          </div>
          <ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
            <Sidebar
              defaultSelectedKey="home"
              isCompact={isCompact}
              items={sectionItemsWithTeams}
            />
          </ScrollShadow>
          <Spacer y={2} />
          <div
            className={cn('mt-auto flex flex-col', {
              'items-center': isCompact,
            })}
          >
            <Tooltip content="Log Out" isDisabled={!isCompact} placement="right">
              <Button
                className={cn('justify-start text-[#ffffff] data-[hover=true]:text-foreground', {
                  'justify-center': isCompact,
                })}
                isIconOnly={isCompact}
                startContent={
                  isCompact ? null : (
                    <Icon
                      className="flex-none rotate-180 text-[#ffffff]"
                      icon="solar:minus-circle-line-duotone"
                      width={24}
                    />
                  )
                }
                variant="light"
                onClick={async () => {
                  await logoutAction()
                  router.push('/login')
                }}
              >
                {isCompact ? (
                  <Icon
                    className="rotate-180 text-[#ffffff]"
                    icon="solar:minus-circle-line-duotone"
                    width={24}
                  />
                ) : (
                  'Log Out'
                )}
              </Button>
            </Tooltip>
          </div>
        </div>
        <div className="w-full flex-1 flex-col p-4">
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
