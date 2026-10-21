import { ReactNode } from 'react';
import Image from 'next/image';
import {
  Box,
  Container,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';

/**
 * The sign-in page frame (emergency banner, hero image, logo card), matching
 * pages/auth/signin so the one-time-code screens feel like part of the same page.
 */
const AuthShell = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box
        sx={{
          bgcolor: '#ff9800',
          color: '#000000',
          py: 1,
          px: 2,
          textAlign: 'center',
          fontSize: '0.9rem',
          fontWeight: 'bold'
        }}
      >
        This portal is not for emergencies. If you need urgent medical
        attention, call 911 or go to the closest emergency facility.
      </Box>

      <Box sx={{ flex: 1, display: 'flex', bgcolor: 'white' }}>
        <Box
          sx={{
            flex: 2,
            position: 'relative',
            display: isMobile ? 'none' : 'block',
            overflow: 'hidden'
          }}
        >
          <Image
            src="/img/login-page-bg.jpg"
            alt="Healthcare professionals"
            fill
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              borderBottomRightRadius: '150px'
            }}
          />
          <Box sx={{ position: 'absolute', top: 40, left: 40, zIndex: 2 }}>
            <Image
              src="/img/dataq-logo.png"
              alt="DataQ HEALTH"
              width={150}
              height={60}
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              bottom: 40,
              left: 230,
              zIndex: 2,
              opacity: 0.9
            }}
          >
            <Typography
              variant="h1"
              fontSize={{ xs: '2.5rem', md: '3.0rem' }}
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              Connecting
            </Typography>
            <Typography
              variant="h1"
              fontSize={{ xs: '2.5rem', md: '2.6rem' }}
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              You to Better Health
            </Typography>
          </Box>
        </Box>

        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <Container
            maxWidth="xs"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <Box
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                width: '100%',
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isMobile ? 'center' : 'left',
                  gap: 1,
                  mb: 4
                }}
              >
                <Image
                  src="/statics/Logo_PP.svg"
                  alt="Logo"
                  width={160}
                  height={160}
                  style={{ width: '100%', maxWidth: 220, height: 'auto' }}
                />
              </Box>

              {children}

              <Typography
                variant="subtitle2"
                component="p"
                sx={{ fontWeight: 'bold', mt: 6, textAlign: 'center' }}
              >
                © {new Date().getFullYear()} DataQ Health. All rights reserved.
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthShell;
