import React, { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';

export const ProfileSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const hasPasswordChange = useMemo(() => newPassword.trim().length > 0, [newPassword]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user?._id) {
        throw new Error('User not found');
      }

      const payload: Record<string, string> = {
        fullName: fullName.trim(),
        whatsappNumber: whatsappNumber.trim(),
      };

      if (hasPasswordChange) {
        payload.currentPassword = currentPassword;
        payload.password = newPassword;
      }

      const response = await api.patch(`/users/${user._id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!whatsappNumber.trim()) {
      toast.error('WhatsApp number is required');
      return;
    }

    if (hasPasswordChange) {
      if (!currentPassword) {
        toast.error('Current password is required');
        return;
      }
      if (newPassword.length < 6) {
        toast.error('New password must be at least 6 characters');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('New password and confirm password do not match');
        return;
      }
    }

    updateProfileMutation.mutate();
  };

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Setting</h1>
          <p className="mt-1 text-sm text-gray-600">
            Update your name, WhatsApp number, and password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="whatsappNumber" className="mb-2 block text-sm font-medium text-gray-700">
              WhatsApp Number
            </label>
            <input
              id="whatsappNumber"
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
            <p className="mt-1 text-sm text-gray-600">
              Leave password fields empty if you do not want to change it.
            </p>
          </div>

          <div>
            <label htmlFor="currentPassword" className="mb-2 block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="mb-2 block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="inline-flex min-h-[44px] items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </MainLayout>
  );
};
