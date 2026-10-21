'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, safeRedirect } from '@/contexts/AuthContext';
import { TextField, PasswordField } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

const loginSchema = yup.object({
  email: yup.string().trim().required('Enter your email').email('Enter a valid email address'),
  password: yup.string().required('Enter your password'),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({ resolver: yupResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      router.replace(safeRedirect(searchParams.get('redirect')));
    } catch (err: any) {
      setError('root', { message: err.message || 'Sign in failed' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {errors.root && <Alert tone="error">{errors.root.message}</Alert>}

      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        autoFocus
        placeholder="name@company.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <PasswordField
        label="Password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        {isSubmitting ? 'Signing in' : 'Sign in'}
      </Button>
    </form>
  );
}
