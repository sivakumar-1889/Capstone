import { LogOut } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { extractApiErrorMessage, userService } from '../services/api.ts';

interface ProfilePageProps {
  navigate: (to: string) => void;
}

export function ProfilePage({ navigate }: ProfilePageProps) {
  const { user, setUser, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    if (name.trim().length < 2) {
      setProfileMessage({ type: 'error', text: 'Name must be at least 2 characters.' });
      return;
    }
    if (!email.trim().includes('@')) {
      setProfileMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setProfileSaving(true);
    try {
      const res = await userService.updateProfile({
        name: name.trim(),
        email: email.trim(),
      });
      setUser(res.user);
      setProfileMessage({ type: 'success', text: res.message });
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text: extractApiErrorMessage(err, 'Could not update profile.'),
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Enter your current password.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({
        type: 'error',
        text: 'New password must be at least 8 characters long.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await userService.updateProfile({
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage({ type: 'success', text: res.message });
    } catch (err) {
      setPasswordMessage({
        type: 'error',
        text: extractApiErrorMessage(err, 'Could not update password.'),
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-[#171717]">
          Profile &amp; Settings
        </h2>
        <p className="mt-1 text-sm text-[#737373]">
          Manage your account details, password security, and active session.
        </p>
      </div>

      {/* Account Overview */}
      <section className="rounded-xl bg-white border border-[#E5E5E3] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-display text-base font-semibold text-[#171717]">{user?.name}</p>
            <p className="text-sm text-[#737373]">{user?.email}</p>
            {joinedDate && (
              <p className="mt-1 text-xs text-[#737373]">Member since {joinedDate}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#171717] bg-white border border-[#E5E5E3] hover:bg-[#F8F8F6] rounded-lg transition-colors self-start sm:self-auto cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </section>

      {/* Edit Profile Form */}
      <form
        onSubmit={handleProfileSave}
        className="rounded-xl bg-white border border-[#E5E5E3] p-6 space-y-5"
      >
        <div>
          <h3 className="font-display text-base font-semibold text-[#171717]">
            Personal Information
          </h3>
          <p className="mt-0.5 text-xs text-[#737373]">
            Update your display name and primary email address.
          </p>
        </div>

        {profileMessage && (
          <div
            role="status"
            className={`px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm ${
              profileMessage.type === 'success'
                ? 'border-[#16A34A]/30 bg-[#16A34A]/[0.05] text-[#15803D]'
                : 'border-[#DC2626]/30 bg-[#DC2626]/[0.05] text-[#B91C1C]'
            }`}
          >
            {profileMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="profile-name" className="block text-xs font-medium text-[#171717] mb-1.5">
              Full name
            </label>
            <input
              id="profile-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5E5E3] rounded-lg text-[#171717] focus:outline-none focus:border-[#5145CD] focus:ring-2 focus:ring-[#5145CD]/15"
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-xs font-medium text-[#171717] mb-1.5">
              Email address
            </label>
            <input
              id="profile-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5E5E3] rounded-lg text-[#171717] focus:outline-none focus:border-[#5145CD] focus:ring-2 focus:ring-[#5145CD]/15"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={profileSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-[#5145CD] hover:bg-[#4338CA] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
          >
            {profileSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Change Password Form */}
      <form
        onSubmit={handlePasswordChange}
        className="rounded-xl bg-white border border-[#E5E5E3] p-6 space-y-5"
      >
        <div>
          <h3 className="font-display text-base font-semibold text-[#171717]">Change Password</h3>
          <p className="mt-0.5 text-xs text-[#737373]">
            Use a strong password of at least 8 characters.
          </p>
        </div>

        {passwordMessage && (
          <div
            role="status"
            className={`px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm ${
              passwordMessage.type === 'success'
                ? 'border-[#16A34A]/30 bg-[#16A34A]/[0.05] text-[#15803D]'
                : 'border-[#DC2626]/30 bg-[#DC2626]/[0.05] text-[#B91C1C]'
            }`}
          >
            {passwordMessage.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="current-password"
              className="block text-xs font-medium text-[#171717] mb-1.5"
            >
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5E5E3] rounded-lg text-[#171717] focus:outline-none focus:border-[#5145CD] focus:ring-2 focus:ring-[#5145CD]/15"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-medium text-[#171717] mb-1.5"
              >
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5E5E3] rounded-lg text-[#171717] focus:outline-none focus:border-[#5145CD] focus:ring-2 focus:ring-[#5145CD]/15"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-medium text-[#171717] mb-1.5"
              >
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5E5E3] rounded-lg text-[#171717] focus:outline-none focus:border-[#5145CD] focus:ring-2 focus:ring-[#5145CD]/15"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={passwordSaving}
            className="px-4 py-2 text-sm font-medium text-[#171717] bg-white border border-[#E5E5E3] hover:bg-[#F8F8F6] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
          >
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
