'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { loginWithPhone } from "../../../config/auth";
import { useAdminAuth } from "@/context/authContext"; // Import the auth context
// Update the path below if your PasswordInput is located elsewhere
import { PasswordInput } from '../../../components/PasswordInput';

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAdminAuth(); // Get setUser from context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!phone || !password) {
      setError("Phone number and password are required.");
      setLoading(false);
      return;
    }

    try {
      // Normalize phone number (remove any non-digit characters)
      const normalizedPhone = phone.replace(/\D/g, '');
      
      const user = await loginWithPhone(normalizedPhone, password);
      
      // Store complete user data including the normalized phone number
      const userData = {
        uid: user.uid,
        phone: user.phone, // This is the exact phone from Firestore
        role: user.role,
        name: 'Admin',
        ...(user.hospitalId && { hospitalId: user.hospitalId }),
        ...(user.hospitalName && { hospitalName: user.hospitalName })
      };

      // Update both localStorage and context
      localStorage.setItem("adminUser", JSON.stringify(userData));
      setUser(userData); // Update context state
      
      router.push("/auth/dashboard/appointments");
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-sky-300">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-sky-600 text-center mb-6">
          Admin Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Phone Number</label>
            <input
              type="tel"  // Changed to tel for better mobile input
              placeholder="Enter phone number (e.g., 09111213..)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              pattern="[0-9]{10}"  // Basic validation for 10 digits
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <p className="text-xs text-gray-500 mt-1">Enter 10-digit phone number without symbols</p>
          </div>

          <div>
        <label className="block text-sm font-medium text-gray-600">Password</label>
        <PasswordInput
         value={password}
         onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        required
        />
      </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <span
              onClick={() => router.push("/auth/signup")}
              className="text-sky-600 font-medium cursor-pointer hover:underline"
            >
              Create an account
            </span>
          </p>
        </div> */}
      </div>
    </div>
  );
}