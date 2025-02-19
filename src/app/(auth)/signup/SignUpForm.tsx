'use client'

import React, { useState } from 'react'
import { Button, Input, Link, Divider, Form, user } from '@heroui/react'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import { FirebaseError } from 'firebase/app'
import { getFirebaseErrorMessage } from '@/utils/firebaseErrors'
import { useAuth } from '@/components/providers/AuthProvider'
import { useSignUpForm } from '@/hooks/forms/useSignupForm'

export default function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useSignUpForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const toggleVisibility = () => setIsVisible(!isVisible)
  const { signUp, signInWithGoogle, } = useAuth()

  async function onSubmit(data: { email: string; password: string }) {
    setLoading(true)
    setError(null)
    try {
      await signUp(data.email, data.password)
      sessionStorage.setItem('user', 'true')
      router.push('/') // Redirect after successful signup
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(getFirebaseErrorMessage(err.code))
      } else if (err instanceof Error) {
        console.error('Non-Firebase Error:', err)
        setError(err.message)
      } else {
        setError(getFirebaseErrorMessage('default'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small">
      <p className="text-xl font-medium">Sign Up</p>
      <p className="text-red-500 text-sm h-[20px]">{error ? error : ''}</p>
      <Form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register('email')}
          isRequired
          label="Email Address"
          placeholder="Enter your email"
          type="email"
          variant="bordered"
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}

        <Input
          {...register('password')}
          isRequired
          endContent={
            <button type="button" onClick={toggleVisibility}>
              {isVisible ? (
                <Icon
                  className="text-2xl text-default-400"
                  icon="solar:eye-closed-linear"
                />
              ) : (
                <Icon
                  className="text-2xl text-default-400"
                  icon="solar:eye-bold"
                />
              )}
            </button>
          }
          label="Password"
          placeholder="Enter your password"
          type={isVisible ? 'text' : 'password'}
          variant="bordered"
        />
        {errors.password && (
          <p className="text-red-500">{errors.password.message}</p>
        )}

        <Input
          {...register('confirmPassword')}
          isRequired
          endContent={
            <button type="button" onClick={toggleVisibility}>
              {isVisible ? (
                <Icon
                  className="text-2xl text-default-400"
                  icon="solar:eye-closed-linear"
                />
              ) : (
                <Icon
                  className="text-2xl text-default-400"
                  icon="solar:eye-bold"
                />
              )}
            </button>
          }
          label="Confirm Password"
          placeholder="Confirm your password"
          type={isVisible ? 'text' : 'password'}
          variant="bordered"
        />
        {errors.confirmPassword && (
          <p className="text-red-500">{errors.confirmPassword.message}</p>
        )}

        <Button
          className="w-full"
          color="primary"
          type="submit"
          isLoading={loading}
        >
          Sign Up
        </Button>
      </Form>
      <div className="flex items-center gap-4 py-2">
        <Divider className="flex-1" />
        <p className="shrink-0 text-tiny text-default-500">OR</p>
        <Divider className="flex-1" />
      </div>
      <div className="flex flex-col gap-2">
        <Button
          startContent={<Icon icon="flat-color-icons:google" width={24} />}
          variant="bordered"
          onPress={async () => {
            await signInWithGoogle()
            router.push('/')
          }}
          isLoading={loading}
        >
          Continue with Google
        </Button>
      </div>
      <p className="text-center text-small">
        Already have an account?&nbsp;
        <Link href="/login" size="sm">
          Log In
        </Link>
      </p>
    </div>
  )
} 