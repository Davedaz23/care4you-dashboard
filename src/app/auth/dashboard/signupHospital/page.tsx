'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { createAdminUser, addHospital } from "../../../../config/auth";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg rounded-xl overflow-hidden border-0">
        <div className="bg-blue-600 p-6">
          <h2 className="text-2xl font-bold text-center text-white">
            Hospital Registration
          </h2>
          <p className="text-center text-blue-100 mt-1">
            Create your hospital administrator account
          </p>
        </div>
        
        <CardContent className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Hospital Name *</label>
              <Input
                type="text"
                name="hospitalName"
                placeholder="Enter hospital name"
                value={formData.hospitalName}
                onChange={handleChange}
                required
                className="focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Hospital Address</label>
              <Input
                type="text"
                name="address"
                placeholder="Enter hospital address"
                value={formData.address}
                onChange={handleChange}
                className="focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Admin Phone Number *</label>
              <Input
                type="text"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                required
                className="focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Hospital Description</label>
              <textarea
                name="description"
                placeholder="Brief description of your hospital"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Password *</label>
                <Input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Register Hospital'}
            </Button>
          </form>
        </CardContent>
        
        <div className="bg-gray-50 px-6 py-4 border-t">
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Login here
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}