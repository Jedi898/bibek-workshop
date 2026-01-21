'use client';

import { useState, useMemo } from 'react';
import { Contact } from '../types';

interface ContactDirectoryProps {
  contacts: Contact[];
  projectId: string;
  onUpdateContact: (contactId: string, updates: Partial<Contact>) => Promise<void>;
}

const departments = [
  'Production',
  'Direction',
  'Camera',
  'Sound',
  'Art',
  'Wardrobe',
  'Hair/Makeup',
  'Lighting',
  'Grip',
  'Transportation',
  'Cast'
];

export default function ContactDirectory({ 
  contacts, 
  projectId, 
  onUpdateContact 
}: ContactDirectoryProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filteredContacts = useMemo(() => {
    let filtered = contacts;
    
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(contact => contact.department === selectedDepartment);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(term) ||
        contact.role?.toLowerCase().includes(term) ||
        contact.email?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [contacts, selectedDepartment, searchTerm]);

  const contactsByDepartment = useMemo(() => {
    const groups: Record<string, Contact[]> = {};
    
    departments.forEach(dept => {
      groups[dept] = contacts.filter(contact => contact.department === dept);
    });
    
    groups['Unassigned'] = contacts.filter(contact => !contact.department);
    
    return groups;
  }, [contacts]);

  const handleQuickAction = async (contactId: string, action: 'call' | 'email' | 'message') => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    switch (action) {
      case 'call':
        if (contact.phone) {
          window.location.href = `tel:${contact.phone}`;
        }
        break;
      case 'email':
        if (contact.email) {
          window.location.href = `mailto:${contact.email}`;
        }
        break;
      case 'message':
        // Implement messaging functionality
        console.log('Message', contact);
        break;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Contact Directory</h2>
            <p className="text-gray-600">{contacts.length} contacts</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + Add Contact
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedDepartment('all')}
            className={`px-3 py-1 rounded ${
              selectedDepartment === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({contacts.length})
          </button>
          {departments.map(dept => {
            const count = contactsByDepartment[dept]?.length || 0;
            if (count === 0) return null;
            
            return (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-3 py-1 rounded ${
                  selectedDepartment === dept 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {dept} ({count})
              </button>
            );
          })}
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg pl-10"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Contact List */}
        <div className="border-r p-4">
          <h3 className="font-semibold mb-3">
            {selectedDepartment === 'all' ? 'All Contacts' : selectedDepartment}
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredContacts.map(contact => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-3 rounded cursor-pointer ${
                  selectedContact?.id === contact.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50 border'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm text-gray-600">{contact.role}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    contact.type === 'cast' ? 'bg-purple-100 text-purple-800' :
                    contact.type === 'crew' ? 'bg-blue-100 text-blue-800' :
                    contact.type === 'vendor' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {contact.type}
                  </span>
                </div>
                <div className="flex space-x-2 mt-2">
                  {contact.phone && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAction(contact.id, 'call');
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      📞 Call
                    </button>
                  )}
                  {contact.email && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAction(contact.id, 'email');
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ✉️ Email
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Details */}
        <div className="lg:col-span-2 p-6">
          {selectedContact ? (
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedContact.name}</h2>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-3 py-1 rounded-full ${
                      selectedContact.type === 'cast' ? 'bg-purple-100 text-purple-800' :
                      selectedContact.type === 'crew' ? 'bg-blue-100 text-blue-800' :
                      selectedContact.type === 'vendor' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedContact.type}
                    </span>
                    {selectedContact.department && (
                      <span className="px-3 py-1 bg-gray-100 rounded-full">
                        {selectedContact.department}
                      </span>
                    )}
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Edit Contact
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    {selectedContact.role && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        <p>{selectedContact.role}</p>
                      </div>
                    )}
                    {selectedContact.email && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <a 
                          href={`mailto:${selectedContact.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedContact.email}
                        </a>
                      </div>
                    )}
                    {selectedContact.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <a 
                          href={`tel:${selectedContact.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedContact.phone}
                        </a>
                      </div>
                    )}
                    {selectedContact.address && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <p>{selectedContact.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Rates & Availability</h3>
                  {selectedContact.rates && selectedContact.rates.length > 0 && (
                    <div className="mb-6">
                      <div className="text-sm font-medium text-gray-700 mb-2">Rates:</div>
                      <div className="space-y-2">
                        {selectedContact.rates.map((rate, index) => (
                          <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                            <span>{rate.type}</span>
                            <span>
                              {rate.currency} {rate.amount}/{rate.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Availability:</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {(selectedContact.availability || []).map((range, index) => (
                        <div 
                          key={index} 
                          className={`p-2 rounded ${
                            range.type === 'available' ? 'bg-green-50' :
                            range.type === 'unavailable' ? 'bg-red-50' :
                            'bg-blue-50'
                          }`}
                        >
                          <div className="flex justify-between text-sm">
                            <span>{new Date(range.start).toLocaleDateString()}</span>
                            <span>{new Date(range.end).toLocaleDateString()}</span>
                          </div>
                          <div className={`text-xs mt-1 ${
                            range.type === 'available' ? 'text-green-600' :
                            range.type === 'unavailable' ? 'text-red-600' :
                            'text-blue-600'
                          }`}>
                            {range.type}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select a contact to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}