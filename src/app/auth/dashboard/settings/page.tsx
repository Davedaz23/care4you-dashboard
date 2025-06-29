'use client';

import { useState, useEffect } from 'react';
import { Settings, User, Lock, Bell, Shield, Mail, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { changePassword } from '@/config/auth'; // Import the function
import { useAdminAuth } from '@/context/authContext';


const SettingsPage = () => {
  const { user } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: true,
    twoFactorAuth: false,
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Simulate fetching user data
    setFormData({
      name: 'Admin User',
      email: 'admin@care4you.com',
      phone: user?.phone ?? '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      notifications: true,
      twoFactorAuth: false,
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

   const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordFormValid()) {
      toast.error('Please fill all fields correctly');
      return;
    }

    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      await changePassword(
        user.uid,
        formData.currentPassword,
        formData.newPassword
      );

      toast.success('Password changed successfully!');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    }
  };


  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return '';
    if (password.length < 6) return 'Weak';
    if (password.length < 10) return 'Medium';
    return 'Strong';
  };

  const validatePassword = (password: string) => {
  const minLength = 8;
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasNumber && hasSpecialChar,
    messages: [
      password.length >= minLength ? '' : `At least ${minLength} characters`,
      hasNumber ? '' : 'At least one number',
      hasSpecialChar ? '' : 'At least one special character',
    ].filter(msg => msg !== '')
  };
};

// Update your password strength indicator:
{formData.newPassword && (
  <div className="mt-1 text-xs text-gray-500">
    Password strength: <span className={`font-medium ${
      getPasswordStrength(formData.newPassword) === 'Weak' ? 'text-red-500' :
      getPasswordStrength(formData.newPassword) === 'Medium' ? 'text-yellow-500' :
      'text-green-500'
    }`}>
      {getPasswordStrength(formData.newPassword)}
    </span>
    {validatePassword(formData.newPassword).messages.length > 0 && (
      <ul className="mt-1 list-disc list-inside">
        {validatePassword(formData.newPassword).messages.map((msg, i) => (
          <li key={i} className="text-red-500">{msg}</li>
        ))}
      </ul>
    )}
  </div>
)}

  const isPasswordFormValid = () => {
    return (
      formData.currentPassword &&
      formData.newPassword &&
      formData.confirmPassword &&
      formData.newPassword === formData.confirmPassword &&
      formData.newPassword.length >= 6
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200">
            <nav className="space-y-1 p-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 w-full px-4 py-2 text-sm rounded-md ${activeTab === 'profile' ? 'bg-sky-100 text-sky-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <User size={16} />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 w-full px-4 py-2 text-sm rounded-md ${activeTab === 'security' ? 'bg-sky-100 text-sky-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Lock size={16} />
                Security
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-3 w-full px-4 py-2 text-sm rounded-md ${activeTab === 'notifications' ? 'bg-sky-100 text-sky-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Bell size={16} />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`flex items-center gap-3 w-full px-4 py-2 text-sm rounded-md ${activeTab === 'privacy' ? 'bg-sky-100 text-sky-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Shield size={16} />
                Privacy
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`flex items-center gap-3 w-full px-4 py-2 text-sm rounded-md ${activeTab === 'email' ? 'bg-sky-100 text-sky-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Mail size={16} />
                Email Settings
              </button>
            </nav>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'security' && (
            <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Security Settings</h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {formData.newPassword && (
                      <div className="mt-1 text-xs text-gray-500">
                        Password strength: <span className={`font-medium ${
                          getPasswordStrength(formData.newPassword) === 'Weak' ? 'text-red-500' :
                          getPasswordStrength(formData.newPassword) === 'Medium' ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                          {getPasswordStrength(formData.newPassword)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                      <p className="mt-1 text-xs text-red-500">Passwords don't match</p>
                    )}
                  </div>
                  
                  <div className="pt-2">
              <button
                type="submit"
                disabled={!isPasswordFormValid()}
                className={`px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
              !isPasswordFormValid() ? 'opacity-50 cursor-not-allowed' : ''
               }`}
                 >
            Update Password
              </button>
            </div>
          </form>
         </div>
            )}
            
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifications"
                      name="notifications"
                      checked={formData.notifications}
                      onChange={handleChange}
                      className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
                      Enable Email Notifications
                    </label>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                    >
                      Save Preferences
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'privacy' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Privacy Settings</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="twoFactorAuth"
                      name="twoFactorAuth"
                      checked={formData.twoFactorAuth}
                      onChange={handleChange}
                      className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                    />
                    <label htmlFor="twoFactorAuth" className="ml-2 block text-sm text-gray-700">
                      Enable Two-Factor Authentication
                    </label>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                    >
                      Update Privacy Settings
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'email' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Email Settings</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Frequency
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="daily"
                          name="emailFrequency"
                          value="daily"
                          className="h-4 w-4 text-sky-600 focus:ring-sky-500"
                        />
                        <label htmlFor="daily" className="ml-2 block text-sm text-gray-700">
                          Daily Digest
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="weekly"
                          name="emailFrequency"
                          value="weekly"
                          className="h-4 w-4 text-sky-600 focus:ring-sky-500"
                        />
                        <label htmlFor="weekly" className="ml-2 block text-sm text-gray-700">
                          Weekly Summary
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="important"
                          name="emailFrequency"
                          value="important"
                          className="h-4 w-4 text-sky-600 focus:ring-sky-500"
                        />
                        <label htmlFor="important" className="ml-2 block text-sm text-gray-700">
                          Important Notifications Only
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                    >
                      Update Email Settings
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;