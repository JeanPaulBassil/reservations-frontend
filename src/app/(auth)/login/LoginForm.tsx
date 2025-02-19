'use client'

import React, { useState } from 'react'
import { Button, Input, Checkbox, Link, Divider, Form } from '@heroui/react'
import { Icon } from '@iconify/react'
import { useLoginForm } from '@/hooks/forms/useLoginForm'
import { useRouter } from 'next/navigation'
import { FirebaseError } from 'firebase/app'
import { getFirebaseErrorMessage } from '@/utils/firebaseErrors'
import { useAuth } from '@/components/providers/AuthProvider'

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useLoginForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const toggleVisibility = () => setIsVisible(!isVisible)
  const { signIn, signInWithGoogle } = useAuth()
  const [rememberMe, setRememberMe] = useState(false)

  async function onSubmit(data: { email: string; password: string }) {
    setLoading(true)
    setError(null)
    try {
      await signIn(data.email, data.password, rememberMe)
      router.push('/')
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

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      router.push('/')
    } catch (err) {
      console.error('Google Sign-In Error:', err)
      setError('Failed to sign in with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const PasswordToggle = React.memo(
    ({ isVisible, onToggle }: { isVisible: boolean; onToggle: () => void }) => (
      <button type="button" onClick={onToggle}>
        {isVisible ? (
          <Icon
            className="text-2xl text-default-400"
            icon="solar:eye-closed-linear"
          />
        ) : (
          <Icon className="text-2xl text-default-400" icon="solar:eye-bold" />
        )}
      </button>
    ),
  )

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small">
      <p className="text-xl font-medium">Log In</p>
      <p className="text-red-500 text-sm h-[20px]">{error ? error : ''}</p>
      <Form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register('email')}
          isRequired
          label="Email Address"
          placeholder="Enter your email"
          isInvalid={!!errors.email}
          errorMessage={errors.email?.message}
          type="email"
          variant="bordered"
        />
        <Input
          {...register('password')}
          isRequired
          endContent={
            <PasswordToggle isVisible={isVisible} onToggle={toggleVisibility} />
          }
          label="Password"
          isInvalid={!!errors.password}
          errorMessage={errors.password?.message}
          placeholder="Enter your password"
          type={isVisible ? 'text' : 'password'}
          variant="bordered"
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
          isLoading={loading}
          disabled={loading}
        >
          Log In
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
          onPress={handleGoogleLogin}
          isLoading={loading}
          disabled={loading}
        >
          Continue with Google
        </Button>
      </div>
      <p className="text-center text-small">
        Need to create an account?&nbsp;
        <Link href="/signup" size="sm">
          Sign Up
        </Link>
      </p>
    </div>
  )
}
