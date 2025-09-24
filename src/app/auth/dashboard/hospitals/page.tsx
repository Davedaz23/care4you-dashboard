'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import Link from 'next/link';
import DeleteModal from '@/components/DeleteModal';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Hospital {
  id: string;
  name: string;
  description: string;
  photoBase64?: string;
  address?: string;
  location?: string;
  services?: string[] | string;
  email?: string;
  website?: string;
  hours?: string;
  status?: string;
  phone?: string;
}

const HospitalsPage = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        setError(null);

        const hospitalsCollection = collection(db, 'hospitals');
        const snapshot = await getDocs(hospitalsCollection);
        
        const hospitalsData = snapshot.docs.map(doc => {
          const data = doc.data();
          
          // Ensure photoBase64 is properly formatted
          let photoBase64 = data.photoBase64 || undefined;
          if (photoBase64 && !photoBase64.startsWith('data:image/')) {
            // If stored incorrectly, try to reconstruct the Base64 string
            photoBase64 = `data:image/jpeg;base64,${photoBase64}`;
          }

          // Handle services whether they come as array or comma-separated string
          const services = Array.isArray(data.services) 
            ? data.services 
            : typeof data.services === 'string' 
              ? data.services.split(',').map(s => s.trim()) 
              : [];

          return {
            id: doc.id,
            name: data.name || '',
            description: data.description || '',
            photoBase64: photoBase64,
            address: data.address || '',
            location: data.location || '',
            services: services,
            email: data.email || '',
            website: data.website || '',
            hours: data.hours || '24/7',
            status: data.status || 'active',
            phone: data.phone || ''
          } as Hospital;
        });
        
        setHospitals(hospitalsData);
      } catch (err) {
        console.error('Error fetching hospitals:', err);
        setError('Failed to load hospitals. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const handleDeleteHospital = async (hospitalId: string) => {
    try {
      await deleteDoc(doc(db, 'hospitals', hospitalId));
      setHospitals(prev => prev.filter(h => h.id !== hospitalId));
      setIsModalOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Error deleting hospital:', err);
      setError('Failed to delete hospital. Please try again.');
    }
  };

  const openDeleteModal = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedHospital) {
      await handleDeleteHospital(selectedHospital.id);
    }
  };

  const handleImageLoad = (hospitalId: string) => {
    setLoadedImages(prev => ({ ...prev, [hospitalId]: true }));
  };

  const handleImageError = (hospitalId: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Failed to load image for hospital:', hospitalId);
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    target.style.display = 'none';
    handleImageLoad(hospitalId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => window.location.reload()} 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Hospitals</h1>
        <Link
          href="/auth/dashboard/signupHospital"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition"
        >
          Add New Hospital
        </Link>
      </div>

      {hospitals.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-600 mb-4">No hospitals found</p>
          <Link
            href="/auth/dashboard/hospitals/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition"
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
              <div className="mb-4 h-48 bg-gray-100 rounded-lg overflow-hidden relative">
                {!loadedImages[hospital.id] && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                )}
                {hospital.photoBase64 ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={hospital.photoBase64}
                      alt={`${hospital.name} hospital`}
                      fill
                      className={`object-cover ${!loadedImages[hospital.id] ? 'opacity-0' : 'opacity-100'}`}
                      unoptimized={true}
                      onLoadingComplete={() => handleImageLoad(hospital.id)}
                      onError={(e) => handleImageError(hospital.id, e)}
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{hospital.name}</h2>
                <p className="text-gray-600 mt-1 line-clamp-2">{hospital.description}</p>
                
                {hospital.address && (
                  <div className="mt-2 flex items-start">
                    <svg className="w-4 h-4 mt-1 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-gray-500 text-sm">{hospital.address}</p>
                  </div>
                )}
                
                {hospital.phone && (
                  <div className="mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <p className="text-gray-500 text-sm">{hospital.phone}</p>
                  </div>
                )}
                
                {hospital.services && (
                  (() => {
                    const servicesArray = Array.isArray(hospital.services)
                      ? hospital.services
                      : typeof hospital.services === 'string'
                        ? hospital.services.split(',').map(s => s.trim())
                        : [];
                    return servicesArray.length > 0 ? (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Services:</h4>
                        <div className="flex flex-wrap gap-1">
                          {servicesArray.slice(0, 3).map((service, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {service}
                            </span>
                          ))}
                          {servicesArray.length > 3 && (
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                              +{servicesArray.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    ) : null;
                  })()
                )}
                
                {hospital.status && (
                  <div className="mt-3">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      hospital.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {hospital.status}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <Link
                  href={'#'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm transition"
                >
                  Edit
                </Link> 
                <button
                  onClick={() => openDeleteModal(hospital)}
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
        itemName={selectedHospital?.name || 'this hospital'}
      />
    </div>
  );
};

export default HospitalsPage;