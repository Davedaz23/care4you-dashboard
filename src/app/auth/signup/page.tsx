'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { createAdminUser } from "../../../config/auth";

type UserRole = 'admin' | 'superadmin'; // Define possible roles

interface SignUpForm {
  phone: string;
  password: string;
  role: UserRole;
}

export default function SignUpPage() {
  const [form, setForm] = useState<SignUpForm>({
    phone: "",
    password: "",
    role: "admin"
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { phone, password, role } = form;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!phone || !password || !role) {
      setError("Phone number, password, and role are required.");
      setLoading(false);
      return;
    }

    try {
      const userId = await createAdminUser(phone, password, role);
      localStorage.setItem("adminUser", JSON.stringify({ phone, role, userId }));
      router.push("/auth/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-sky-300">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-sky-600 text-center mb-6">
          Create Admin Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Phone Number</label>
            <input
              type="text"
              name="phone"
              placeholder="Enter phone number"
              value={phone}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={password}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Select Role</label>
            <select
              name="role"
              value={role}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-sky-600 font-medium hover:underline"
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}