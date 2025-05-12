// "use client";

// import { useState } from 'react';
// import { useAdminAuth } from '@/context/authContext';
// import { useRouter } from 'next/navigation';

// export default function LoginPage() {
//   const [phone, setPhone] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const { login } = useAdminAuth();
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await login(phone, password);
//       router.push('/dashboard');
//     } catch (err: any) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
//         <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
//         {error && <p className="text-red-600 mb-2">{error}</p>}
//         <input
//           type="text"
//           placeholder="Phone number"
//           value={phone}
//           onChange={(e) => setPhone(e.target.value)}
//           className="w-full mb-3 p-2 border rounded"
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full mb-3 p-2 border rounded"
//           required
//         />
//         <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded">
//           Login
//         </button>
//       </form>
//     </div>
//   );
// }
