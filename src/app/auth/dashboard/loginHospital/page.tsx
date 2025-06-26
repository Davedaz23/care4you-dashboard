'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { loginHospitalAdmin } from "@/config/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import Link from "next/link";

export default function HospitalLoginPage() {
  const [formData, setFormData] = useState({
    phone: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { phone, password } = formData;

    if (!phone || !password) {
      setError("Phone number and password are required.");
      setLoading(false);
      return;
    }

    try {
      // Use the dedicated hospital admin login function
      const user = await loginHospitalAdmin(phone, password);
      
      // Store complete user and hospital data in localStorage
      localStorage.setItem("adminUser", JSON.stringify({
        uid: user.uid,
        phone: user.phone,
        role: user.role,
        hospitalId: user.hospitalId,
        hospitalName: user.hospitalName,
        // hospitalData: user.hospitalData
      }));
      
      // Redirect to hospital dashboard
      router.push("/auth/dashboard/hospitals");
    } catch (err: any) {
      // More specific error messages
      if (err.message.includes("Access restricted")) {
        setError("This login is for hospital administrators only");
      } else if (err.message.includes("Associated hospital")) {
        setError("Hospital account not properly configured");
      } else {
        setError(err.message || "Invalid phone number or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
      
          <h2 className="text-2xl font-bold text-gray-900">
            Hospital Admin Portal
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Sign in to manage your hospital appointments
          </p>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Phone Number
              </label>
              <Input
                type="tel"
                name="phone"
                placeholder="Enter registered phone number"
                value={formData.phone}
                onChange={handleChange}
                required
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              {/* <Link 
                href="/auth/forgot-password" 
                className="text-sm text-sky-600 hover:text-sky-500"
              >
                Forgot password?
              </Link> */}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700"
            >
              {loading ? 'Authenticating...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  New to the platform?
                </span>
              </div>
            </div>

            <div className="mt-4">
              {/* <Link
                href="/auth/register/hospital"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Register your hospital
              </Link> */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}