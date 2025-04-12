'use client'; // Add this directive at the top

import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/authContext';
import Link from 'next/link';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAdminAuth(); // Access the authentication state
  const router = useRouter();

  // If the user is still being loaded (e.g., checking localStorage), show a loading state.
  if (loading) {
    return <p>Loading...</p>;
  }

  // If the user is not logged in, redirect them to the login page
  if (!user) {
    router.push('/login');
    return null; // Render nothing while redirecting
  }

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-64 bg-gray-800 text-white p-6">
            <h2 className="text-2xl font-bold mb-8">Hospital Dashboard</h2>
            <nav>
              <ul>
                <li>
                  <Link href="/dashboard" className="block py-2 px-4 hover:bg-gray-700 rounded">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/auth/dashboard/Users" className="block py-2 px-4 hover:bg-gray-700 rounded">
                    User List
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/appointments" className="block py-2 px-4 hover:bg-gray-700 rounded">
                    Appointments
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/patients" className="block py-2 px-4 hover:bg-gray-700 rounded">
                    Patients
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/reports" className="block py-2 px-4 hover:bg-gray-700 rounded">
                    Reports
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/settings" className="block py-2 px-4 hover:bg-gray-700 rounded">
                    Settings
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Navbar */}
            <div className="bg-white shadow-md px-4 py-2 flex justify-between items-center">
              <h1 className="text-3xl font-bold">Welcome to Hospital Dashboard</h1>
              <div>
                <button className="bg-red-500 text-white py-2 px-4 rounded">Logout</button>
              </div>
            </div>

            {/* Page Content */}
            <div className="mt-8 flex-1">
              {children} {/* This is where the page content will be rendered */}
            </div>

            {/* Footer */}
            <div className="w-full bg-gray-800 text-white p-4">
              <div className="flex justify-between">
                <p>© 2025 Hospital Management System</p>
                <div>
                  <Link href="/privacy" className="hover:underline">Privacy Policy</Link> |{' '}
                  <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
