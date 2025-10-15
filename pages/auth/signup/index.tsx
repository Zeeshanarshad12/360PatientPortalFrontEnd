import { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  AlertColor,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Image from 'next/image';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import NorthEast from '@mui/icons-material/NorthEast';
import React, { useEffect } from 'react';
import {
  GetPatientUserRequestByCode,
  GenerateOtp,
  AddPatientUser
} from '@/slices/patientprofileslice';
import { useDispatch, useSelector } from '@/store/index';
import { useRouter } from 'next/router';

function SignUp() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [code, setCode] = useState(null);
  const { GetPatientUserRequestByCodeData, GenerateOtpData } = useSelector(
    (state) => state.patientprofileslice
  );
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [severity, setSeverity] = useState<AlertColor>('error');
  const [messageSnackbar, setMessageSnackbar] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const queryString = router.asPath.split('?')[1];
    if (queryString) {
      const urlParams = new URLSearchParams(queryString);
      const newCode = urlParams.get('code');

      // Only update if the new code is different from the current code
      if (newCode && (newCode !== code || code === null)) {
        setCode(newCode);
      }
    }
  }, []); // This will run when router.asPath changes

  useEffect(() => {
    if (code) {
      // Call the dispatch only when the code is updated
      dispatch(GetPatientUserRequestByCode(code));
    }
  }, [code, dispatch]); // This will only run when 'code' changes

  useEffect(() => {
    if (GetPatientUserRequestByCodeData) {
      setEmail(GetPatientUserRequestByCodeData?.result.emailAddress);
    }
  }, [GetPatientUserRequestByCodeData]); // This will run when the API response changes

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleOtpChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move cursor to next box if a digit is entered
      if (value && index < otp.length - 1) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }

      // Auto-trigger verify if all fields are filled
      if (newOtp.every((digit) => digit !== '')) {
        handleVerifyOtp();
      }
    }
  };

  // Handle OTP paste
  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData('Text').slice(0, 6);
    if (/^\d{6}$/.test(pasteData)) {
      setOtp(pasteData.split(''));
      handleVerifyOtp();
    }
  };

  // Handle Send Code (Step 1 → Step 2)
  const handleSendCode = async () => {
    setEmailError('');

    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setOtp(['', '', '', '', '', '']);
    setError(false);

    setLoading(true);

    const signUpOtpResponse = await dispatch(
      GenerateOtp(GetPatientUserRequestByCodeData?.result.code)
    ).unwrap();

    if (signUpOtpResponse?.result != null && signUpOtpResponse?.result !== '') {
      setLoading(false);
      setStep(2);
    }
    else{
      setLoading(false);
    }
  };

  // Handle OTP Verification (Step 2 → Step 3)
  const handleVerifyOtp = async () => {
    if (otp.some((digit) => digit === '')) {
      setError(true);
      return;
    }

    const patientUserResponse = await dispatch(
      GetPatientUserRequestByCode(code)
    ).unwrap();

    if (patientUserResponse.result != null) {
      const joinotp = otp.join('');
      if (joinotp == patientUserResponse.result.otp) {
      } else {
        setMessageSnackbar('Invalid OTP!');
        setSeverity('error');
        setOpenSnackbar(true);
        return;
      }
      setLoading(true); // Show loading indicator
      setTimeout(() => {
        setLoading(false);
        setStep(3);
      }, 1000); // delay before proceeding
    } else {
      setMessageSnackbar('User not Authenticated. Please retry!');
      setSeverity('error');
      setOpenSnackbar(true);
      return;
    }
  };

  // Regex to validate password
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^*])(?!.*(.)\1\1).{10,20}$/;
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Handle Sign Up (Final Step)
  const handleSignUp = async () => {
    // Clear any previous errors
    setPasswordError('');
    setConfirmPasswordError('');

    // Check if the password matches the regex
    if (!passwordRegex.test(password)) {
      setPasswordError(
        'Password must be between 10 to 20 characters, contain at least one lowercase letter, one uppercase letter, one digit, one special character, and no three consecutive identical characters.'
      );
      return;
    }

    // Check if the passwords match
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      return;
    }

    if (otp.some((digit) => digit === '')) {
      setError(true);
      return;
    }

    const joinotp = otp.join('');
    const signupobj = {
      Code: code,
      Otp: joinotp,
      Password: password.toString(),
      CreatedBy: 'System'
    };

    const signUpResponse = await dispatch(
      AddPatientUser(signupobj)
    ).unwrap();

    if (signUpResponse.result != null) {
      setMessageSnackbar('Sign Up process completed. Redirecting to Login!');
      setSeverity('success');
      setOpenSnackbar(true);

      setTimeout(() => {
        router.push('/auth/signin');
      }, 1000); // delay before proceeding
    } else {
      setMessageSnackbar('Error occurred during the Sign Up process. Try Again!');
      setSeverity('error');
      setOpenSnackbar(true);
      return;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Orange Emergency Banner */}
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

        {/* Right Section - Sign Up Form Original Size */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          {/* Sign Up Container - Keep existing structure */}
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
              {step === 2 && (
                <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'left',
                  mb: 3
                }}
                >
                <IconButton
                  onClick={() => setStep(1)}
                  sx={{
                    right: 3,
                    '&:focus': {
                      outline: '2px solid #1976d2',
                      outlineOffset: '2px'
                    },
                    '&:focus-visible': {
                      outline: '2px solid #1976d2',
                      outlineOffset: '2px'
                    }
                  }}
                  aria-label="Back to previous step"
                >
                  <ArrowBackIcon />
                  <span
                    style={{
                      width: 1,
                      height: 1,
                      overflow: 'hidden',
                      clip: 'rect(0 0 0 0)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Go Back
                  </span>
                </IconButton>
                </Box>
              )}
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
                  src="/statics/Logo.svg"
                  alt="Logo"
                  width={70}
                  height={70}
                />
                <Typography
                  variant="h3"
                  component="h3"
                  sx={{ fontWeight: 'bold' }}
                >
                  Patient Portal
                </Typography>
              </Box>
              {step === 1 && (
                <>
                  <Typography
                    variant="h4"
                    component="h4"
                    sx={{ fontWeight: 'bold', mt: 2, textAlign: 'left' }}
                  >
                    Sign Up
                  </Typography>
                  <Typography
                    component="h6"
                    sx={{
                      color: '#4a4a4a',
                      mt: 1,
                      textAlign: 'justify',
                      mb: 2
                    }}
                  >
                    Click ‘Get Code’ to receive a one-time verification code on
                    your registered email.
                  </Typography>
                  <TextField
                    id="email"
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    label="Email"
                    type="email"
                    value={email}
                    disabled
                    error={!!emailError}
                    helperText={emailError}
                    inputProps={{ 'aria-label': 'Email' }}
                  />
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
                    onClick={handleSendCode}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Get Code'
                    )}
                  </Button>
                  <Box sx={{ mt: 1, textAlign: 'center' }}>
                    <Typography variant="h5" component="h5" fontWeight="bold">
                      Already have an account?{' '}
                      <Box
                        component="span"
                        sx={{
                          color: 'primary.main',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          fontWeight: 'bold',
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline',
                          }
                        }}
                        onClick={() => router.push('/')}
                        aria-label="Go back to sign in"
                        role="link"
                      >
                        Sign In
                        <NorthEast sx={{ fontSize: 16, ml: 0.2 }} />
                      </Box>
                    </Typography>
                  </Box>
                </>
              )}
              {step === 2 && (
                <>
                  <Typography
                    variant="h4"
                    component="h4"
                    sx={{ fontWeight: 'bold', mt: 2, textAlign: 'left' }}
                  >
                    Verification Code
                  </Typography>
                  <Typography
                    component="h6"
                    sx={{ color: '#4a4a4a', mt: 1, textAlign: 'justify' }}
                  >
                    Enter the code from your email to continue.
                  </Typography>
                  <Grid
                    container
                    spacing={1}
                    justifyContent="center"
                    sx={{ mt: 2 }}
                  >
                    {otp.map((digit, index) => (
                      <Grid item key={index}>
                        <Typography
                          component="label"
                          htmlFor={`otp-${index}`}
                          sx={{
                            position: 'absolute',
                            width: '1px',
                            height: '1px',
                            padding: 0,
                            margin: '-1px',
                            overflow: 'hidden',
                            clip: 'rect(0 0 0 0)',
                            whiteSpace: 'nowrap',
                            border: 0
                          }}
                        >
                          Enter OTP digit {index} of 6
                        </Typography>
                        <TextField
                          id={`otp-${index}`}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onPaste={handlePaste}
                          inputProps={{
                            maxLength: 1,
                            style: { textAlign: 'center' }
                          }}
                          sx={{ width: 40 }}
                          error={error && digit === ''}
                        />
                      </Grid>
                    ))}
                  </Grid>

                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{
                      mt: 2,
                      '&:focus': {
                        outline: '2px solid #1976d2',
                        outlineOffset: '2px'
                      },
                      '&:focus-visible': {
                        outline: '2px solid #1976d2',
                        outlineOffset: '2px'
                      }
                    }}
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.some((digit) => digit === '')}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Verify'
                    )}
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    sx={{
                      mt: 1,
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
                    onClick={handleSendCode}
                  >
                    Resend Code
                  </Button>
                </>
              )}
              {step === 3 && (
                <>
                  <Typography
                    variant="h4"
                    component="h4"
                    sx={{ fontWeight: 'bold', mt: 2, textAlign: 'left' }}
                  >
                    Create Password
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    label="Create Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!passwordError}
                    helperText={passwordError}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={togglePasswordVisibility}
                          aria-label={
                            showPassword ? 'Hide password' : 'Show password'
                          }
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
                      )
                    }}
                    inputProps={{ 'aria-label': 'Email' }}
                  />
                  <TextField
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={!!confirmPasswordError}
                    helperText={confirmPasswordError}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={toggleConfirmPasswordVisibility}
                          aria-label={
                            showConfirmPassword
                              ? 'Hide password'
                              : 'Show password'
                          }
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
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
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
                      )
                    }}
                    inputProps={{ 'aria-label': 'Email' }}
                  />
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
                    onClick={handleSignUp}
                  >
                    Sign Up & Login
                  </Button>
                </>
              )}
              <Typography
                variant="subtitle2"
                component="p"
                sx={{ fontWeight: 'bold', mt: 6, textAlign: 'center' }}
              >
                © {new Date().getFullYear()} DataQ Health. All rights reserved.
              </Typography>
            </Box>

            {/* Snackbar for Danger Message of invalid OTP */}
            <Snackbar
              open={openSnackbar}
              autoHideDuration={3000}
              onClose={() => setOpenSnackbar(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert
                onClose={() => setOpenSnackbar(false)}
                severity={severity}
                variant="filled"
              >
                {messageSnackbar}
              </Alert>
            </Snackbar>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

export default SignUp;