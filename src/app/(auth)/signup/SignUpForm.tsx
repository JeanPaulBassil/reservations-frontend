'use client'

import React from 'react'
import { Button, Form } from '@heroui/react'
import { useRouter } from 'next/navigation'
import { useSignUpForm } from '@/hooks/forms/useSignupForm'
import { signInWithGoogle, signUp } from '@/services/authService'
import { InputField } from '@/components/forms/InputField'
import { InputPasswordField } from '@/components/forms/InputPasswordField'
import { AuthCard } from '@/components/auth/AuthCard'
import { useAuthState } from '@/hooks/useAuthState'
import { handleAuthError } from '@/utils/firebaseErrors'

export default function SignUpForm() {
  const {
    state,
    startEmailLoading,
    startGoogleLoading,
    stopAllLoading,
    setError,
  } = useAuthState()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useSignUpForm()
  const router = useRouter()

  async function onSubmit(data: { email: string; password: string }) {
    startEmailLoading()
    try {
      await signUp(data.email, data.password)
      router.push('/')
    } catch (err) {
      setError(handleAuthError(err))
    } finally {
      stopAllLoading()
    }
  }

  const handleGoogleSignIn = async () => {
    startGoogleLoading()
    try {
      await signInWithGoogle()
      router.push('/')
    } catch (err) {
      setError(handleAuthError(err))
    } finally {
      stopAllLoading()
    }
  }

  return (
    <AuthCard
      title="Sign Up"
      error={state.error}
      loading={state.googleLoading}
      onGoogleClick={handleGoogleSignIn}
      footerText="Already have an account?"
      footerLinkText="Log In"
      footerLinkHref="/login"
    >
      <Form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
        <InputField
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          errorMessage={errors.email?.message}
          {...register('email')}
          isRequired
        />

        <InputPasswordField
          {...register('password')}
          label="Password"
          placeholder="Enter your password"
          errorMessage={errors.password?.message}
          isRequired
        />

        <InputPasswordField
          {...register('confirmPassword')}
          label="Confirm Password"
          placeholder="Confirm your password"
          errorMessage={errors.confirmPassword?.message}
          isRequired
        />

        <Button
          className="w-full"
          color="primary"
          type="submit"
          isLoading={state.emailLoading}
          disabled={state.emailLoading || state.googleLoading}
        >
          Sign Up
        </Button>
      </Form>
    </AuthCard>
  )
}
