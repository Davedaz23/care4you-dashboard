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
    description: initialData?.description || '',
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
      throw err; // Re-throw to let parent component handle if needed
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-6">
        {initialData ? 'Edit Hospital' : 'Add New Hospital'}
      </h2>

      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
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

        <div className="mb-6">
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

        <div className="flex justify-end space-x-3">
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