// components/UsersList.tsx
'use client';

import { useEffect, useState } from "react";
import { getDocs, collection, deleteDoc, doc } from "firebase/firestore";
import db from "../config/firestoreConfig";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Define a more specific type for User
type UserRole = 'admin' | 'hospitalAdmin' | 'user';

interface User {
  id: string;
  phone: string;
  role: UserRole;
  password: string;
  // Add other fields if they exist in your Firestore documents
}

// Define type for predefined users
interface PredefinedUser extends Omit<User, 'id'> {
  id: 'admin-account' | 'hospital-admin-account';
}

export default function UsersList() {
  const [users, setUsers] = useState<(User | PredefinedUser)[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Predefined admin credentials with proper typing
  const predefinedUsers: PredefinedUser[] = [
    {
      id: "admin-account",
      phone: "Admin Account",
      role: "admin",
      password: "admin123"
    },
    {
      id: "hospital-admin-account",
      phone: "Hospital Admin Account",
      role: "hospitalAdmin",
      password: "hospital123"
    }
  ];

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  useEffect(() => {
    async function fetchUsers() {
      try {
        const userRef = collection(db, "adminuser");
        const querySnapshot = await getDocs(userRef);

        const usersData: User[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            phone: data.phone || "Unknown",
            role: data.role || "user",
            password: data.password ? "********" : "Not set",
            ...data
          };
        });

        // Initialize visibility state
        const initialVisibility: Record<string, boolean> = {};
        [...predefinedUsers, ...usersData].forEach(user => {
          initialVisibility[user.id] = false;
        });
        setVisiblePasswords(initialVisibility);

        setUsers([...predefinedUsers, ...usersData]);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (userId === "admin-account" || userId === "hospital-admin-account") {
      alert("Cannot delete predefined admin accounts.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        setLoading(true);
        const userDocRef = doc(db, "adminuser", userId);
        await deleteDoc(userDocRef);
        setUsers(users.filter(user => user.id !== userId));
        alert("User deleted successfully.");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to delete the user.");
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
                {!user.id.includes("-account") && (
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