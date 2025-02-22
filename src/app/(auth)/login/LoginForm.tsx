'use client'

import React, { useState } from 'react'
import { Button, Checkbox, Link, Form } from '@heroui/react'
import { useLoginForm } from '@/hooks/forms/useLoginForm'
import { useRouter } from 'next/navigation'
import { handleAuthError } from '@/utils/firebaseErrors'
import { signInWithGoogle, signIn } from '@/services/authService'
import { InputField } from '@/components/forms/InputField'
import { InputPasswordField } from '@/components/forms/InputPasswordField'
import { AuthCard } from '@/components/auth/AuthCard'
import { useAuthState } from '@/hooks/useAuthState'

export default function LoginForm() {
  const {
    state,
    startEmailLoading,
    startGoogleLoading,
    stopAllLoading,
    setError
  } = useAuthState()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useLoginForm()
  const router = useRouter()
  const [rememberMe, setRememberMe] = useState(false)

  async function onSubmit(data: { email: string; password: string }) {
    startEmailLoading()
    try {
      await signIn(data.email, data.password, rememberMe)
      router.push('/')
    } catch (err) {
      setError(handleAuthError(err))
    } finally {
      stopAllLoading()
    }
  }

  const handleGoogleLogin = async () => {
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
      title="Log In"
      error={state.error}
      loading={state.googleLoading}
      onGoogleClick={handleGoogleLogin}
      footerText="Need to create an account?"
      footerLinkText="Sign Up"
      footerLinkHref="/signup"
    >
      <Form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
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
          <Checkbox 
            name="remember" 
            size="sm"
            isSelected={rememberMe}
            onValueChange={setRememberMe}
          >
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
  )
}
