import React, { useEffect, useMemo, useState } from 'react';
import TextField from '../../../shared/components/TextField';
import Button from '../../../shared/ui/Button';
import { useAuth } from '../../auth/context/AuthContext';
import { useToast } from '../../../shared/components/Toast';
import { api } from '../../../shared/utils/api';
import { logger } from '../../../shared/utils/logger';

const SettingsPage: React.FC = () => {
  const { user, login } = useAuth();
  const toast = useToast();
  const log = logger.withContext('SettingsPage');

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({});

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
  }, [user?.firstName, user?.lastName]);

  const profileDirty = useMemo(() => {
    return (user?.firstName ?? '') !== firstName || (user?.lastName ?? '') !== lastName;
  }, [user?.firstName, user?.lastName, firstName, lastName]);

  const validateProfile = () => {
    const next: { firstName?: string; lastName?: string } = {};
    const f = firstName.trim();
    const l = lastName.trim();
    if (!f) next.firstName = 'First name is required';
    else if (f.length > 100) next.firstName = 'First name is too long';
    if (!l) next.lastName = 'Last name is required';
    else if (l.length > 100) next.lastName = 'Last name is too long';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const saveProfile = async () => {
    if (!user) return;
    if (!validateProfile()) return;
    try {
      setSavingProfile(true);
      log.info('save_profile');
      const res = await api.put<{ user: { id: number; email: string; first_name: string; last_name: string } }>(`/api/users/${user.id}`, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      const updated = res.user;
      login({ id: updated.id, email: updated.email, firstName: updated.first_name, lastName: updated.last_name });
      toast.success('Profile updated');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const validatePassword = () => {
    setPasswordError(undefined);
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return false;
    }
    return true;
  };

  const savePassword = async () => {
    if (!user) return;
    if (!currentPassword) { setPasswordError('Current password is required'); return; }
    if (!validatePassword()) return;
    try {
      setSavingPassword(true);
      log.info('save_password');
      await api.put(`/api/users/${user.id}/password`, {
        oldPassword: currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="content-wrapper">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Account Settings</h1>
          <p className="text-gray-600">You need to be signed in to edit your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Account Settings</h1>

        {/* Profile card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Profile</h2>
              <p className="text-sm text-gray-600">Update your name and view email</p>
            </div>
            {profileDirty ? (
              <span className="inline-flex items-center rounded-full bg-teal-100 text-teal-800 px-3 py-1 text-xs font-medium">Unsaved changes</span>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField name="firstName" label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required error={errors.firstName} autoComplete="given-name" />
            <TextField name="lastName" label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required error={errors.lastName} autoComplete="family-name" />
            <TextField name="email" label="Email" value={user.email} onChange={() => {}} disabled description="Email is managed through authentication" autoComplete="email" />
          </div>

          <div className="mt-4 flex gap-3">
            <Button variant="primary" onClick={saveProfile} loading={savingProfile}>Save Changes</Button>
            <Button variant="outline" onClick={() => { setFirstName(user.firstName); setLastName(user.lastName); setErrors({}); }}>Reset</Button>
          </div>
        </div>

        {/* Password card */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Security</h2>
          <p className="text-sm text-gray-600">Change your password</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField name="currentPassword" label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            <TextField name="newPassword" label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required description="Minimum 8 characters" />
            <TextField name="confirmPassword" label="Confirm new password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required error={passwordError} />
          </div>
          <div className="mt-4 flex gap-3">
            <Button variant="earth" onClick={savePassword} loading={savingPassword}>Update Password</Button>
            <Button variant="outline" onClick={() => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordError(undefined); }}>Clear</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;