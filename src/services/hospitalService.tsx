import { db, storage } from '@/config/firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

interface Hospital {
  id: string;
  name: string;
  description: string;
  photo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const createHospital = async (
  hospital: Omit<Hospital, 'id' | 'photo'>,
  imageFile?: File
): Promise<Hospital> => {
  try {
    let photoURL = '';
    if (imageFile) {
      const imageRef = ref(storage, `hospitals/${Date.now()}_${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      photoURL = await getDownloadURL(imageRef);
    }

    const newHospital = {
      ...hospital,
      photo: photoURL,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'hospitals'), newHospital);
    
    return {
      id: docRef.id,
      ...newHospital
    };
  } catch (error) {
    console.error('Error creating hospital:', error);
    throw new Error('Failed to create hospital');
  }
};

export const fetchHospitals = async (): Promise<Hospital[]> => {
  try {
    const snapshot = await getDocs(collection(db, "hospitals"));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        description: data.description || '',
        photo: data.photo || '',
        createdAt: data.createdAt?.toDate() || null,
        updatedAt: data.updatedAt?.toDate() || null
      };
    });
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    throw new Error('Failed to fetch hospitals');
  }
};

export const fetchHospitalById = async (id: string): Promise<Hospital> => {
  try {
    const docRef = doc(db, 'hospitals', id);
    const hospitalSnap = await getDoc(docRef);
    
    if (!hospitalSnap.exists()) {
      throw new Error('Hospital not found');
    }

    const data = hospitalSnap.data();
    return {
      id: hospitalSnap.id,
      name: data.name || '',
      description: data.description || '',
      photo: data.photo || '',
      createdAt: data.createdAt?.toDate() || null,
      updatedAt: data.updatedAt?.toDate() || null
    };
  } catch (error) {
    console.error(`Error fetching hospital with ID ${id}:`, error);
    throw error;
  }
};

export const updateHospital = async (
  id: string,
  data: Omit<Hospital, 'id' | 'photo'>,
  imageFile?: File
): Promise<void> => {
  try {
    const docRef = doc(db, 'hospitals', id);
    const hospitalSnap = await getDoc(docRef);
    
    if (!hospitalSnap.exists()) {
      throw new Error('Hospital not found');
    }

    const currentData = hospitalSnap.data();
    let photoURL = currentData.photo || '';
    
    // Delete old image if new one is provided
    if (imageFile && currentData.photo) {
      try {
        const oldImageRef = ref(storage, currentData.photo);
        await deleteObject(oldImageRef);
      } catch (error) {
        console.warn('Error deleting old image:', error);
      }
    }

    // Upload new image if provided
    if (imageFile) {
      const imageRef = ref(storage, `hospitals/${Date.now()}_${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      photoURL = await getDownloadURL(imageRef);
    }

    await updateDoc(docRef, {
      ...data,
      photo: photoURL,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error(`Error updating hospital with ID ${id}:`, error);
    throw error;
  }
};

export const deleteHospital = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'hospitals', id);
    const hospitalSnap = await getDoc(docRef);
    
    if (!hospitalSnap.exists()) {
      throw new Error('Hospital not found');
    }

    // Delete associated image if exists
    const data = hospitalSnap.data();
    if (data.photo) {
      try {
        const imageRef = ref(storage, data.photo);
        await deleteObject(imageRef);
      } catch (error) {
        console.warn('Error deleting hospital image:', error);
      }
    }

    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting hospital with ID ${id}:`, error);
    throw error;
  }
};