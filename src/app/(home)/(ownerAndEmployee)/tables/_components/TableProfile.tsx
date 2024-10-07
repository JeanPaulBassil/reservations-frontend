'use client'

import React from 'react'
import { Card, CardHeader, CardBody, Button, Avatar } from '@nextui-org/react'
import { Employee } from '@/api/models/User'
import { Trash } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserApi } from '@/api/user.api'
import { useToast } from '@/app/contexts/ToastContext'
import { Table } from '@/api/models/Table'
import { TableApi } from '@/api/table.api'

export default function TableProfile({
  index,
  table,
}: {
  index: number
  table: Table
}) {
  const tableApi = new TableApi()
  const toast = useToast()
  const queryClient = useQueryClient()

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
      const previousTables = queryClient.getQueryData<Table[]>(['tables', table.entityId]) as Table[]
      queryClient.setQueryData(
        ['tables', table.entityId],
        previousTables.filter((t) => t.id !== table.id)
      )

      return { previousTables }
    },
  })

  return (
    <Card className={`my-10 h-[170px] w-[200px] ${isPending ? 'opacity-50' : ''}`}>
      <CardHeader className="relative flex items-center justify-between overflow-visible bg-gradient-to-br from-[#92d7d3] via-[#59b6b2] to-[#0e958f]">
        <Avatar name={`${table.tableNumber}`} />
        <Button
          radius="full"
          size="sm"
          variant="light"
          endContent={<Trash color="white" />}
          isIconOnly
          onClick={() => deleteTable()}
        ></Button>
      </CardHeader>
      <CardBody>
        <div className="py-2">
          <p className="text-base font-medium">Table {table.tableNumber}</p>
        </div>
      </CardBody>
    </Card>
  )
}
