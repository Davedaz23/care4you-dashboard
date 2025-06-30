'use client';

import { useEffect, useState } from 'react';
import { fetchHospitals, deleteHospital } from '../../../../services/hospitalService';
import Link from 'next/link';
import DeleteModal from '@/components/DeleteModal';
import { useRouter } from 'next/navigation';

interface Hospital {
  id: string;
  name: string;
  description: string;
  // Add other properties as needed
}

const HospitalsPage = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const data = await fetchHospitals();
        const validatedData = data.map(hospital => ({
          id: hospital.id,
          name: hospital.name || 'Unnamed Hospital',
          description: hospital.description || '',
        }));
        setHospitals(validatedData);
      } catch (error) {
        console.error('Failed to fetch hospitals:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHospitals();
  }, []);

  const openDeleteModal = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedHospital) return;
    
    try {
      await deleteHospital(selectedHospital.id);
      setHospitals(prev => prev.filter(h => h.id !== selectedHospital.id));
      setIsModalOpen(false);
      router.refresh(); // Refresh the page to ensure data consistency
    } catch (error) {
      console.error('Failed to delete hospital:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Hospitals</h1>
        {/* <Link
          href="/auth/dashboard/hospitals/new"
          className="bg-[#00b4d8] hover:bg-[#009fc5] text-white px-6 py-2 rounded-lg shadow transition"
          aria-label="Add new hospital"
        >
          + Add Hospital
        </Link> */}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500">Loading hospitals...</p>
        </div>
      ) : hospitals.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-600 mb-4">No hospitals found</p>
          <Link
            href="/auth/dashboard/new"
            className="bg-[#00b4d8] hover:bg-[#009fc5] text-white px-4 py-2 rounded-md text-sm transition"
          >
            Create your first hospital
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map(hospital => (
            <div
              key={hospital.id}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100"
            >
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{hospital.name}</h2>
                <p className="text-gray-600 mt-1 line-clamp-2">{hospital.description}</p>
              </div>
              <div className="flex justify-end space-x-3">
                <Link
                  href={`/auth/dashboard/hospitals/${hospital.id}`}
                  className="bg-[#00b4d8] hover:bg-[#009fc5] text-white px-4 py-1.5 rounded-md text-sm transition"
                  aria-label={`Edit ${hospital.name}`}
                >
                  Edit
                </Link> 
               
                <button
                  onClick={() => openDeleteModal(hospital)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-sm transition"
                  aria-label={`Delete ${hospital.name}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedHospital?.name || 'this hospital'}
      />
    </div>
  );
};

export default HospitalsPage;