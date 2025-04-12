// components/UsersList.tsx
'use client';

import { useEffect, useState } from "react";
import { getDocs, collection, deleteDoc, doc } from "firebase/firestore";
import db from "../config/firestoreConfig"; // Adjust this import if necessary

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const userRef = collection(db, "adminuser"); // Query the "adminuser" collection
        const querySnapshot = await getDocs(userRef);

        // Map through the documents and get the user data
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id, // Firebase document ID
          ...doc.data(), // All fields from the Firestore document
        }));

        setUsers(usersData);
      } catch (err: any) {
        setError(err.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleDelete = async (userId: string) => {
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
            <th className="border-b px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="border-b px-4 py-2">{user.phone}</td>
              <td className="border-b px-4 py-2">{user.role}</td>
              <td className="border-b px-4 py-2">
                <button
                  onClick={() => handleDelete(user.id)} // Call delete function when clicked
                  className="ml-4 text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
