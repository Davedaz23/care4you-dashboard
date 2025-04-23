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
  getDownloadURL
} from 'firebase/storage';

export const fetchHospitals = async () => {
  const snapshot = await getDocs(collection(db, 'hospitals'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createHospital = async (hospital: any, imageFile?: File) => {
  let photoURL = '';
  if (imageFile) {
    const imageRef = ref(storage, `hospitals/${Date.now()}_${imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    photoURL = await getDownloadURL(imageRef);
  }
  const newHospital = { ...hospital, photo: photoURL };
  const docRef = await addDoc(collection(db, 'hospitals'), newHospital);
  return docRef.id;
};

export const fetchHospitalById = async (id: string) => {
  const docRef = doc(db, 'hospitals', id);
  const hospitalSnap = await getDoc(docRef);
  if (hospitalSnap.exists()) {
    return { id: hospitalSnap.id, ...hospitalSnap.data() };
  } else {
    throw new Error('Hospital not found');
  }
};

export const updateHospital = async (id: string, data: any, imageFile?: File) => {
  const docRef = doc(db, 'hospitals', id);

  let updatedData = { ...data };

  if (imageFile) {
    const imageRef = ref(storage, `hospitals/${Date.now()}_${imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    const photoURL = await getDownloadURL(imageRef);
    updatedData.photo = photoURL;
  }

  await updateDoc(docRef, updatedData);
};

export const deleteHospital = async (id: string) => {
  await deleteDoc(doc(db, 'hospitals', id));
};
