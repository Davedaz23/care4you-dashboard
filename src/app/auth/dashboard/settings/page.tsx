'use client';

import { useState, useEffect } from 'react';
import { Settings, User, Lock, Bell, Shield, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SettingsPage = () => {
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

  useEffect(() => {
    // Simulate fetching user data
    setFormData({
      name: 'Admin User',
      email: 'admin@care4you.com',
      phone: '+1234567890',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your form submission logic here
    toast.success('Settings updated successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto">
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
                <form onSubmit={handleSubmit} className="space-y-4">
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
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
                <form onSubmit={handleSubmit} className="space-y-4">
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
                <form onSubmit={handleSubmit} className="space-y-4">
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
                <form onSubmit={handleSubmit} className="space-y-4">
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
