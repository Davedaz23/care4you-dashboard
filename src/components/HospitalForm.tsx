// components/HospitalForm.tsx
'use client';

import { useState } from 'react';
import { Hospital } from '@/types/hospital';

interface HospitalFormProps {
  initialData?: Omit<Hospital, 'id'>;
  onSubmit: (data: Omit<Hospital, 'id'>) => Promise<void>;
  onCancel?: () => void;
}

const HospitalForm = ({ initialData, onSubmit, onCancel }: HospitalFormProps) => {
  const [formData, setFormData] = useState<Omit<Hospital, 'id'>>({
    name: initialData?.name || '',
    address: initialData?.address || '',
    description: initialData?.description || '',
    photoBase64: initialData?.photoBase64 || '', // Changed from 'photo' to 'photoBase64'
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    services: initialData?.services || [],
    website: initialData?.website || '',
    hours: initialData?.hours || '24/7',
    status: initialData?.status || 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save hospital');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value.split(',').map(item => item.trim()) 
    }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-6">
        {initialData ? 'Edit Hospital' : 'Add New Hospital'}
      </h2>

      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
              Hospital Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full mt-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b4d8] transition"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
              Phone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full mt-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b4d8] transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-semibold text-gray-700">
            Address *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full mt-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b4d8] transition"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b4d8] transition"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-semibold text-gray-700">
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full mt-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b4d8] transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full mt-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b4d8] transition"
          />
        </div>

        <div>
          <label htmlFor="services" className="block text-sm font-semibold text-gray-700">
            Services (comma-separated)
          </label>
          <input
            type="text"
            id="services"
            name="services"
            value={formData.services?.join(', ') || ''}
            onChange={handleArrayChange}
            placeholder="Emergency, Surgery, Pediatrics"
            className="w-full mt-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b4d8] transition"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="hours" className="block text-sm font-semibold text-gray-700">
              Operating Hours
            </label>
            <input
              type="text"
              id="hours"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              placeholder="24/7 or 8:00 AM - 6:00 PM"
              className="w-full mt-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b4d8] transition"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full mt-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b4d8] transition"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="photoBase64" className="block text-sm font-semibold text-gray-700">
            Photo URL
          </label>
          <input
            type="url"
            id="photoBase64"
            name="photoBase64"
            value={formData.photoBase64 || ''}
            onChange={handleChange}
            placeholder="Enter image URL"
            className="w-full mt-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b4d8] transition"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#00b4d8] hover:bg-[#009fc5]'} transition`}
          >
            {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Add Hospital'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HospitalForm;