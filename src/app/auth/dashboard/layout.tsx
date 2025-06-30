'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link, { LinkProps } from 'next/link';
import { useAdminAuth } from '@/context/authContext';
import {
  Home,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  UserPlus
} from 'lucide-react';
import Image from 'next/image';

interface SidebarLinkProps extends LinkProps<string> {
  icon: React.ReactNode;
  label: string;
  white?: boolean;
}

const SidebarLink = ({ href, icon, label, white = false, ...props }: SidebarLinkProps) => {
  return (
    <Link
      href={href}
      {...props}
      className={`flex items-center gap-3 ${
        white ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-sky-100'
      } px-4 py-2 rounded-md transition-all duration-200`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  const { user, loading } = useAdminAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-sky-600 font-semibold">Loading...</span>
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <html lang="en">
      <body className="bg-sky-50 font-sans">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar - Mobile Toggle */}
          <div
  className={`fixed z-40 md:relative top-0 left-0 h-full bg-[#00b4d8] w-64 shadow-lg border-r border-gray-200 p-6 flex flex-col justify-between transform ${
    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
  } md:translate-x-0 transition-transform duration-300 ease-in-out`}
>
  <div>
    <div className="flex justify-between items-center mb-10 md:hidden">
      <h2 className="text-xl font-bold text-white">🏥 Care4You</h2>
      <button onClick={() => setSidebarOpen(false)}>
        <X size={24} className="text-white" />
      </button>
    </div>
    <h2 className="hidden md:block text-2xl font-bold text-white mb-10">🏥 Care4You</h2>
    <nav className="space-y-2">
      <SidebarLink href="/dashboard" icon={<Home size={20} />} label="Dashboard" white />
      <SidebarLink href="/auth/dashboard/Users" icon={<Users size={20} />} label="User List" white />
      <SidebarLink href="/auth/dashboard/appointments" icon={<Calendar size={20} />} label="Appointments" white />
      <SidebarLink href="/auth/dashboard/patients" icon={<Users size={20} />} label="Patients" white />
      <SidebarLink href="/auth/dashsboard/hospitals" icon={<Users size={20} />} label="Hospitals" white />
      <SidebarLink href="/auth/dashboard/reports" icon={<FileText size={20} />} label="Reports" white />
      <SidebarLink href="/auth/dashboard/settings" icon={<Settings size={20} />} label="Settings" white />
    </nav>
  </div>

  <div>
    <button
      className="flex items-center gap-2 text-red-100 hover:text-red-200 font-medium"
      onClick={() => {
        localStorage.removeItem('adminUser');
        router.push('/');
      }}
    >
      <LogOut size={18} />
      Logout
    </button>
  </div>
</div>


        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Navbar */}
          <header className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm flex items-center justify-between md:px-6">
            <div className="flex items-center gap-4">
              <button
                className="md:hidden text-sky-600"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                Welcome, {user?.name || 'Admin'}
              </h1>
            </div>
            {user?.phone && (
              <span className="text-sm text-gray-500">
                {user.phone}
              </span>
            )}
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
          
          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 p-4 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center gap-2">
            <span>© 2025 Hospital Management System</span>
            <div className="space-x-3">
              {/* Optional links can be added here */}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default RootLayout;
