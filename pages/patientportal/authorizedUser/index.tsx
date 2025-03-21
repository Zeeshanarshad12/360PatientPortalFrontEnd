import React from 'react';
import AuthorizedUserData from '@/components/AuthorizedUsers/index';
import { ProtectedRoute } from '@/contexts/protectedRoute';

const AuthorizedUsers = () => {
  return (
    <>
    <ProtectedRoute>
     <AuthorizedUserData /> {/* main page component */}
     </ProtectedRoute>
    </>
  );
};

export default AuthorizedUsers;