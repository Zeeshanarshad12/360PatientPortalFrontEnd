import Head from 'next/head';
import BaseLayout from 'src/layouts/BaseLayout';

import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';

function LoginCover() {
  const { loginWithRedirect } = useAuth0() as any;
  const { user, isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/patientportal/profile');
    } else {
      loginWithRedirect();
    }
  }, []);

  return (
    <>
      <Head>
        <title>Login - Cover</title>``
      </Head>
    </>
  );
}

LoginCover.getLayout = (page) => <BaseLayout>{page}</BaseLayout>;

export default LoginCover;
