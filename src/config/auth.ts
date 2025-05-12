import { 
  getDocs, 
  query, 
  where, 
  getDoc, 
  collection, 
  doc, 
  setDoc,
  addDoc 
} from "firebase/firestore";
import bcrypt from "bcryptjs";
import db from "./firestoreConfig";
import { v4 as uuid } from "uuid";

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

  // Check role if required
  if (requiredRole && userData.role !== requiredRole) {
    throw new Error(`Access restricted to ${requiredRole} users only`);
  }

  // For hospital admins, verify hospital exists
  let hospitalDetails = null;
  if (userData.role === "hospital") {
    try {
      hospitalDetails = await getHospitalByAdminId(userDoc.id);
      if (!hospitalDetails) {
        throw new Error("Associated hospital not found");
      }
    } catch (error) {
      console.error("Error fetching hospital details:", error);
    }
  }

  return {
    uid: userDoc.id,
    phone: userData.phone,
    role: userData.role,
    hospitalId: userData.hospitalId || hospitalDetails?.id || null,
    hospitalName: userData.hospitalName || hospitalDetails?.name || null,
    hospitalData: userData.role === "hospital" ? hospitalDetails : null
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