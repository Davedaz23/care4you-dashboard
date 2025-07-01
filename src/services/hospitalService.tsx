import { db, storage } from '@/config/firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  DocumentData
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

import { Hospital } from '@/types/hospital';

// Helper function to convert Firestore document to Hospital type
const toHospital = (doc: DocumentData): Hospital => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || '',
    address: data.address || '',
    photo: data.photo || '',
    description: data.description || '',
    // Map other fields as needed
  };
};

export const fetchHospitals = async (): Promise<Hospital[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'hospitals'));
    return snapshot.docs.map(doc => toHospital(doc));
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    throw new Error('Failed to fetch hospitals');
  }
};

export const createHospital = async (
  hospital: Omit<Hospital, 'id' | 'photo'>,
  imageFile?: File
): Promise<string> => {
  try {
    let photoURL = '';
    if (imageFile) {
      const imageRef = ref(storage, `hospitals/${Date.now()}_${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      photoURL = await getDownloadURL(imageRef);
    }

    const newHospital: Omit<Hospital, 'id'> = {
      ...hospital,
      photo: photoURL
    };

    const docRef = await addDoc(collection(db, 'hospitals'), newHospital);
    return docRef.id;
  } catch (error) {
    console.error('Error creating hospital:', error);
    throw new Error('Failed to create hospital');
  }
};

export const fetchHospitalById = async (id: string): Promise<Hospital> => {
  try {
    const docRef = doc(db, 'hospitals', id);
    const hospitalSnap = await getDoc(docRef);
    
    if (!hospitalSnap.exists()) {
      throw new Error('Hospital not found');
    }
    
    return toHospital(hospitalSnap);
  } catch (error) {
    console.error(`Error fetching hospital with ID ${id}:`, error);
    throw new Error('Failed to fetch hospital');
  }
};

export const updateHospital = async (
  id: string,
  data: Partial<Omit<Hospital, 'id'>>,
  imageFile?: File
): Promise<void> => {
  try {
    const docRef = doc(db, 'hospitals', id);
    const updatedData: Partial<Hospital> = { ...data };

    if (imageFile) {
      const imageRef = ref(storage, `hospitals/${Date.now()}_${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      const photoURL = await getDownloadURL(imageRef);
      updatedData.photo = photoURL;
    }

    await updateDoc(docRef, updatedData);
  } catch (error) {
    console.error(`Error updating hospital with ID ${id}:`, error);
    throw new Error('Failed to update hospital');
  }
};

export const deleteHospital = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'hospitals', id));
  } catch (error) {
    console.error(`Error deleting hospital with ID ${id}:`, error);
    throw new Error('Failed to delete hospital');
  }
};