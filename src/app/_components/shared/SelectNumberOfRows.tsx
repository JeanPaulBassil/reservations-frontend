'use client'

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react'
import { ChevronDown } from 'lucide-react'
export default function SelectNumberOfRows({
  rowsPerPage,
  rowsPerPageT,
  setRowsPerPage,
}: {
  rowsPerPage: number
  rowsPerPageT: (rows: number) => string
  setRowsPerPage: (value: number) => void
}) {
  return (
    <Dropdown
      classNames={{
        content: 'bg-secondary-50 dark:bg-secondary-950',
      }}
    >
      <DropdownTrigger>
        <Button
          variant="flat"
          className="bg-white text-gray-600
        dark:bg-secondary-900 dark:text-gray-400"
        >
          {rowsPerPageT(rowsPerPage)}
          <ChevronDown size={16} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Select Rows Per Page"
        selectionMode="single"
        selectedKeys={[rowsPerPage.toString()]}
        onAction={(key) => {
          setRowsPerPage(Number(key))
        }}
      >
        <DropdownItem
          key="5"
          classNames={{
            selectedIcon: 'text-primary-500',
            wrapper: 'bg-red-600',
          }}
        >
          {rowsPerPageT(5)}
        </DropdownItem>
        <DropdownItem key="10">{rowsPerPageT(10)}</DropdownItem>
        <DropdownItem key="15">{rowsPerPageT(15)}</DropdownItem>
        <DropdownItem key="20">{rowsPerPageT(20)}</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
