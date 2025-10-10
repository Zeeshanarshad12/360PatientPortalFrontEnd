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
import React from 'react';
import {
  generateResetPasswordOtp,
  GetPatientUserRequestByCode,
  resetPatientPassword
} from '@/slices/patientprofileslice';
import { useDispatch } from '@/store/index';
import { useRouter } from 'next/router';

function ForgotPassword() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
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

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email input and validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError('');
  };

  // Handle OTP input
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

  // Handle Send OTP (Step 1 → Step 2)
  const handleSendOtp = async () => {
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    const resetOtpResponse = await dispatch(
      generateResetPasswordOtp(email)
    ).unwrap();

    if (resetOtpResponse.result != null || resetOtpResponse.result !== '') {
      setCode(resetOtpResponse.result);
      setLoading(false);
      setStep(2);
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

  // Handle Resend OTP
  const handleResendOtp = () => {
    setOtp(['', '', '', '', '', '']);
    setError(false);
    
    handleSendOtp();
  };

  // Password validation regex (same as signup)
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^*])(?!.*(.)\1\1).{10,20}$/;
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Handle Password Reset (Final Step)
  const handleResetPassword = async () => {
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

    setLoading(true);
    
    const joinotp = otp.join('');
    const resetobj = {
      Code: code,
      Otp: joinotp,
      Password: password.toString(),
      CreatedBy: 'System'
    };

    const patientRestResponse = await dispatch(
      resetPatientPassword(resetobj)
    ).unwrap();

    setLoading(false);

    if (patientRestResponse.result != null) {
      setMessageSnackbar('Password has been updated. Redirecting to Login!');
      setSeverity('success');
      setOpenSnackbar(true);

      setTimeout(() => {
        router.push('/auth/signin');
      }, 1000); // delay before proceeding
    } else {
      setMessageSnackbar('Error occurred during the Reset process. Try Again!');
      setSeverity('error');
      setOpenSnackbar(true);
      return;
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(false);
      setPasswordError('');
      setConfirmPasswordError('');
    } else {
      router.push('/auth/signin');
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

        {/* Right Section - Reset Password Form */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          {/* Reset Password Container */}
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
              {/* Back Button */}
              {(step === 2 || step === 3) && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'left',
                    mb: 3
                  }}
                >
                  <IconButton
                    onClick={handleBack}
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

              {/* Logo and Title */}
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

              {/* Step 1: Email Input */}
              {step === 1 && (
                <>
                  <Typography
                    variant="h4"
                    component="h4"
                    sx={{ fontWeight: 'bold', mt: 2, textAlign: 'left' }}
                  >
                    Reset Password
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
                    Enter your email address to receive a verification code for
                    password reset.
                  </Typography>
                  <TextField
                    id="email"
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
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
                    onClick={handleSendOtp}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Send Verification Code'
                    )}
                  </Button>
                </>
              )}

              {/* Step 2: OTP Verification */}
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
                      'Verify Code'
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
                    onClick={handleResendOtp}
                  >
                    Resend Code
                  </Button>
                </>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <>
                  <Typography
                    variant="h4"
                    component="h4"
                    sx={{ fontWeight: 'bold', mt: 2, textAlign: 'left' }}
                  >
                    Create New Password
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
                    Enter your new password below.
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    label="New Password"
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
                    inputProps={{ 'aria-label': 'New Password' }}
                  />
                  <TextField
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    label="Confirm New Password"
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
                            {showConfirmPassword ? 'Hide' : 'Show'}
                          </span>
                        </IconButton>
                      )
                    }}
                    inputProps={{ 'aria-label': 'Confirm New Password' }}
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
                    onClick={handleResetPassword}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </>
              )}

              {/* Footer */}
              <Typography
                variant="subtitle2"
                component="p"
                sx={{ fontWeight: 'bold', mt: 6, textAlign: 'center' }}
              >
                © {new Date().getFullYear()} DataQ Health. All rights reserved.
              </Typography>
            </Box>

            {/* Snackbar for Error Messages */}
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

export default ForgotPassword;
