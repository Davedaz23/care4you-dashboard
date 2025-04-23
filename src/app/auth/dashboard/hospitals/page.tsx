'use client';

import { useEffect, useState } from 'react';
import { fetchHospitals, deleteHospital } from '../../../../services/hospitalService';
import Link from 'next/link';
import DeleteModal from '@/components/DeleteModal';
import { useRouter } from 'next/navigation'; // For navigation after deletion

const HospitalsPage = () => {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter(); // To navigate programmatically

  useEffect(() => {
    const loadHospitals = async () => {
      const data = await fetchHospitals();
      setHospitals(data);
      setLoading(false);
    };
    loadHospitals();
  }, []);

  const openDeleteModal = (hospital: any) => {
    setSelectedHospital(hospital);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedHospital) {
      await deleteHospital(selectedHospital.id);
      setHospitals(hospitals.filter(h => h.id !== selectedHospital.id));
      setIsModalOpen(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Hospitals</h1>
        <Link
          href="/auth/dashboard/new"
          className="bg-[#00b4d8] hover:bg-[#009fc5] text-white px-6 py-2 rounded-lg shadow transition"
        >
          + Add Hospital
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : hospitals.length === 0 ? (
        <p className="text-gray-600">No hospitals found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map(h => (
            <div
              key={h.id}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100"
            >
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{h.name}</h2>
                <p className="text-gray-600 mt-1">{h.description}</p>
              </div>
              <div className="flex justify-end space-x-3">
                <Link
                  href={`/auth/dashboard/hospitals/${h.id}`}
                  className="bg-[#00b4d8] hover:bg-[#009fc5] text-white px-4 py-1.5 rounded-md text-sm transition"
                >
                  Edit
                </Link>
                <button
                  onClick={() => openDeleteModal(h)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-sm transition"
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
        itemName={selectedHospital?.name || ''}
      />
    </div>
  );
};

export default HospitalsPage;
