'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const registerSchema = yup.object({
  name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.email, data.password, data.name);
      // Redirect to dashboard after registration
      router.push('/dashboard');
    } catch (err: any) {
      setError('root', {
        type: 'manual',
        message: err.message || 'Registration failed',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errors.root && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {errors.root.message}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className={`w-full px-4 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="John Doe"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={`w-full px-4 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="your@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            className={`w-full px-4 py-2 pr-10 border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <IconEyeOff className="w-5 h-5" stroke={1.5} />
            ) : (
              <IconEye className="w-5 h-5" stroke={1.5} />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword')}
            className={`w-full px-4 py-2 pr-10 border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
            tabIndex={-1}
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirmPassword ? (
              <IconEyeOff className="w-5 h-5" stroke={1.5} />
            ) : (
              <IconEye className="w-5 h-5" stroke={1.5} />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Creating account...' : 'Register'}
      </button>
    </form>
  );
}
