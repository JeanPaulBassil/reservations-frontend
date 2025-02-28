'use client';

import type { CardProps } from '@heroui/react';
import { Button, Card, CardBody, CardHeader, Form } from '@heroui/react';
import React, { useCallback, useEffect } from 'react';

import { AvatarUpload } from '@/components/forms/AvatarUpload';
import { InputField } from '@/components/forms/InputField';
import { useAuth } from '@/components/providers/AuthProvider';
import { useAccountDetailsForm } from '@/hooks/forms/useAccountDetailsForm';
import { AccountDetailsSchema } from '@/schemas/settingsSchema';
import { updateAccountDetails } from '@/services/accountService';

export default function AccountDetailsFormCard(props: CardProps) {
  const { register, handleSubmit, errors, reset, setValue, isDirty, isSubmitting } = useAccountDetailsForm();
  const { user } = useAuth();

  const onSubmit = useCallback(async (data: AccountDetailsSchema) => {
    try {
      await updateAccountDetails(data);
      // Optionally add success notification here
    } catch (error) {
      // Handle error (e.g., show error notification)
      console.error('Failed to update account details:', error);
    }
  }, []);

  useEffect(() => {
    reset({
      uid: user?.uid || '',
      username: user?.displayName || undefined,
      phoneNumber: user?.phoneNumber || undefined,
    });
  }, [user, reset]);

  const handlePhotoChange = useCallback(
    (file: File) => {
      setValue('photo', file, { shouldDirty: true });
    },
    [setValue]
  );

  const handleUsernameChange = useCallback(
    (value: string) => {
      setValue('username', value, { shouldValidate: true, shouldDirty: true });
    },
    [setValue]
  );

  const handlePhoneNumberChange = useCallback(
    (value: string) => {
      setValue('phoneNumber', value, { shouldValidate: true, shouldDirty: true });
    },
    [setValue]
  );

  const handleCancel = useCallback(() => {
    reset({
      username: user?.displayName || undefined,
      phoneNumber: user?.phoneNumber || undefined,
    });
  }, [reset, user]);

  return (
    <Card className="max-w-xl p-2" {...props}>
      <CardHeader className="flex flex-col items-start px-4 pb-0 pt-4">
        <p className="text-large">Account Details</p>
        <AvatarUpload
          photoURL={user?.photoURL}
          displayName={user?.displayName}
          email={user?.email}
          onPhotoChange={handlePhotoChange}
        />
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
              radius="sm"
              {...register('username')}
              errorMessage={errors.username?.message}
              isInvalid={!!errors.username}
              debounceMs={300}
              onValueChange={handleUsernameChange}
            />
            {/* Phone Number */}
            <InputField
              label="Phone Number"
              labelPlacement="outside"
              placeholder="Enter phone number..."
              radius="sm"
              {...register('phoneNumber')}
              errorMessage={errors.phoneNumber?.message}
              isInvalid={!!errors.phoneNumber}
              debounceMs={300}
              onValueChange={handlePhoneNumberChange}
            />
          </div>

          <div className="mt-6 flex w-full justify-end gap-2">
            <Button radius="sm" variant="bordered" isDisabled={!isDirty} onClick={handleCancel}>
              Cancel
            </Button>
            <Button color="danger" radius="sm" type="submit" isDisabled={!isDirty} isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
}
