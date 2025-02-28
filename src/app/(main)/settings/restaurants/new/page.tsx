'use client';

import { Button, Card, CardBody, CardFooter, CardHeader, Input, Textarea } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function CreateRestaurantPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    phone: '',
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // This is a placeholder - you'll need to implement the actual API call
      // to create a new restaurant
      const response = await fetch('/api/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create restaurant');
      }

      // Navigate to the dashboard after successful creation
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating restaurant:', error);
      // Handle error (show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6 flex items-center gap-2">
        <Button
          variant="light"
          isIconOnly
          className="text-default-500"
          onClick={() => router.back()}
        >
          <Icon icon="solar:arrow-left-linear" width={24} />
        </Button>
        <h1 className="text-2xl font-bold">Create New Restaurant</h1>
      </div>

      <Card className="shadow-md">
        <CardHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Restaurant Details</h2>
          <p className="text-default-500 text-sm">
            Fill in the details below to create your restaurant profile.
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardBody className="gap-4">
            <div className="space-y-4">
              <Input
                label="Restaurant Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter restaurant name"
                variant="bordered"
                isRequired
              />

              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your restaurant"
                variant="bordered"
                minRows={3}
              />

              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter restaurant address"
                variant="bordered"
                isRequired
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  variant="bordered"
                  isRequired
                />

                <Input
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter contact email"
                  variant="bordered"
                  type="email"
                  isRequired
                />
              </div>
            </div>
          </CardBody>
          <CardFooter className="justify-end gap-2">
            <Button
              variant="flat"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={isLoading}
            >
              Create Restaurant
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 