// pages/dashboard/hospitals/[id].tsx OR app/dashboard/hospitals/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation'; // ✅ both from App Router
import { fetchHospitalById, updateHospital } from '@/services/hospitalService';
import HospitalForm from '@/components/HospitalForm';

const EditHospitalPage = () => {
  const [hospital, setHospital] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const params = useParams(); // 👈 this gives you route params
  const id = params?.id as string;

  useEffect(() => {
    const loadHospital = async () => {
      if (!id) return;
      try {
        const data = await fetchHospitalById(id);
        setHospital(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hospital:', error);
        setLoading(false);
      }
    };

    loadHospital();
  }, [id]);

  const handleEditHospital = async (data: any) => {
    try {
      await updateHospital(id, data);
      router.push('/auth/dashboard/hospitals');
    } catch (error) {
      console.error('Error updating hospital:', error);
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!hospital) return <p>Hospital not found.</p>;

  return (
    <div className="p-6">
      <HospitalForm initialData={hospital} onSubmit={handleEditHospital} />
    </div>
  );
};

export default EditHospitalPage;
