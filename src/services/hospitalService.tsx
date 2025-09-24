import { db } from '@/config/firebaseConfig';
import { Hospital } from '@/types/hospital';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc
} from 'firebase/firestore';

export const fetchHospitals = async (): Promise<Hospital[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'hospitals'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || '',
      address: doc.data().address || '',
      description: doc.data().description || '',
      photoBase64: doc.data().photoBase64 || null,
      services: doc.data().services || [],
      email: doc.data().email || null,
      website: doc.data().website || null,
      hours: doc.data().hours || '24/7',
      status: doc.data().status || 'active',
      phone: doc.data().phone || '',
      createdAt: doc.data().createdAt || new Date().toISOString(),
      adminId: doc.data().adminId || ''
    }));
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    throw new Error('Failed to fetch hospitals');
  }
};

export const addHospital = async (hospitalData: Omit<Hospital, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'hospitals'), {
      ...hospitalData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error("Failed to add hospital: " + error.message);
  }
};

export const fetchHospitalById = async (id: string): Promise<Hospital> => {
  try {
    const docRef = doc(db, 'hospitals', id);
    const hospitalSnap = await getDoc(docRef);
    
    if (!hospitalSnap.exists()) {
      throw new Error('Hospital not found');
    }
    
    return {
      id: hospitalSnap.id,
      ...hospitalSnap.data()
    } as Hospital;
  } catch (error) {
    console.error(`Error fetching hospital with ID ${id}:`, error);
    throw new Error('Failed to fetch hospital');
  }
};