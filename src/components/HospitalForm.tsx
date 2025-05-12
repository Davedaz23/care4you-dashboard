// components/HospitalForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // ✅ App Router
import { createHospital, updateHospital } from '../services/hospitalService';

type HospitalFormProps = {
  initialData?: any; // For Edit
  onSubmit: (data: any) => void;
};

const HospitalForm = ({ initialData, onSubmit }: HospitalFormProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const data = { name, description };

    try {
      await onSubmit(data);
      router.push('/auth/dashboard/hospitals'); // Redirect after submission
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-6">{initialData ? 'Edit Hospital' : 'Add New Hospital'}</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
            Hospital Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full mt-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b4d8] transition"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full mt-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b4d8] transition"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/hospitals')}
            className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-6 py-2 rounded-md text-white ${loading ? 'bg-gray-400' : 'bg-[#00b4d8] hover:bg-[#009fc5]'} transition`}
            disabled={loading}
          >
            {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Add Hospital'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HospitalForm;
