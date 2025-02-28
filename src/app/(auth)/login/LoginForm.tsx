'use client';

import { Button, Checkbox, Form, Link, Alert } from '@heroui/react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { AuthCard } from '@/components/auth/AuthCard';
import { InputField } from '@/components/forms/InputField';
import { InputPasswordField } from '@/components/forms/InputPasswordField';
import { useLoginForm } from '@/hooks/forms/useLoginForm';
import { useAuthState } from '@/hooks/useAuthState';
import { signIn, signInWithGoogle } from '@/services/authService';
import { handleAuthError } from '@/utils/firebaseErrors';

interface LoginFormProps {
  reason?: string | null;
}

export default function LoginForm({ reason }: LoginFormProps) {
  const { state, startEmailLoading, startGoogleLoading, stopAllLoading, setError } = useAuthState();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
    clearErrors,
  } = useLoginForm();
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const [formReady, setFormReady] = useState(false);

  // Handle browser autofill
  useEffect(() => {
    // Longer delay to ensure browser autofill completes
    const timeoutId = setTimeout(() => {
      // Check if inputs have values (potentially from autofill)
      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
      const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
      
      if (emailInput?.value) {
        setValue('email', emailInput.value, { shouldValidate: false });
      }
      
      if (passwordInput?.value) {
        setValue('password', passwordInput.value, { shouldValidate: false });
      }
      
      // Clear any existing errors that might have appeared prematurely
      clearErrors();
      
      // Mark the form as ready after handling autofill
      setFormReady(true);
      
      // Only trigger validation if both fields have values
      if (emailInput?.value && passwordInput?.value) {
        // Small additional delay before triggering validation
        setTimeout(() => {
          trigger();
        }, 100);
      }
    }, 1000); // Increased from 500ms to 1000ms
    
    return () => clearTimeout(timeoutId);
  }, [setValue, trigger, clearErrors]);

  // Modified submit handler to handle prefilled values
  const onSubmitWrapper = (e: React.FormEvent) => {
    // If the form isn't ready yet, prevent submission and manually check fields
    if (!formReady) {
      e.preventDefault();
      
      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
      const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
      
      if (emailInput?.value) {
        setValue('email', emailInput.value, { shouldValidate: false });
      }
      
      if (passwordInput?.value) {
        setValue('password', passwordInput.value, { shouldValidate: false });
      }
      
      // Trigger validation and then try to submit if valid
      trigger().then(isValid => {
        if (isValid) {
          const formData = { email: emailInput.value, password: passwordInput.value };
          onSubmit(formData);
        }
      });
    }
  };

  // Get message based on reason
  const getReasonMessage = () => {
    if (!reason) return null;
    
    switch (reason) {
      case 'deactivated':
        return 'Your account has been deactivated. Please contact an administrator.';
      case 'expired':
        return 'Your session has expired. Please log in again.';
      case 'revoked':
        return 'Your session has been revoked. Please log in again.';
      case 'auth_error':
        return 'Authentication error. Please log in again.';
      default:
        return null;
    }
  };

  const reasonMessage = getReasonMessage();

  async function onSubmit(data: { email: string; password: string }) {
    startEmailLoading();
    try {
      const userData = await signIn(data.email, data.password, rememberMe);
      // Check if user is admin and redirect to clients page instead of home
      if (userData?.role === 'ADMIN' || userData?.user?.role === 'ADMIN' || 
          (userData?.payload?.user?.role === 'ADMIN')) {
        router.replace('/admin/clients');
      } else {
        router.replace('/dashboard');
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'UNAUTHORIZED_EMAIL') {
        return;
      }
      setError(handleAuthError(err));
    } finally {
      stopAllLoading();
    }
  }

  const handleGoogleLogin = async () => {
    startGoogleLoading();
    try {
      const userData = await signInWithGoogle();
      // Check if user is admin and redirect to clients page instead of home
      if (userData?.role === 'ADMIN' || userData?.user?.role === 'ADMIN' || 
          (userData?.payload?.user?.role === 'ADMIN')) {
        router.replace('/admin/clients');
      } else {
        router.replace('/dashboard');
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'UNAUTHORIZED_EMAIL') {
        return;
      }
      setError(handleAuthError(err));
    } finally {
      stopAllLoading();
    }
  };

  return (
    <AuthCard
      title="Log In"
      error={state.error}
      loading={state.googleLoading}
      onGoogleClick={handleGoogleLogin}
      footerText="Need to create an account?"
      footerLinkText="Sign Up"
      footerLinkHref="/signup"
    >
      {reasonMessage && (
        <Alert color="danger" className="mb-4">
          {reasonMessage}
        </Alert>
      )}
      <Form 
        className="flex flex-col gap-3" 
        onSubmit={(e) => {
          if (!formReady) {
            onSubmitWrapper(e);
          } else {
            handleSubmit(onSubmit)(e);
          }
        }}
      >
        <InputField
          {...register('email')}
          isRequired
          label="Email Address"
          placeholder="Enter your email"
          isInvalid={!!errors.email}
          errorMessage={errors.email?.message}
          type="email"
        />
        <InputPasswordField
          {...register('password')}
          isRequired
          label="Password"
          placeholder="Enter your password"
          isInvalid={!!errors.password}
          errorMessage={errors.password?.message}
        />

        <div className="flex w-full items-center justify-between px-1 py-2">
          <Checkbox name="remember" size="sm" isSelected={rememberMe} onValueChange={setRememberMe}>
            Remember me
          </Checkbox>
          <Link className="text-default-500" href="#" size="sm">
            Forgot password?
          </Link>
        </div>
        <Button
          className="w-full"
          color="primary"
          type="submit"
          isLoading={state.emailLoading}
          disabled={state.emailLoading || state.googleLoading}
        >
          Log In
        </Button>
      </Form>
    </AuthCard>
  );
}
