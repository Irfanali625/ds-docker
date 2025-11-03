import React from 'react';
import { LeadsTable } from '@/components/LeadsTable';
import { Contact } from '@/types';

interface MyLeadsProps {
  contacts: Contact[];
  loading: boolean;
}

export function MyLeads({ contacts, loading }: MyLeadsProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">My Leads</h2>
      <LeadsTable contacts={contacts} loading={loading} />
    </div>
  );
}
