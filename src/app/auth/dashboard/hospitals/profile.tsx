'use client';

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface HospitalData {
  id: string;
  name: string;
  address: string;
  photoBase64?: string;
  description?: string;
  // Add other fields as needed
}

export default function HospitalProfile() {
  const [hospital, setHospital] = useState<HospitalData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        // Get hospital ID from localStorage
        const adminData = localStorage.getItem("adminUser");
        if (!adminData) {
          router.push("/auth/login");
          return;
        }

        const { hospitalId } = JSON.parse(adminData);
        const docRef = doc(db, "hospitals", hospitalId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setHospital({
            id: docSnap.id,
            ...docSnap.data()
          } as HospitalData);
        }
      } catch (error) {
        console.error("Error fetching hospital data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalData();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hospital) {
    return <div>Hospital not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              {hospital.photoBase64 ? (
                <div className="relative h-64 rounded-lg overflow-hidden">
                  <Image
                    src={hospital.photoBase64}
                    alt={hospital.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>
            
            <div className="w-full md:w-2/3 space-y-4">
              <h1 className="text-3xl font-bold">{hospital.name}</h1>
              <p className="text-gray-600">{hospital.address}</p>
              
              {hospital.description && (
                <div className="prose max-w-none">
                  <p>{hospital.description}</p>
                </div>
              )}
              
              <Button onClick={() => router.push("/auth/dashboard/hospitals")}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}