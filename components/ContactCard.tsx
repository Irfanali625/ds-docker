'use client';

import { Contact, ContactPhase } from '@/types';

interface ContactCardProps {
  contact: Contact;
  onStore?: (contactId: string) => void;
  canStore?: boolean;
}

export function ContactCard({ contact, onStore, canStore = true }: ContactCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Contact Details</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            contact.phase === ContactPhase.CLEANED
              ? 'bg-green-100 text-green-800'
              : contact.phase === ContactPhase.DELIVERED
              ? 'bg-blue-100 text-blue-800'
              : contact.phase === ContactPhase.DELIVERING
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {contact.phase}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="text-lg font-semibold text-gray-800">{contact.name}</p>
        </div>

        {contact.email && (
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg text-gray-800">{contact.email}</p>
          </div>
        )}

        {contact.phone && (
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="text-lg text-gray-800">{contact.phone}</p>
          </div>
        )}

        {contact.company && (
          <div>
            <p className="text-sm text-gray-500">Company</p>
            <p className="text-lg text-gray-800">{contact.company}</p>
          </div>
        )}

        {contact.address && (
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="text-lg text-gray-800">{contact.address}</p>
          </div>
        )}

        {(contact.city || contact.state || contact.zipCode) && (
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="text-lg text-gray-800">
              {[contact.city, contact.state, contact.zipCode]
                .filter(Boolean)
                .join(', ')}
            </p>
          </div>
        )}

        {contact.website && (
          <div>
            <p className="text-sm text-gray-500">Website</p>
            <a
              href={contact.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg text-blue-600 hover:underline"
            >
              {contact.website}
            </a>
          </div>
        )}

        {contact.source && (
          <div>
            <p className="text-sm text-gray-500">Source</p>
            <p className="text-lg text-gray-800">{contact.source}</p>
          </div>
        )}
      </div>

      {onStore && canStore && contact.phase !== ContactPhase.DELIVERED && (
        <button
          onClick={() => onStore(contact.id)}
          className="w-full py-3 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
        >
          Store Contact Record
        </button>
      )}
    </div>
  );
}

