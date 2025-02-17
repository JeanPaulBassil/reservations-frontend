'use client'

import React from 'react'
import {
  Avatar,
  Button,
  ScrollShadow,
  Spacer,
  Input,
  Chip,
  Image,
} from '@heroui/react'
import { Icon } from '@iconify/react'

import Sidebar, { SidebarItem } from './Sidebar'

export const brandItems: SidebarItem[] = [
  {
    key: 'overview',
    title: 'Overview',
    items: [
      {
        key: 'home',
        href: '#',
        icon: 'solar:home-2-linear',
        title: 'Home',
      },
      // {
      //   key: 'projects',
      //   href: '#',
      //   icon: 'solar:widget-2-outline',
      //   title: 'Projects',
      //   endContent: (
      //     <Icon
      //       className="text-primary-foreground/60"
      //       icon="solar:add-circle-line-duotone"
      //       width={24}
      //     />
      //   ),
      // },
      // {
      //   key: 'tasks',
      //   href: '#',
      //   icon: 'solar:checklist-minimalistic-outline',
      //   title: 'Tasks',
      //   endContent: (
      //     <Icon
      //       className="text-primary-foreground/60"
      //       icon="solar:add-circle-line-duotone"
      //       width={24}
      //     />
      //   ),
      // },
      // {
      //   key: 'team',
      //   href: '#',
      //   icon: 'solar:users-group-two-rounded-outline',
      //   title: 'Team',
      // },
      // {
      //   key: 'tracker',
      //   href: '#',
      //   icon: 'solar:sort-by-time-linear',
      //   title: 'Tracker',
      //   endContent: (
      //     <Chip
      //       className="bg-primary-foreground font-medium text-primary"
      //       size="sm"
      //       variant="flat"
      //     >
      //       New
      //     </Chip>
      //   ),
      // },
    ],
  },
  // {
  //   key: 'your-teams',
  //   title: 'Your Teams',
  //   items: [
  //     {
  //       key: 'heroui',
  //       href: '#',
  //       title: 'HeroUI',
  //       startContent: (
  //         <TeamAvatar
  //           classNames={{
  //             base: 'border-1 border-primary-foreground/20',
  //             name: 'text-primary-foreground/80',
  //           }}
  //           name="Hero UI"
  //         />
  //       ),
  //     },
  //     {
  //       key: 'tailwind-variants',
  //       href: '#',
  //       title: 'Tailwind Variants',
  //       startContent: (
  //         <TeamAvatar
  //           classNames={{
  //             base: 'border-1 border-primary-foreground/20',
  //             name: 'text-primary-foreground/80',
  //           }}
  //           name="Tailwind Variants"
  //         />
  //       ),
  //     },
  //     {
  //       key: 'heroui-pro',
  //       href: '#',
  //       title: 'HeroUI Pro',
  //       startContent: (
  //         <TeamAvatar
  //           classNames={{
  //             base: 'border-1 border-primary-foreground/20',
  //             name: 'text-primary-foreground/80',
  //           }}
  //           name="HeroUI Pro"
  //         />
  //       ),
  //     },
  //   ],
  // },
]
/**
 * 💡 TIP: You can use the usePathname hook from Next.js App Router to get the current pathname
 * and use it as the active key for the Sidebar component.
 *
 * ```tsx
 * import {usePathname} from "next/navigation";
 *
 * const pathname = usePathname();
 * const currentPath = pathname.split("/")?.[1]
 *
 * <Sidebar defaultSelectedKey="home" selectedKeys={[th]} />
 * ```
 */
export default function AppWrapper() {
  return (
    <div className="h-full min-h-[48rem]">
      <div className="relative flex h-full w-72 flex-1 flex-col bg-[#FF5757] p-6">
        <div className="flex items-center gap-2 px-2">
          <Avatar src="/logo.png" alt="logo" size='sm' />
          <span className="text-small font-medium uppercase text-primary-foreground">
            KLYO ASO
          </span>
        </div>

        <Spacer y={8} />

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <Avatar
              size="sm"
              src="https://i.pravatar.cc/150?u=a04258114e29028708c"
            />
            <div className="flex flex-col">
              <p className="text-small text-primary-foreground">Jane Doe</p>
              <p className="text-tiny text-primary-foreground/60">
                Product Designer
              </p>
            </div>
          </div>
        </div>

        <ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
          <Sidebar
            defaultSelectedKey="home"
            iconClassName="text-primary-foreground/60 group-data-[selected=true]:text-primary-foreground"
            itemClasses={{
              title:
                'text-primary-foreground/60 group-data-[selected=true]:text-primary-foreground',
            }}
            items={brandItems}
            sectionClasses={{
              heading: 'text-primary-foreground/80',
            }}
            variant="flat"
          />
        </ScrollShadow>

        <Spacer y={8} />

        <div className="mt-auto flex flex-col">
          <Button
            fullWidth
            className="justify-start text-primary-foreground/60 data-[hover=true]:text-primary-foreground"
            startContent={
              <Icon
                className="text-primary-foreground/60"
                icon="solar:info-circle-line-duotone"
                width={24}
              />
            }
            variant="light"
          >
            Help & Information
          </Button>
          <Button
            className="justify-start text-primary-foreground/60 data-[hover=true]:text-primary-foreground"
            startContent={
              <Icon
                className="rotate-180 text-primary-foreground/60"
                icon="solar:minus-circle-line-duotone"
                width={24}
              />
            }
            variant="light"
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  )
}
