'use client'

import React from 'react'
import { Card, CardHeader, CardBody, Button, Avatar, Chip, ButtonGroup, useDisclosure } from '@nextui-org/react'
import { Employee } from '@/api/models/User'
import { Armchair, Hash, Pen, Trash } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserApi } from '@/api/user.api'
import { useToast } from '@/app/contexts/ToastContext'
import { Table } from '@/api/models/Table'
import { TableApi } from '@/api/table.api'
import EditTableModal from './EditTableModal'

export default function TableProfile({ index, table }: { index: number; table: Table }) {
  const tableApi = new TableApi()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { isOpen: isOpenEditModal, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure()

  const { mutate: deleteTable, isPending } = useMutation({
    mutationFn: async () => {
      await tableApi.deleteTable(table.id)
    },
    onSuccess: () => {
      toast.success('Table deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['tables', table.entityId],
      })
      const previousTables = queryClient.getQueryData<Table[]>([
        'tables',
        table.entityId,
      ]) as Table[]
      queryClient.setQueryData(
        ['tables', table.entityId],
        previousTables.filter((t) => t.id !== table.id)
      )

      return { previousTables }
    },
  })

  return (
    <Card radius="sm" className={`my-10 h-[170px] w-[200px] ${isPending ? 'opacity-50' : ''}`}>
      <EditTableModal isOpen={isOpenEditModal} onClose={onCloseEditModal} table={table} />
      <CardHeader className="relative flex items-center justify-between overflow-visible bg-gradient-to-br from-[#92d7d3] via-[#59b6b2] to-[#0e958f]">
        <div className="flex items-center justify-center">
          <Hash size={16} color="white" />
          <p className="text-base font-medium text-white">{table.tableNumber}</p>
        </div>
        <ButtonGroup>
          <Button
            radius="sm"
            size="sm"
            variant="light"
            endContent={<Pen color="white" size={16} />}
            isIconOnly
            onClick={onOpenEditModal}
          ></Button>
          <Button
            radius="sm"
            size="sm"
            variant="light"
            endContent={<Trash color="white" size={16} />}
            isIconOnly
            onClick={() => deleteTable()}
          ></Button>
        </ButtonGroup>
      </CardHeader>
      <CardBody>
        <Chip
          startContent={<Armchair size={20} />}
          className="p-2 text-base font-medium"
          radius="sm"
          variant="dot"
          color="success"
        >
          {table.numberOfSeats}
        </Chip>
      </CardBody>
    </Card>
  )
}
