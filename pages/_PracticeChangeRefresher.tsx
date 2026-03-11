// PracticeChangeRefresher.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const PracticeChangeRefresher = () => {
  const router = useRouter();

  useEffect(() => {
    const handlePracticeChanged = () => {
      debugger;
      // Hard reload – guaranteed
      window.location.reload();
      // If you want a softer reload, try:
      // router.replace(router.asPath);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('practiceChanged', handlePracticeChanged);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('practiceChanged', handlePracticeChanged);
      }
    };
  }, [router]);

  return null;
};

export default PracticeChangeRefresher;