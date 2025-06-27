import { 
  getDocs, 
  query, 
  where, 
  getDoc, 
  collection, 
  doc, 
  setDoc,
  addDoc,
  updateDoc,
  onSnapshot
} from "firebase/firestore";
import bcrypt from "bcryptjs";
import db from "./firestoreConfig";
import { v4 as uuid } from "uuid";


export const changePassword = async (
  uid: string,
  currentPassword: string,
  newPassword: string
) => {
  try {
    // 1. Verify current password
    const userDoc = await getDoc(doc(db, "adminuser", uid));
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();
    const isPasswordValid = await bcrypt.compare(currentPassword, userData.password);
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // 2. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update password in Firestore
    await updateDoc(doc(db, "adminuser", uid), {
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

// Add this function to your exports
export const subscribeToAuthChanges = (callback: (user: any | null) => void) => {
  // Get the user ID from localStorage (where you presumably store it after login)
  const storedUser = localStorage.getItem('adminUser');
  let userId: string | null = null;
  
  try {
    userId = storedUser ? JSON.parse(storedUser).uid : null;
  } catch (e) {
    console.error("Error parsing stored user", e);
  }

  if (!userId) {
    callback(null);
    return () => {}; // Return empty unsubscribe function
  }

  // Subscribe to the user document in Firestore
  const userDocRef = doc(db, "adminuser", userId);
  const unsubscribe = onSnapshot(userDocRef, (doc) => {
    if (doc.exists()) {
      const userData = doc.data();
      callback({
        uid: doc.id,
        ...userData
      });
    } else {
      callback(null);
    }
  });

  return unsubscribe;
};

// Enhanced login with phone number that handles hospital role specifically
export const loginWithPhone = async (phone: string, password: string, requiredRole?: string) => {
  const userRef = collection(db, "adminuser");
  const q = query(userRef, where("phone", "==", phone));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("User not found. Please sign up.");
  }

  const userDoc = querySnapshot.docs[0];
  const userData = userDoc.data();

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, userData.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  // Check required fields exist
  if (!userData.phone || !userData.role) {
    throw new Error("Invalid user data");
  }

  // Return complete user data
  return {
    uid: userDoc.id,
    phone: userData.phone, // This ensures the same phone number is returned
    role: userData.role,
    name: userData.name,
    hospitalId: userData.hospitalId,
    hospitalName: userData.hospitalName
  };
};

// Create a new admin user (Sign Up)
export const createAdminUser = async (
  phone: string, 
  password: string, 
  role: string,
  hospitalId?: string,
  hospitalName?: string
) => {
  // Check if the phone number already exists
  const userRef = collection(db, "adminuser");
  const q = query(userRef, where("phone", "==", phone));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error("Phone number is already registered.");
  }

  // If phone number doesn't exist, proceed with user creation
  const hashedPassword = await bcrypt.hash(password, 10);
  const uid = uuid();
  const userData: any = {
    phone,
    password: hashedPassword,
    role,
    createdAt: new Date().toISOString()
  };

  // Add hospital info if provided
  if (hospitalId) userData.hospitalId = hospitalId;
  if (hospitalName) userData.hospitalName = hospitalName;

  await setDoc(doc(db, "adminuser", uid), userData);

  return uid;
};

// Register a new hospital (combines user and hospital creation)
export const registerHospital = async (
  phone: string,
  password: string,
  hospitalName: string,
  address: string,
  description?: string
) => {
  // First create the hospital record
  const hospitalData = {
    name: hospitalName,
    address,
    description: description || "",
    createdAt: new Date().toISOString(),
    status: "active"
  };

  const hospitalRef = await addDoc(collection(db, "hospitals"), hospitalData);
  const hospitalId = hospitalRef.id;

  // Then create the admin user with hospital role
  const userId = await createAdminUser(
    phone,
    password,
    "hospital",
    hospitalId,
    hospitalName
  );

  // Update hospital with admin user ID
  await setDoc(doc(db, "hospitals", hospitalId), {
    adminId: userId
  }, { merge: true });

  return {
    userId,
    hospitalId
  };
};

// Get hospital by ID
export const getHospitalById = async (hospitalId: string) => {
  const docRef = doc(db, "hospitals", hospitalId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("Hospital not found");
  }

  return {
    id: docSnap.id,
    ...docSnap.data()
  };
};

// Get hospital by admin ID
export const getHospitalByAdminId = async (adminId: string) => {
  const q = query(
    collection(db, "hospitals"),
    where("adminId", "==", adminId)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  
  const hospitalData = snapshot.docs[0].data();
  return {
    id: snapshot.docs[0].id,
    name: hospitalData.name || null, // Ensure 'name' is included
    ...hospitalData
  };
};

// Add a new hospital to the hospitals collection
export const addHospital = async (hospitalData: any) => {
  try {
    const docRef = await addDoc(collection(db, "hospitals"), hospitalData);
    return docRef.id;
  } catch (error: any) {
    throw new Error("Failed to add hospital: " + error.message);
  }
};

// Specific hospital login function
export const loginHospitalAdmin = async (phone: string, password: string) => {
  return loginWithPhone(phone, password, "hospital");
};
