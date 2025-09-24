'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { createAdminUser, registerHospital } from "../../../../config/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../config/firebaseConfig";

interface HospitalData {
  id: string;
  name: string;
  photoBase64?: string;
  address: string;
  description?: string;
}

export default function HospitalSignUpPage() {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
    hospitalName: "",
    address: "",
    location: "",
    description: "",
    services: ["General Services"],
    email: "",
    website: "",
    hours: "24/7",
    image: null as File | null,
    bankAccountId: "",
    appointmentFee: "" // Added appointment fee field
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registeredHospital, setRegisteredHospital] = useState<HospitalData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServicesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const services = e.target.value.split(',').map(s => s.trim());
    setFormData(prev => ({ ...prev, services }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Basic validation
      if (!file.type.match('image.*')) {
        setError("Please select an image file (JPEG, PNG, GIF)");
        return;
      }
      
      if (file.size > 500 * 1024) { // 500KB limit for Base64
        setError("Image size should be less than 500KB");
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      setError("");
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { phone, password, confirmPassword, hospitalName, address, location, 
            description, services, email, website, hours, image, bankAccountId, appointmentFee } = formData;

    if (!phone || !password || !hospitalName || !address || !bankAccountId || !appointmentFee) {
      setError("Required fields: phone number, password, hospital name, address, bank account ID, and appointment fee");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate appointment fee is a positive number
    const fee = parseFloat(appointmentFee);
    if (isNaN(fee) || fee < 0) {
      setError("Appointment fee must be a valid positive number");
      setLoading(false);
      return;
    }

    try {
      let imageBase64: string | null = null;
      
      if (image) {
        try {
          imageBase64 = await convertImageToBase64(image);
          console.log("Image converted to Base64");
        } catch (convertError) {
          console.error("Image conversion failed:", convertError);
          setError("Image processing failed. Continuing without image...");
        }
      }

      // Register hospital with bank account ID and appointment fee
      const { userId, hospitalId } = await registerHospital(
        phone,
        password,
        hospitalName,
        address,
        location || address,
        description,
        imageBase64 ? [imageBase64] : [],
        services.join(', '),
        email,
        website,
        hours,
        bankAccountId,
        fee // Pass appointment fee
      );
      
      // Store in localStorage
      localStorage.setItem("adminUser", JSON.stringify({ 
        phone, 
        role: "hospital", 
        userId,
        hospitalId,
        hospitalName 
      }));
      router.push("/auth/dashboard/hospitals");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred during registration. Please try again.");
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl shadow-lg rounded-xl overflow-hidden border-0">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Hospital Image Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Hospital Image</label>
                  <div className="flex items-center justify-center gap-4">
                    <div 
                      onClick={triggerFileInput}
                      className="w-24 h-24 rounded-md bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                    >
                      {previewImage ? (
                        <Image
                          src={previewImage}
                          alt="Hospital preview"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs text-center">Click to upload</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <Button
                        type="button"
                        variant="default"
                        onClick={triggerFileInput}
                        className="w-full"
                      >
                        Choose Image
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">Max 500KB (JPEG, PNG)</p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Hospital Name *</label>
                  <Input
                    type="text"
                    name="hospitalName"
                    placeholder="Enter hospital name"
                    value={formData.hospitalName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Address *</label>
                  <Input
                    type="text"
                    name="address"
                    placeholder="Enter hospital address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Location (for map)</label>
                  <Input
                    type="text"
                    name="location"
                    placeholder="Enter location details for maps"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Operating Hours</label>
                  <Input
                    type="text"
                    name="hours"
                    placeholder="e.g. 24/7 or 8:00 AM - 10:00 PM"
                    value={formData.hours}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Services (comma separated)</label>
                  <Input
                    type="text"
                    name="services"
                    placeholder="e.g. Emergency, Pediatrics, Surgery"
                    value={formData.services.join(', ')}
                    onChange={handleServicesChange}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter hospital email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <Input
                    type="url"
                    name="website"
                    placeholder="Enter hospital website"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Bank Account ID *</label>
                  <Input
                    type="text"
                    name="bankAccountId"
                    placeholder="Enter bank account ID"
                    value={formData.bankAccountId}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Appointment Fee *</label>
                  <Input
                    type="number"
                    name="appointmentFee"
                    placeholder="Enter appointment fee"
                    value={formData.appointmentFee}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Admin Phone Number *</label>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Password *</label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
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
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Hospital Description</label>
              <textarea
                name="description"
                placeholder="Brief description of your hospital"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
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
      </Card>
    </div>
  );
}