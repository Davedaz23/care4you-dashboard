'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { createAdminUser, addHospital } from "../../../config/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HospitalSignUpPage() {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
    hospitalName: "",
    address: "",
    description: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { phone, password, confirmPassword, hospitalName, address, description } = formData;

    if (!phone || !password || !hospitalName) {
      setError("Phone number, password, and hospital name are required.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Create admin user with hospital role
      const userId = await createAdminUser(phone, password, "hospital");
      
      // Add hospital to database with all details
      await addHospital({
        name: hospitalName,
        address,
        description,
        adminId: userId,
        createdAt: new Date(),
        status: "active"
      });
      
      // Store user data in localStorage
      localStorage.setItem("adminUser", JSON.stringify({ 
        phone, 
        role: "hospital", 
        userId,
        hospitalName 
      }));
      
      router.push("/auth/dashboard/hospitals");
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Hospital Registration
          </h2>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
              <Input
                type="text"
                name="hospitalName"
                placeholder="Enter hospital name"
                value={formData.hospitalName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Address</label>
              <Input
                type="text"
                name="address"
                placeholder="Enter hospital address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Admin Phone Number</label>
              <Input
                type="text"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Description</label>
              <textarea
                name="description"
                placeholder="Enter hospital description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <Input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Registering hospital...' : 'Register Hospital'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/auth/login"
                className="font-medium text-sky-600 hover:text-sky-500"
              >
                Login here
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}