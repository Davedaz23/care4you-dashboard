'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { loginWithPhone } from "../../../config/auth";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // State for loading
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Start loading when form is submitted

    // Basic validation for phone number and password
    if (!phone || !password) {
      setError("Phone number and password are required.");
      setLoading(false);
      return;
    }

    try {
      const user = await loginWithPhone(phone, password);
      localStorage.setItem("adminUser", JSON.stringify(user)); // session alternative
      router.push("/auth/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false); // Stop loading after the request is finished
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm mx-auto mt-10">
      <h2 className="text-xl font-bold text-center">Admin Login</h2>
      
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
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <button 
        type="submit" 
        className={`bg-blue-500 text-white py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading} // Disable button during loading
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
      
      <div className="mt-4 text-center">
        <p className="text-sm">
          Don't have an account?{" "}
          <span
            onClick={() => router.push("/auth/signup")} // Use router.push for client-side navigation
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Create an account here
          </span>
        </p>
      </div>
    </form>
  );
}
