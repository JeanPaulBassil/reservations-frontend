import React from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tooltip,
} from '@nextui-org/react'
import {
  CheckCircle,
  Ellipsis,
  EllipsisVertical,
  FileText,
  MapPin,
  Pencil,
  Trash,
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/app/contexts/ToastContext'
import { Entity } from '@/api/models/Entity'
import { EntityApi } from '@/api/entity.api'
import DoughnutChart from './DoughnutChart'
import { ChartOptions } from 'chart.js'
import EditEntityModal from './EditEntityModal'
import { useEntity } from '@/app/contexts/EntityContext'

export default function EntityProfile({ entity }: { entity: Entity }) {
  const entityApi = new EntityApi()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure()
  const { setSelectedEntityId, selectedEntityId } = useEntity()

  const { mutate: deleteEntity, isPending } = useMutation({
    mutationFn: async () => {
      await entityApi.deleteEntity(entity.id)
    },
    onSuccess: () => {
      toast.success('Entity deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['entities'],
      })
      const previousEntities = queryClient.getQueryData<Entity[]>(['entities']) as Entity[]
      queryClient.setQueryData(
        ['entities'],
        previousEntities.filter((c) => c.id !== entity.id)
      )

      return { previousEntities }
    },
  })

  const onEditEntity = () => {
    onEditOpen()
  }
  // Set data and options for the doughnut chart
  const data = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
    datasets: [
      {
        label: '# of Votes',
        data: [12, 19, 3, 5, 2],
        backgroundColor: ['red', 'blue', 'yellow', 'green', 'purple'],
        borderColor: ['red', 'blue', 'yellow', 'green', 'purple'],
        borderWidth: 1,
      },
    ],
  }

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false, // Ensure the chart adjusts properly
    plugins: {
      tooltip: {
        enabled: true,
      },
      legend: {
        display: true,
      },
    },
  }

  return (
    <Card className={`my-10 w-auto hover:cursor-pointer ${isPending ? 'opacity-50' : ''}`}>
      <EditEntityModal isOpen={isEditOpen} onClose={onEditOpenChange} entity={entity} />
      <CardHeader
        className={`relative flex items-center justify-between overflow-visible transition-all duration-300 ease-in-out ${selectedEntityId === entity.id ? 'bg-[#417D7A]' : ''}`}
      >
        <div className="flex flex-col items-start gap-2 text-white">
          <div className="flex items-center gap-2">
            <FileText color={selectedEntityId === entity.id ? 'white' : 'black'} />
            <p
              className={`text-lg font-bold ${selectedEntityId === entity.id ? 'text-white' : 'text-black'}`}
            >
              {entity.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MapPin color={selectedEntityId === entity.id ? 'white' : 'black'} />
            <p
              className={`text-sm ${selectedEntityId === entity.id ? 'text-white' : 'text-black'}`}
            >
              {entity.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content="Select entity" delay={200}>
            <Button
              radius="sm"
              size="sm"
              variant="light"
              endContent={
                <CheckCircle color={selectedEntityId === entity.id ? 'white' : 'black'} />
              }
              isIconOnly
              onClick={() => setSelectedEntityId(entity.id)}
            ></Button>
          </Tooltip>
          <Dropdown placement="bottom-end" className="p-0">
            <DropdownTrigger>
              <Button
                radius="sm"
                size="sm"
                variant="light"
                endContent={
                  <EllipsisVertical color={selectedEntityId === entity.id ? 'white' : 'black'} />
                }
                isIconOnly
              ></Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                className="flex flex-row justify-center"
                onClick={() => onEditEntity()}
                startContent={<Pencil color="green" />}
              >
                <p className="text-green">Edit</p>
              </DropdownItem>
              <DropdownItem
                className="flex flex-row justify-center"
                onClick={() => deleteEntity()}
                startContent={<Trash color="red" />}
              >
                <p className="text-red">Delete</p>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </CardHeader>
      <CardBody
        className="flex items-center justify-center"
        style={{ height: '300px', width: '300px' }}
      >
        <DoughnutChart data={data} options={options} />
      </CardBody>
    </Card>
  )
}
