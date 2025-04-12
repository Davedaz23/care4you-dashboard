'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { createAdminUser } from "../../../config/auth"; // Import your createAdminUser function

export default function SignUpPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin"); // Default role is "admin"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // State for loading
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Start loading when form is submitted

    // Basic validation for phone number, password, and role
    if (!phone || !password || !role) {
      setError("Phone number, password, and role are required.");
      setLoading(false);
      return;
    }

    try {
      // Create a new admin user
      const userId = await createAdminUser(phone, password, role);
      localStorage.setItem("adminUser", JSON.stringify({ phone, role, userId })); // Save user info in localStorage
      router.push("/auth/login"); // Redirect to login page after successful sign-up
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false); // Stop loading after the request is finished
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm mx-auto mt-10">
      <h2 className="text-xl font-bold text-center">Create Admin Account</h2>

      <input
        type="text"
        placeholder="Phone number"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        required
        className="border p-2"
      />
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="border p-2"
      />

      {/* Role selection */}
      <select
        value={role}
        onChange={e => setRole(e.target.value)}
        className="border p-2"
      >
        <option value="admin">Admin</option>
        <option value="superadmin">Super Admin</option>
        {/* Add more roles if needed */}
      </select>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button 
        type="submit" 
        className={`bg-blue-500 text-white py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading} // Disable button during loading
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>

      <div className="mt-4 text-center">
        <p className="text-sm">
          Already have an account?{" "}
          <a 
            href="/auth/login" // Link back to the login page
            className="text-blue-500 hover:underline"
          >
            Login here
          </a>
        </p>
      </div>
    </form>
  );
}
