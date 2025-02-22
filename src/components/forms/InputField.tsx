import { Input, InputProps } from '@heroui/react';
import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface InputFieldProps extends Omit<InputProps, keyof UseFormRegisterReturn> {
  label?: string;
  registration?: UseFormRegisterReturn;
  errorMessage?: string;
  isRequired?: boolean;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, registration, errorMessage, isRequired, ...props }, ref) => {
    // Only show isInvalid if there's an error message
    const isInvalid = Boolean(errorMessage);

    return (
      <Input
        {...registration}
        {...props}
        ref={ref}
        label={label}
        isInvalid={isInvalid}
        errorMessage={errorMessage}
        variant="bordered"
        isRequired={isRequired}
      />
    );
  }
);

InputField.displayName = 'InputField';
