'use client';

import { RegisterForm } from '@/components/RegisterForm';

export function RegisterView() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-100">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-2">
              Create Your Account
            </h1>
            <p className="text-center text-sm text-gray-500">
              Join us today and get started with your leads.
            </p>
          </div>
          <RegisterForm />
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-indigo-600 hover:text-indigo-700 hover:underline font-semibold transition-colors">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

