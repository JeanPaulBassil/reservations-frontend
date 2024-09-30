'use client'
import Widget from '@/app/_components/shared/Widget'
import { useSidebarContext } from '@/app/contexts/SidebarContext'
import { Button } from '@nextui-org/button'
import { useDisclosure } from '@nextui-org/modal'
import { Plus, Search, Sidebar, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Input, Spacer, Spinner } from '@nextui-org/react'
import { useQuery } from '@tanstack/react-query'
import { ServerError } from '@/api/utils'
import { Entity } from '@/api/models/Entity'
import { EntityApi } from '@/api/entity.api'
import EntityProfile from './_components/EntityProfile'
import AddEntityModal from './_components/AddEntityModal'
import { useUser } from '@/app/providers/SessionProvider'
import useOrderedQueries from '@/hooks/useQueries'
import useDebouncedCallback from '@/hooks/useDebounceCallback'
import { useEntity } from '@/app/contexts/EntityContext'

const page = () => {
  const { onToggle } = useSidebarContext()
  const entityApi = new EntityApi()
  const { user } = useUser()
  const [nameSearch, setNameSearch] = useState<string>('')
  const { selectedEntityId, setSelectedEntityId } = useEntity()
  const { get: getQueries, set: setQueries } = useOrderedQueries<{
    name: string
  }>({
    name: '',
  })

  const debounceName = useDebouncedCallback((value: string) => {
    setQueries({ name: value })
  }, 500)

  const {
    isOpen: isOpenCreateModal,
    onOpen: onOpenCreateModal,
    onClose: onCloseCreateModal,
  } = useDisclosure()

  const {
    data: entities,
    isLoading,
  } = useQuery<Entity[], ServerError>({
    queryKey: ['entities', getQueries().name],
    queryFn: async () => {
      const response = await entityApi.getEntities(getQueries().name)
      return response.payload
    },
  })

  useEffect(() => {
    if (!selectedEntityId && entities && entities.length > 0) {
      setSelectedEntityId(entities[0].id)
    }
  }, [selectedEntityId, entities])

  if (!user?.companyId) {
    return <div className="h-screen">
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <Spinner color="success" />
      </div>
    </div>
  }

  return (
    <div className="h-screen">
      <AddEntityModal isOpen={isOpenCreateModal} onClose={onCloseCreateModal} />
      <Widget className="border-2 border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={onToggle}
              isIconOnly
              endContent={<Sidebar />}
              variant="light"
              className="max-md:hidden"
            />
            <h2 className="text-lg font-bold">Entities</h2>
          </div>
          <Button
            radius="sm"
            className="hidden bg-[#417D7A] text-white md:flex"
            onClick={onOpenCreateModal}
            startContent={<Plus />}
          >
            Add Entity
          </Button>
          <Button
            radius="sm"
            className="bg-[#417D7A] text-white md:hidden"
            onClick={onOpenCreateModal}
            isIconOnly
            startContent={<Plus />}
          />
        </div>
      </Widget>
      <Spacer y={2} />
      <Widget className="flex h-[calc(100vh-6rem)] flex-col border-2 border-gray-200 px-5 pt-4">
        <div className="flex items-center justify-between">
          <Input
            placeholder="Search"
            variant="bordered"
            radius="sm"
            className="max-w-xs"
            startContent={<Search />}
            onChange={(e) => {
              setNameSearch(e.target.value)
              debounceName(e.target.value)
            }}
            value={nameSearch}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          {isLoading ? (
            <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
              <Spinner color="success" />
            </div>
          ) : (
            entities?.length === 0 ? <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
              <p className="text-lg text-gray-500">No entities found</p>
            </div> :
            entities?.map((entity) => <EntityProfile key={entity.id} entity={entity} />)
          )}
        </div>
      </Widget>
    </div>
  )
}

export default page
