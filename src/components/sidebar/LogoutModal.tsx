import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} radius='sm'>
      <ModalContent>
        <ModalHeader>Confirm Logout</ModalHeader>
        <ModalBody>
          <p>Are you sure you want to logout?</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} radius='sm'>
            Cancel
          </Button>
          <Button color="danger" onPress={onConfirm} radius='sm'>
            Logout
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 