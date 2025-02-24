'use client';

import type { CardProps } from '@heroui/react';
import { Avatar, Badge, Button, Card, CardBody, CardHeader, Form } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify/react';
import React, { useEffect, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { InputField } from '@/components/forms/InputField';
import { useAuth } from '@/components/providers/AuthProvider';

const userFormSchema = z.object({
  username: z.string().optional(),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  photo: z.any().optional(),
});

export default function Component(props: CardProps) {
  const { user } = useAuth();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userFormSchema),
  });

  const onSubmit = useCallback((data: any) => {
    const formData = {
      ...data,
      photo: photoFile,
    };
    console.log(formData);
  }, [photoFile]);

  useEffect(() => {
    reset({
      username: user?.displayName || undefined,
      email: user?.email || undefined,
      phoneNumber: user?.phoneNumber || undefined,
    });
  }, [user, reset]);

  const handlePhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Store the file and update the form
    setPhotoFile(file);
    setValue('photo', file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
  }, [setValue]);

  // Update cleanup to handle both preview URL and file
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoFile(null);
    };
  }, [photoPreview]);

  return (
    <Card className="max-w-xl p-2" {...props}>
      <CardHeader className="flex flex-col items-start px-4 pb-0 pt-4">
        <p className="text-large">Account Details</p>
        <div className="flex gap-4 py-4">
          <Badge
            showOutline
            classNames={{
              badge: 'w-5 h-5',
            }}
            color="primary"
            content={
              <Button
                isIconOnly
                className="p-0 text-primary-foreground cursor-pointer"
                radius="full"
                size="sm"
                variant="light"
                onClick={() => {
                  document.getElementById('photo-upload')?.click();
                }}
              >
                <Icon icon="solar:pen-2-linear" />
              </Button>
            }
            placement="bottom-right"
            shape="circle"
          >
            <input
              id="photo-upload"
              type="file"
              className="hidden"
              accept="image/*"
              {...register('photo')}
              onChange={(e) => {
                handlePhotoUpload(e);
                register('photo').onChange(e);
              }}
            />
            <Avatar
              className="h-14 w-14"
              src={photoPreview || user?.photoURL || undefined}
              showFallback
              name={user?.displayName || user?.email?.split('@')[0]}
              alt="Profile Photo"
            />
          </Badge>
          <div className="flex flex-col items-start justify-center">
            <p className="font-medium">{user?.displayName || user?.email?.split('@')[0]}</p>
            <span className="text-small text-default-500">{user?.email}</span>
          </div>
        </div>
        <p className="text-small text-default-400">
          The photo will be used for your profile, and will be visible to other users of the
          platform. Click the edit button to upload a new photo.
        </p>
      </CardHeader>
      <CardBody>
        <Form validationBehavior="native" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
            {/* Username */}
            <InputField
              label="Username"
              labelPlacement="outside"
              placeholder="Enter username..."
              radius='sm'
              {...register('username')}
              errorMessage={errors.username?.message}
              isInvalid={!!errors.username}
            />
            {/* Email */}
            <InputField
              isRequired
              label="Email"
              labelPlacement="outside"
              placeholder="Enter email..."
              type="email"
              radius='sm'
              {...register('email')}
              errorMessage={errors.email?.message}
              isInvalid={!!errors.email}
            />
            {/* Phone Number */}
            <InputField
              label="Phone Number"
              labelPlacement="outside"
              placeholder="Enter phone number..."
              radius='sm'
              {...register('phoneNumber')}
              errorMessage={errors.phoneNumber?.message}
              isInvalid={!!errors.phoneNumber}
            />
          </div>

          <div className="mt-6 flex w-full justify-end gap-2">
            <Button radius="sm" variant="bordered">
              Cancel
            </Button>
            <Button color="danger" radius="sm" type="submit">
              Save Changes
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
}
