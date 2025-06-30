'use client';

import { useRouter } from 'next/navigation';
import HospitalForm from '@/components/HospitalForm';
import { createHospital } from '@/services/hospitalService';
import { Hospital } from '@/types/hospital'; // Assuming you have this type defined

const NewHospitalPage = () => {
  const router = useRouter();

  const handleAddHospital = async (data: Omit<Hospital, 'id'>) => {
    try {
      await createHospital(data);
      router.push('/auth/dashboard/hospitals');
      router.refresh(); // Ensure the list page gets fresh data
    } catch (error) {
      console.error('Error adding hospital:', error);
      // Consider adding toast notifications here
      throw error; // Re-throw to let HospitalForm handle the error
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Hospital</h1>
      <HospitalForm 
        onSubmit={handleAddHospital}
        onCancel={() => router.push('/auth/dashboard/hospitals')}
      />
    </div>
  );
};

export default NewHospitalPage;