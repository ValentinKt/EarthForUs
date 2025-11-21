import * as React from 'react';
import Button from '../../../shared/ui/Button';
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../../shared/utils/logger';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const log = logger.withContext('ProfilePage');

  if (!user) {
    return (
      <div className="content-wrapper">
        <div className="ui-card text-center">
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-300">You need to be signed in to view your profile.</p>
          <div className="mt-4">
            <Button variant="primary" onClick={() => navigate('/login')}>Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-6">My Profile</h1>
        <div className="ui-card">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-600 text-white flex items-center justify-center text-xl font-semibold">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user.firstName} {user.lastName}</p>
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => { log.info('profile_edit'); navigate('/settings'); }}>Edit Account</Button>
            <Button variant="earth" onClick={() => { log.info('profile_logout'); logout(); navigate('/'); }}>Log Out</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
