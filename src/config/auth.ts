import { getDocs, query, where, getDoc, collection, doc, setDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";
import db from "./firestoreConfig";
import { v4 as uuid } from "uuid";

// Login with phone number
export const loginWithPhone = async (phone: string, password: string) => {
  const userRef = collection(db, "adminuser");
  const q = query(userRef, where("phone", "==", phone));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("User not found. Please sign up.");
  }

  const userDoc = querySnapshot.docs[0];
  const userData = userDoc.data();

  const isPasswordValid = await bcrypt.compare(password, userData.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  return {
    uid: userDoc.id,
    phone: userData.phone,
    role: userData.role,
  };
};

// Create a new admin user (Sign Up)
export const createAdminUser = async (phone: string, password: string, role: string) => {
  // Check if the phone number already exists
  const userRef = collection(db, "adminuser");
  const q = query(userRef, where("phone", "==", phone));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    // If the phone number exists in the database, throw an error
    throw new Error("Phone number is already registered.");
  }

  // If phone number doesn't exist, proceed with user creation
  const hashedPassword = await bcrypt.hash(password, 10);
  const uid = uuid(); // Generate a unique ID for the user
  
  // Create the new admin user document in the Firestore database
  await setDoc(doc(db, "adminuser", uid), {
    phone,
    password: hashedPassword,
    role,
  });

  return uid; // Return the user ID after successful creation
};
