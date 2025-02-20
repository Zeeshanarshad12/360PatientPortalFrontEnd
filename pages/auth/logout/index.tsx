import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';

const Logout = () => {
  const { logout } = useAuth0();
  logout({ returnTo: process.env.NEXT_PUBLIC_ORIGIN_URI });
  return null;
};
export default Logout;
