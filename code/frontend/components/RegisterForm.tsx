'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { TextField, PasswordField } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

// Must match the backend rule in authController.
const MIN_PASSWORD_LENGTH = 8;

const registerSchema = yup.object({
  name: yup.string().trim().required('Enter your full name').min(2, 'Name is too short').max(80, 'Name is too long'),
  email: yup.string().trim().required('Enter your email').email('Enter a valid email address'),
  password: yup
    .string()
    .required('Choose a password')
    .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`),
  confirmPassword: yup
    .string()
    .required('Confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({ resolver: yupResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.name, data.email, data.password);
      router.replace('/dashboard');
    } catch (err: any) {
      setError('root', { message: err.message || 'Could not create your account' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {errors.root && <Alert tone="error">{errors.root.message}</Alert>}

      <TextField
        label="Full name"
        autoComplete="name"
        autoFocus
        placeholder="Jane Smith"
        error={errors.name?.message}
        {...register('name')}
      />

      <TextField
        label="Work email"
        type="email"
        autoComplete="email"
        placeholder="name@company.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <PasswordField
        label="Password"
        autoComplete="new-password"
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        error={errors.password?.message}
        {...register('password')}
      />

      <PasswordField
        label="Confirm password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        {isSubmitting ? 'Creating account' : 'Create account'}
      </Button>
    </form>
  );
}
