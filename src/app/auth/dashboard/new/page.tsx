// pages/dashboard/hospitals/new.tsx
'use client';

import HospitalForm from '@/components/HospitalForm';
import { createHospital } from '@/services/hospitalService';

const NewHospitalPage = () => {
  const handleAddHospital = async (data: any) => {
    try {
      await createHospital(data);
    } catch (error) {
      console.error('Error adding hospital:', error);
    }
  };

  return (
    <div className="p-6">
      <HospitalForm onSubmit={handleAddHospital} />
    </div>
  );
};

export default NewHospitalPage;
