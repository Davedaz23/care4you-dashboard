// components/UsersList.tsx
'use client';

import { useEffect, useState } from "react";
import { getDocs, collection, deleteDoc, doc } from "firebase/firestore";
import db from "../config/firestoreConfig"; // Adjust this import if necessary
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons from react-icons

type User = {
  id: string;
  phone: string;
  role: string;
  password: string;
  [key: string]: any; // Allow extra fields from Firestore if needed
};

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Predefined admin credentials
  const predefinedUsers = [
    {
      id: "admin-account",
      phone: "Admin Account",
      role: "admin",
      password: "admin123" // This is just for display, not stored in Firebase
    },
    {
      id: "hospital-admin-account",
      phone: "Hospital Admin Account",
      role: "hospitalAdmin",
      password: "hospital123" // This is just for display, not stored in Firebase
    }
  ];

  // Toggle password visibility
  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  useEffect(() => {
    async function fetchUsers() {
      try {
        const userRef = collection(db, "adminuser"); // Query the "adminuser" collection
        const querySnapshot = await getDocs(userRef);

        // Map through the documents and get the user data
        const usersData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id, // Firebase document ID
            phone: data.phone || "Unknown", // Ensure phone exists
            role: data.role || "user",      // Ensure role exists
            password: data.password ? "********" : "Not set",
            ...data // Include any other fields
          };
        });

        // Initialize visibility state for all users
        const initialVisibility: Record<string, boolean> = {};
        [...predefinedUsers, ...usersData].forEach(user => {
          initialVisibility[user.id] = false;
        });
        setVisiblePasswords(initialVisibility);

        // Combine predefined users with fetched users
        setUsers([...predefinedUsers, ...usersData]);
      } catch (err: any) {
        setError(err.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    // Prevent deletion of predefined accounts
    if (userId === "admin-account" || userId === "hospital-admin-account") {
      alert("Cannot delete predefined admin accounts.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        setLoading(true); // Show loading during delete
        const userDocRef = doc(db, "adminuser", userId);
        await deleteDoc(userDocRef); // Delete the user from Firestore
        setUsers(users.filter(user => user.id !== userId)); // Update the local state to remove the deleted user
        alert("User deleted successfully.");
      } catch (err: any) {
        setError(err.message || "Failed to delete the user.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h2 className="text-xl font-bold mb-4">List of Users</h2>
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="border-b px-4 py-2">Phone Number</th>
            <th className="border-b px-4 py-2">Role</th>
            <th className="border-b px-4 py-2">Password</th>
            <th className="border-b px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="border-b px-4 py-2">{user.phone}</td>
              <td className="border-b px-4 py-2">{user.role}</td>
              <td className="border-b px-4 py-2 flex items-center">
                {visiblePasswords[user.id] ? user.password : "********"}
                <button 
                  onClick={() => togglePasswordVisibility(user.id)}
                  className="ml-2 text-gray-600 hover:text-gray-800"
                  aria-label={visiblePasswords[user.id] ? "Hide password" : "Show password"}
                >
                  {visiblePasswords[user.id] ? <FaEyeSlash /> : <FaEye />}
                </button>
              </td>
              <td className="border-b px-4 py-2">
                {!user.id.includes("-account") && ( // Only show delete for non-predefined accounts
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="ml-4 text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}