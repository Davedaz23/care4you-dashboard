'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { loginWithPhone } from "../../../config/auth";
import { useAdminAuth } from "@/context/authContext";
import { PasswordInput } from '../../../components/PasswordInput';

interface LoginForm {
  phone: string;
  password: string;
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({
    phone: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAdminAuth();

  const { phone, password } = form;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      password: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!phone || !password) {
      setError("Phone number and password are required.");
      setLoading(false);
      return;
    }

    try {
      const normalizedPhone = phone.replace(/\D/g, '');
      const user = await loginWithPhone(normalizedPhone, password,"hospital");
      
      const userData = {
        uid: user.uid,
        phone: user.phone,
        role: user.role,
        name: 'Admin',
        ...(user.hospitalId && { hospitalId: user.hospitalId }),
        ...(user.hospitalName && { hospitalName: user.hospitalName })
      };

      localStorage.setItem("adminUser", JSON.stringify(userData));
      setUser(userData);
      
      router.push("/auth/dashboard/appointments");
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
          Admin Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-600">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter phone number (e.g., 09111213..)"
              value={phone}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <p className="text-xs text-gray-500 mt-1">Enter 10-digit phone number without symbols</p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <PasswordInput
              //id="password"
              value={password}
              onChange={handlePasswordChange}
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
      </div>
    </div>
  );
}