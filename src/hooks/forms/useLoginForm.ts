import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { LoginFormValues, loginSchema } from '@/schemas/authSchemas';

export function useLoginForm() {
  return useForm<LoginFormValues>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(loginSchema),
  });
}
