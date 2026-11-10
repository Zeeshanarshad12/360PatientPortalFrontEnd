import { useEffect, useState } from 'react';
import { hasPendingPostLoginRedirect } from '@/utils/postLoginRedirect';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Link,
  Divider
} from '@mui/material';
import Image from 'next/image';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useDispatch, useSelector } from '@/store/index';
import { GetToken } from '@/slices/patientprofileslice';
import { useRouter } from 'next/router';

const Login = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const { GetTokenData } = useSelector((state) => state.patientprofileslice);
  const [loading, setLoading] = useState(false);
  // The one-time-code option only appears when a portal link (e.g. an intake link) sent the patient here.
  const [cameFromLink, setCameFromLink] = useState(false);
  useEffect(() => {
    setCameFromLink(hasPendingPostLoginRedirect());
  }, []);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    // Check if both fields are filled
    if (!trimmedEmail || !password) {
      setError('Both fields are required!');
      return;
    }
    if (/\s/.test(trimmedEmail)) {
      setError('Email address cannot contain spaces');
      return;
    }
    setLoading(true);
    // Clear error message and perform login logic
    setError('');
    const loginobj = {
      username: trimmedEmail,
      password: password
    };

    let response: any;
    try {
      response = await dispatch(GetToken(loginobj)).unwrap();
    } catch (err) {
      // Request failed (network / server error). Auth pages have no snackbar, so show it inline.
      console.error('Sign-in request failed', err);
      setError(
        err?.data?.message ||
          `Unable to sign in right now. Please try again later.${
            err?.status ? ` (HTTP ${err.status})` : ' (no response from server)'
          }`
      );
      setLoading(false);
      return;
    }
    if (!response || !response.access_token || response.error_description) {
      // setError('Invalid Credentials');
      if (!response) {
        // The token call succeeded but returned no usable result.
        setError(
          'Unable to sign in right now. Please try again later. (empty sign-in response)'
        );
      } else if (response.error_description === 'user is blocked') {
        setError('Your account has been blocked.');
      } else if (
        response.error_description?.includes(
          'Please change your password for user'
        )
      ) {
        router.push(
          `/auth/forgotpassword?forceChange=true&email=${encodeURIComponent(
            trimmedEmail
          )}`
        );
        setLoading(false);
      } else {
        setError(response.error_description);
      }
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Clear the error when the user starts typing in the email field
    if (error) setError('');
  };

  const handleEmailBlur = () => {
    setEmail((prev) => prev.trim());
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    // Clear the error when the user starts typing in the password field
    if (error) setError('');
  };

  const handleForgotPassword = () => {
    // Navigate to the forgot password page
    router.push('/auth/forgotpassword');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', bgcolor: 'white' }}>
        {/* Left Section - Background Image Original Size */}
        <Box
          sx={{
            flex: 2,
            position: 'relative',
            display: isMobile ? 'none' : 'block',
            overflow: 'hidden'
          }}
        >
          {/* Background Image */}
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

          {/* Logo Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 40,
              left: 40,
              zIndex: 2
            }}
          >
            <Image
              src="/img/dataq-logo.png"
              alt="DataQ HEALTH"
              width={150}
              height={60}
              style={{ filter: 'brightness(0) invert(1)' }} // Make logo white
            />
          </Box>

          {/* Slogan Overlay */}
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

        {/* Right Section - Sign In Form Original Size */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          {/* Sign In Container - Keep existing structure */}
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

              <Typography
                variant="h3"
                component="h3"
                sx={{ fontWeight: 'bold', mt: 2, textAlign: 'left' }}
              >
                Sign In
              </Typography>
              <Typography
                variant="subtitle1"
                component="h6"
                sx={{ mt: 1, textAlign: 'left', mb: 2, fontWeight: 'bold' }}
              >
                Enter your Summit EHR patient portal credentials. 
              </Typography>

              {/* Error message */}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                id="email"
                fullWidth
                variant="outlined"
                margin="normal"
                label="Email"
                autoComplete="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                error={!!error} // Show error if email or password is empty
              />

              <TextField
                id="password"
                fullWidth
                variant="outlined"
                margin="normal"
                autoComplete="current-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                InputProps={{
                  endAdornment: (
                    <>
                      <IconButton
                        onClick={togglePasswordVisibility}
                        id="LoginEyeIcon"
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                        title={showPassword ? 'Hide password' : 'Show password'}
                        sx={{
                          '&:focus': {
                            outline: '2px solid #1976d2',
                            outlineOffset: '2px'
                          },
                          '&:focus-visible': {
                            outline: '2px solid #1976d2',
                            outlineOffset: '2px'
                          }
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                        <span
                          style={{
                            position: 'absolute',
                            width: 1,
                            height: 1,
                            overflow: 'hidden',
                            clip: 'rect(0 0 0 0)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </span>
                      </IconButton>
                    </>
                  )
                }}
                error={!!error} // Show error if email or password is empty
              />

              {/* Forgot Password Link */}
              <Box sx={{ textAlign: 'right', mt: 1, mb: 1 }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={handleForgotPassword}
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    '&:hover': {
                      textDecoration: 'underline'
                    },
                    '&:focus': {
                      outline: '2px solid #1976d2',
                      outlineOffset: '2px',
                      borderRadius: '2px'
                    }
                  }}
                >
                  {'Forgot Password ?'}
                </Link>
              </Box>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                sx={{
                  mt: 2,
                  borderRadius: '5px',
                  '&:focus': {
                    outline: '2px solid #1976d2',
                    outlineOffset: '2px'
                  },
                  '&:focus-visible': {
                    outline: '2px solid #1976d2',
                    outlineOffset: '2px'
                  }
                }}
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Login'
                )}
              </Button>

              {cameFromLink && (
                <>
                {/* Passwordless alternative — additive; the password flow above is unchanged. */}
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" component="span">
                  or
                </Typography>
              </Divider>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                sx={{
                  borderRadius: '5px',
                  '&:focus': {
                    outline: '2px solid #1976d2',
                    outlineOffset: '2px'
                  },
                  '&:focus-visible': {
                    outline: '2px solid #1976d2',
                    outlineOffset: '2px'
                  }
                }}
                onClick={() => router.push('/auth/otp')}
                disabled={loading}
              >
                Sign in with a one-time code
              </Button>
              </>
              )}

              <Typography
                variant="subtitle2"
                component="p"
                sx={{ mt: 3, textAlign: 'justify', mb: 2 }}
              >
                Ready to use Summit Now? If you have not received an invitation from your doctor's office, please contact them for an invitation.
              </Typography>
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

      {/* Emergency Notice */}
      <Box
        sx={{
          bgcolor: 'white',
          color: '#000000',
          py: 1,
          px: 2,
          textAlign: 'center',
          fontSize: '0.9rem',
          fontWeight: 'bold'
        }}
      >
        This portal is not intended for emergencies. If you are experiencing a
        medical emergency, please call 911 or visit the closest emergency room.
      </Box>
    </Box>
  );
};

export default Login;
