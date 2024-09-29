'use client'

import {
  Accordion,
  AccordionItem,
  Spinner,
  type ListboxProps,
  type ListboxSectionProps,
  type Selection,
} from '@nextui-org/react'
import React from 'react'
import { Listbox, Tooltip, ListboxItem, ListboxSection } from '@nextui-org/react'
import { cn } from '@/lib/utils'
import { UserRole } from '@/api/models/User'
import { useUser } from '../providers/SessionProvider'

export enum SidebarItemType {
  Nest = 'nest',
}

export type SidebarItem = {
  key: string
  title: string
  icon?: React.ReactNode
  href?: string
  type?: SidebarItemType.Nest
  startContent?: React.ReactNode
  endContent?: React.ReactNode
  items?: SidebarItem[]
  className?: string
  allowedRoles: UserRole[]
}

export type SidebarProps = Omit<ListboxProps<SidebarItem>, 'children'> & {
  items: SidebarItem[]
  isCompact?: boolean
  hideEndContent?: boolean
  iconClassName?: string
  sectionClasses?: ListboxSectionProps['classNames']
  classNames?: ListboxProps['classNames']
  defaultSelectedKey: string
  onSelect?: (key: string) => void
}

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      items,
      isCompact,
      defaultSelectedKey,
      onSelect,
      hideEndContent,
      sectionClasses: sectionClassesProp = {},
      itemClasses: itemClassesProp = {},
      iconClassName,
      classNames,
      className,
      ...props
    },
    ref
  ) => {
    const [selected, setSelected] = React.useState<React.Key>(defaultSelectedKey)
    const { user } = useUser()
    console.log("in sidebar", user)
    const itemClasses = {
      ...itemClassesProp,
      base: cn(itemClassesProp?.base, {
        'w-11 h-11 gap-0 p-0': isCompact,
      }),
    }

    const renderItem = React.useCallback(
      (item: SidebarItem) => {
        const isNestType =
          item.items && item.items?.length > 0 && item?.type === SidebarItemType.Nest

        return (
          <ListboxItem
            {...item}
            key={item.key}
            endContent={isCompact || hideEndContent ? null : item.endContent ?? null}
            startContent={isCompact ? null : item.icon ? item.icon : item.startContent ?? null}
            textValue={item.title}
            title={isCompact ? null : item.title}
          >
            {isCompact ? (
              <Tooltip content={item.title} placement="right">
                <div className="flex w-full items-center justify-center">
                  {item.icon ? item.icon : item.startContent ?? null}
                </div>
              </Tooltip>
            ) : null}
          </ListboxItem>
        )
      },
      [isCompact, hideEndContent, iconClassName, itemClasses?.base]
    )

    if (!user) {
      return (
        <div className="flex items-center justify-center h-full">
          <Spinner />
        </div>
      )
    }

    const actualItems = items.filter((item) => {
      console.log("item", item)
      console.log("in actual items", item.allowedRoles, user.role)
      return item.allowedRoles.includes(user.role)
    })

    return (
      <Listbox
        key={isCompact ? 'compact' : 'default'}
        ref={ref}
        hideSelectedIcon
        as="nav"
        className={cn('list-none', className)}
        classNames={{
          ...classNames,
          list: cn('items-center', classNames?.list),
        }}
        color="default"
        itemClasses={{
          ...itemClasses,
          base: cn(
            'px-3 min-h-11 rounded-large h-[44px] data-[selected=true]:bg-default-100',
            itemClasses?.base
          ),
          title: cn(
            'text-small font-medium text-[#ffffff] group-data-[selected=true]:text-foreground',
            itemClasses?.title
          ),
        }}
        items={actualItems}
        selectedKeys={[selected] as unknown as Selection}
        selectionMode="single"
        variant="flat"
        onSelectionChange={(keys) => {
          const key = Array.from(keys)[0]

          setSelected(key as React.Key)
          onSelect?.(key as string)
        }}
        {...props}
      >
        {actualItems.map((item) => {
          return renderItem(item)
        })}
      </Listbox>
    )
  }
)

Sidebar.displayName = 'Sidebar'

export default Sidebar
