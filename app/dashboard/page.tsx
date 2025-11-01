'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardView } from '@/views/dashboard/DashboardView';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardView />
    </ProtectedRoute>
  );
}

