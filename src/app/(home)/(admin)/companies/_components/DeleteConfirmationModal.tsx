import { Button, Modal, ModalBody, ModalContent, ModalFooter } from '@nextui-org/react'
import { X } from 'lucide-react'
import React from 'react'
type Props = {
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
  message?: string
  assetBeingDeleted?: string
  isLoading?: boolean
}
const DeletionConfirmationModal = ({
  isOpen,
  onClose,
  onDelete,
  isLoading,
  message,
  assetBeingDeleted,
}: Props) => {
  return (
    <Modal
      classNames={{
        closeButton: 'hidden',
      }}
      backdrop={'blur'}
      size={'xl'}
      radius="sm"
      isOpen={isOpen}
      onClose={onClose}
      className="all transition duration-300 ease-in-out"
    >
      <ModalContent>
        <div className="px-10 py-8">
          {/* Modal Header */}
          <div className="flex flex-row items-start justify-between">
            {/* Left */}
            <div className="flex flex-col space-y-2">
              <h2 className="text-2xl font-normal">Delete {assetBeingDeleted}</h2>
              {isLoading ? (
                <p className="text-small font-light text-gray-500 dark:text-gray-300">
                  We&apos;re deleting the item... Please wait.
                </p>
              ) : (
                <p className="text-small font-light text-gray-500 dark:text-gray-300">
                  {message}
                </p>
              )}
            </div>
            <Button
              onClick={onClose}
              variant="light"
              radius="full"
              isIconOnly
              startContent={<X size={24} strokeWidth={1.5} />}
            />
          </div>
          <ModalFooter className="mt-5">
            <Button
              color="secondary"
              radius="sm"
              variant="light"
              onPress={onClose}
              isDisabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              variant="solid"
              radius="sm"
              onPress={onDelete}
              isDisabled={isLoading}
              isLoading={isLoading}
            >
              Delete
            </Button>
          </ModalFooter>
        </div>
      </ModalContent>
    </Modal>
  )
}
export default DeletionConfirmationModal
