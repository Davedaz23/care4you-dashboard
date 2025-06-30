'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchHospitalById, updateHospital } from '@/services/hospitalService';
import HospitalForm from '@/components/HospitalForm';
import { Hospital } from '@/types/hospital';

const EditHospitalPage = () => {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    const loadHospital = async () => {
      if (!id) return;
      try {
        const data = await fetchHospitalById(id);
        setHospital(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load hospital');
      } finally {
        setLoading(false);
      }
    };

    loadHospital();
  }, [id]);
const handleEditHospital = async (data: Omit<Hospital, 'id'>) => {

  // const handleEditHospital = async (data: Omit<Hospital, 'id'>) => {
    try {
      await updateHospital(id, data);
      router.push('/auth/dashboard/hospitals');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update hospital');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!hospital) return <div>Hospital not found</div>;

  return (
    <div className="p-6">
      <HospitalForm 
        initialData={hospital}
        onSubmit={handleEditHospital}
        onCancel={() => router.push('/auth/dashboard/hospitals')}
      />
    </div>
  );
};

export default EditHospitalPage;