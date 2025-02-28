import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spinner,
} from '@heroui/react';
import React, { useState } from 'react';
import { useRestaurant } from '../providers/RestaurantProvider';
import { useSidebar } from '../providers/SidebarProvider';

export default function RestaurantSwitcher() {
  const { restaurants, currentRestaurant, setCurrentRestaurant, isLoading, error } =
    useRestaurant();
  const { isSidebarOpen } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);

  // Don't render anything if sidebar is closed
  if (!isSidebarOpen) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-2 px-4 rounded-md bg-white/10 mb-4">
        <Spinner size="sm" color="white" />
        <span className="ml-2 text-white text-sm">Loading restaurants...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-2 px-4 rounded-md bg-red-500/20 text-white text-sm mb-4">
        Error loading restaurants
      </div>
    );
  }

  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="py-2 px-4 rounded-md bg-white/10 text-white text-sm mb-4">
        No restaurants found
      </div>
    );
  }

  return (
    <div className="mb-4">
      <p className="text-primary-foreground/80 text-xs font-medium mb-2 px-2">WORKSPACE</p>
      <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
        <DropdownTrigger>
          <Button
            radius="sm"
            className="w-full justify-between bg-white/10 hover:bg-white/20 text-white border-0"
            variant="flat"
            endContent={
              <span className="text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            }
          >
            {currentRestaurant?.name || 'Select Restaurant'}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          variant="light"
          aria-label="Restaurant selection"
          className="w-[240px]"
          onAction={(key) => {
            const selected = restaurants.find((r) => r.id === key);
            if (selected) {
              setCurrentRestaurant(selected);
              setIsOpen(false);
            }
          }}
        >
          {restaurants.map((restaurant) => (
            <DropdownItem
              variant="light"
              key={restaurant.id}
              className={currentRestaurant?.id === restaurant.id ? 'bg-primary/20' : ''}
              startContent={
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                  {restaurant.name.charAt(0).toUpperCase()}
                </div>
              }
            >
              {restaurant.name}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
