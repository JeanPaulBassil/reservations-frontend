'use client';

import { Button, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Chip, useDisclosure, addToast } from '@heroui/react';
import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import axios from 'axios';

import Table from '@/components/shared/Table';
import { useClients, Client } from '@/hooks/useClients';
import { Pen, Plus, Trash, Search, Check, X, UserCheck, UserX } from 'lucide-react';

// Define error response type
interface ErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

export function ClientsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMockData, setIsMockData] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAllowModalOpen, setIsAllowModalOpen] = useState(false);
  
  // Create query parameters for the API
  const queryParams = {
    page: currentPage.toString(),
    limit: pageSize.toString(),
    role: 'USER', // Only fetch users with role USER
    ...(searchTerm ? { search: searchTerm } : {}),
  };
  
  const { 
    data, 
    meta, 
    isLoading, 
    error, 
    updateClientAllowedStatus,
    isUpdateLoading,
  } = useClients(queryParams);
  
  // Check if we're using mock data
  useEffect(() => {
    // If we have data and the first item has id '1', it's likely mock data
    if (data && data.length > 0 && data[0].id === '1' && data[0].email === 'client1@example.com') {
      setIsMockData(true);
    } else {
      setIsMockData(false);
    }
  }, [data]);
  
  // Open allow/disallow confirmation modal
  const handleAllowClick = (client: Client) => {
    setSelectedClient(client);
    setIsAllowModalOpen(true);
  };
  
  // Confirm allow/disallow
  const handleConfirmAllowChange = async () => {
    if (selectedClient) {
      try {
        // Use isActive or isAllowed based on what's available
        const currentStatus = selectedClient.isActive !== undefined 
          ? selectedClient.isActive 
          : selectedClient.isAllowed;
          
        const newStatus = !currentStatus;
        const result = await updateClientAllowedStatus(selectedClient.id, newStatus);
        
        if (result && result.success) {
          // Show success toast
          addToast({
            title: `Client ${newStatus ? 'Allowed' : 'Disallowed'}`,
            description: `${selectedClient.email} has been ${newStatus ? 'allowed' : 'disallowed'} successfully.${!newStatus ? ' User will be logged out immediately.' : ''}`,
            color: "success",
            timeout: 3000,
          });
          setIsAllowModalOpen(false);
        } else {
          // Show error toast
          addToast({
            title: "Operation Failed",
            description: 'Failed to update client status. Please try again.',
            color: "danger",
            timeout: 5000,
          });
        }
      } catch (error: unknown) {
        console.error('Error updating client status:', error);
        // Extract error message
        let errorMessage = 'There was an error updating the client status. Please try again.';
        
        if (axios.isAxiosError(error)) {
          const responseData = error.response?.data as ErrorResponse | undefined;
          errorMessage = responseData?.message || 
                         responseData?.error || 
                         error.message || 
                         errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        // Show error toast
        addToast({
          title: "Operation Failed",
          description: errorMessage,
          color: "danger",
          timeout: 5000,
        });
      }
    }
  };

  // Debounced search handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
      setCurrentPage(1); // Reset to first page on new search
    }, 500),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  // Define columns for the shared Table component
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created At' },
    { key: 'actions', label: 'Actions' },
  ] as const;

  // Transform the data to match the Row type expected by the shared Table
  const rows = data
    ? data.map((clientItem: Client) => {
        // Use isActive or isAllowed based on what's available
        const isAllowed = clientItem.isActive !== undefined 
          ? clientItem.isActive 
          : clientItem.isAllowed;
          
        return {
          id: Number(clientItem.id) || parseInt(clientItem.id, 10) || Math.random() * 1000,
          name: clientItem.name || '-',
          email: clientItem.email,
          status: (
            <Chip
              color={isAllowed ? "success" : "danger"}
              variant="flat"
              startContent={isAllowed ? <Check size={14} /> : <X size={14} />}
            >
              {isAllowed ? 'Allowed' : 'Not Allowed'}
            </Chip>
          ),
          createdAt: new Date(clientItem.createdAt).toLocaleDateString(),
          actions: [
            {
              label: isAllowed ? 'Disallow' : 'Allow',
              icon: isAllowed ? <UserX size={18} /> : <UserCheck size={18} />,
              tooltipColor: isAllowed ? 'danger' as const : 'success' as const,
              onClick: () => handleAllowClick(clientItem),
            },
          ],
        };
      })
    : [];

  if (error) {
    return (
      <Card>
        <CardBody className="pt-6">
          <div className="text-red-500">
            Error loading clients. Please try refreshing the page.
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      {isMockData && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
          <p className="font-bold">Using Demo Mode</p>
          <p className="mb-2">
            You are currently viewing demo data because you are not authenticated or don't have permission to access this resource.
          </p>
          <p>
            <strong>What this means:</strong> You can still use all features, but changes will only be saved locally and will be lost when you refresh the page.
            {window.location.pathname.includes('/admin') && (
              <span> To use real data, please ensure you're logged in with an admin account.</span>
            )}
          </p>
        </div>
      )}
    
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="relative w-full md:w-64 order-2 md:order-1">
          <Input
            placeholder="Search clients..."
            radius="sm"
            onChange={handleSearchChange}
            startContent={<Search size={18} className="text-gray-400" />}
            className="w-full"
          />
        </div>
      </div>

      <Table
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        currentPage={currentPage}
        setPage={setCurrentPage}
        totalPages={meta?.total ? Math.ceil(meta.total / pageSize) : 1}
        ariaLabel="Clients table"
        emptyContent="No clients found."
      />
      
      {/* Allow/Disallow Confirmation Modal */}
      <Modal isOpen={isAllowModalOpen} onClose={() => setIsAllowModalOpen(false)} radius='sm'>
        <ModalContent>
          <ModalHeader>
            {selectedClient && (selectedClient.isActive !== undefined 
              ? selectedClient.isActive 
              : selectedClient.isAllowed) 
              ? 'Disallow Client' 
              : 'Allow Client'}
          </ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to {selectedClient && (selectedClient.isActive !== undefined 
                ? selectedClient.isActive 
                : selectedClient.isAllowed) 
                ? 'disallow' 
                : 'allow'} the client{' '}
              <strong>{selectedClient?.email}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {selectedClient && (selectedClient.isActive !== undefined 
                ? selectedClient.isActive 
                : selectedClient.isAllowed) 
                ? 'This client will no longer be able to access the system and will be logged out immediately if currently using the application.' 
                : 'This client will be able to access the system.'}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="default" 
              radius='sm'
              variant="light" 
              onPress={() => setIsAllowModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              style={{ 
                backgroundColor: selectedClient && (selectedClient.isActive !== undefined 
                  ? selectedClient.isActive 
                  : selectedClient.isAllowed) 
                  ? "#dc2626" 
                  : "#75CAA6", 
                borderColor: selectedClient && (selectedClient.isActive !== undefined 
                  ? selectedClient.isActive 
                  : selectedClient.isAllowed) 
                  ? "#dc2626" 
                  : "#75CAA6" 
              }}
              radius='sm'
              className="text-white"
              onPress={handleConfirmAllowChange}
              isLoading={isUpdateLoading}
            >
              {selectedClient && (selectedClient.isActive !== undefined 
                ? selectedClient.isActive 
                : selectedClient.isAllowed) 
                ? 'Disallow' 
                : 'Allow'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
} 