'use client'
import React from 'react'
import { Tabs as NextUITabs, Tab } from '@nextui-org/react'

export interface Tab {
  id: string
  label: string
}

export interface TabsProps {
  tabs: Tab[]
  setTab: (tabId: string) => void
  selectedTab: string
}

export default function Tabs(props: TabsProps) {
  return (
    <NextUITabs
      color="success"
      aria-label="Options"
      variant="light"
      classNames={{
        cursor:
          'w-full dark:bg-transparent bg-transparent shadow-none border-b-[1px] rounded-none border-[#417D7A] text-[#417D7A]',
        tab: 'max-w-fit px-0 h-8',
        tabContent:
          'group-data-[selected=true]:text-[#417D7A] dark:group-data-[selected=true]:text-[#417D7A] text-[#417D7A]',
        tabList: 'space-x-4 w-full relative rounded-none p-0',
      }}
      items={props.tabs}
      onSelectionChange={(tab) => props.setTab(tab.toString())}
      selectedKey={props.selectedTab}
    >
      {(item: Tab) => <Tab key={item.id} title={item.label}></Tab>}
    </NextUITabs>
  )
}
