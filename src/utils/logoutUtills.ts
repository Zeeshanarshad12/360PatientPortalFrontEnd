import { store, persistor } from '@/store';
import Router from 'next/router';

/**
 * Comprehensive logout function
 * Clears Redux state, persisted storage, and localStorage
 */
export const handleLogout = async () => {
  try {
    //  Step 1: Dispatch RESET_ALL_STATE to clear Redux state
    store.dispatch({ type: 'RESET_ALL_STATE' });

    //  Step 2: Purge persisted storage (redux-persist)
    await persistor.purge();

    //  Step 3: Clear localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('Email');
    localStorage.removeItem('FirstName');
    localStorage.removeItem('LastName');
    localStorage.removeItem('UserAccessType');
    localStorage.removeItem('PracticeName');

    //  Step 4: Clear sessionStorage if needed
    sessionStorage.clear();

    //  Step 5: Redirect to login
    await Router.push('/login'); // or your login route

    console.log(' Logout successful: All data cleared');
  } catch (error) {
    console.error(' Error during logout:', error);
  }
};
