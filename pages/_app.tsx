import { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import nProgress from 'nprogress';
import 'nprogress/nprogress.css';
import ThemeProvider from 'src/theme/ThemeProvider';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from 'src/createEmotionCache';
import { appWithTranslation } from 'next-i18next';
import { SidebarProvider } from 'src/contexts/SidebarContext';
import { Provider as ReduxProvider } from 'react-redux';
import { store, persistor } from 'src/store';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import useScrollTop from 'src/hooks/useScrollTop';
import { SnackbarProvider } from 'notistack';
import '../styles/globals.css';
import { SnackbarUtilsConfigurator } from '@/content/snackbar';
import { PersistGate } from 'redux-persist/integration/react';
import SnackbarCloseButton from '@/content/snackbarclosebtn';
import AuthProvider from '@/components/AuthProvider';
import { AxiosInterceptor } from '@/components/AxiosInterceptor';
import SharedLayout from '@/layouts';
import { ConsentFormProvider } from '@/contexts/ConsentFormContext';
import { CurrentPatientProvider } from '@/contexts/CurrentPatientContext';
import PracticeChangeRefresher from './_PracticeChangeRefresher';
import ConsentFormCountLoader from '@/components/ConsentForms/components/ConsentFormCountLoader';
import SessionTokenRefresher from '@/components/SessionTokenRefresher';
import AppShellSkeleton from '@/components/AppShellSkeleton';
const clientSideEmotionCache = createEmotionCache();

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
  Component: NextPageWithLayout;
}

function MyApp(props: MyAppProps) {

  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const router = useRouter();

  useScrollTop();

  Router.events.on('routeChangeStart', nProgress.start);
  Router.events.on('routeChangeError', nProgress.done);
  Router.events.on('routeChangeComplete', nProgress.done);

  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.error = () => {};
    console.debug = () => {};
  }

  const authPages = [
    '/auth/signup',
    '/auth/signin',
    '/auth/forgotpassword',
    '/auth/mobile',
    '/'
  ];
  const isAuthPage = authPages.includes(router.pathname);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Patient Portal - DataQHealth</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link
          rel="icon"
          href="/statics/summitMyHealthLogo.png"
          type="image/png"
        />
      </Head>
      <ReduxProvider store={store}>
        {isAuthPage ? (
          // Auth pages: no PersistGate, minimal providers
          <ThemeProvider>
            <CssBaseline />
            <Component {...pageProps} />
          </ThemeProvider>
        ) : (
          // Main app: full provider tree, wrapped in PersistGate
          <PersistGate
            // While the session is restored, show the portal frame with the empty
            // dashboard's skeletons rather than a blank page. PersistGate renders this
            // outside the providers below, so it gets its own theme.
            loading={
              <ThemeProvider>
                <CssBaseline />
                <AppShellSkeleton />
              </ThemeProvider>
            }
            // The store's single persistor (src/store) — this used to call persistStore(store) on
            // every render, so each re-render restarted the gate (blank screen) and it wasn't
            // the persistor logout purges.
            persistor={persistor}
          >
            <SidebarProvider>
              <ThemeProvider>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  {/* <AuthProvider> */}
                  <AxiosInterceptor>
                    <SnackbarProvider
                      maxSnack={6}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right'
                      }}
                      action={(key) => <SnackbarCloseButton key={key} />}
                    >
                      <SnackbarUtilsConfigurator />
                      <CssBaseline />
                      {/* <CustomScript /> */}
                      <ConsentFormProvider>
                        <CurrentPatientProvider>
                          <SessionTokenRefresher />
                          <ConsentFormCountLoader />
                          <PracticeChangeRefresher />
                          <SharedLayout>
                            <Component {...pageProps} />
                          </SharedLayout>
                        </CurrentPatientProvider>
                      </ConsentFormProvider>
                    </SnackbarProvider>
                  </AxiosInterceptor>
                  {/* </AuthProvider> */}
                </LocalizationProvider>
              </ThemeProvider>
            </SidebarProvider>
          </PersistGate>
        )}
      </ReduxProvider>
    </CacheProvider>
  );
}

export default appWithTranslation(MyApp);
