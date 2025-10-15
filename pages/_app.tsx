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
import { store } from 'src/store';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import useScrollTop from 'src/hooks/useScrollTop';
import { SnackbarProvider } from 'notistack';
import '../styles/globals.css';
import { SnackbarUtilsConfigurator } from '@/content/snackbar';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import SnackbarCloseButton from '@/content/snackbarclosebtn';
import AuthProvider from '@/components/AuthProvider';
import { AxiosInterceptor } from '@/components/AxiosInterceptor';
import SharedLayout from '@/layouts';
import { ConsentFormProvider } from '@/contexts/ConsentFormContext';

const clientSideEmotionCache = createEmotionCache();

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
  Component: NextPageWithLayout;
}

function MyApp(props: MyAppProps) {
  let persistor = persistStore(store);

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

  const authPages = ['/auth/signup', '/auth/signin', '/auth/forgotpassword', '/'];
  const isAuthPage = authPages.includes(router.pathname);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Patient Portal - DataQHealth</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link rel="icon" href="/statics/Logo.svg" type="image/svg+xml" />
      </Head>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {isAuthPage ? (
            <ThemeProvider>
              <CssBaseline />
              <Component {...pageProps} />
            </ThemeProvider>
          ) : (
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
                        <SharedLayout>
                          
                          <Component {...pageProps} />
                          
                        </SharedLayout>
                        </ConsentFormProvider>
                      </SnackbarProvider>
                    </AxiosInterceptor>
                  {/* </AuthProvider> */}
                </LocalizationProvider>
              </ThemeProvider>
            </SidebarProvider>
          )}
        </PersistGate>
      </ReduxProvider>
    </CacheProvider>
  );
}

export default appWithTranslation(MyApp);