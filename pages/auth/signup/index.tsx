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
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Image from 'next/image';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import React, { useEffect } from "react";
import { GetPatientUserRequestByCode, GenerateOtp, AddPatientUser} from "@/slices/patientprofileslice";
import { useDispatch, useSelector } from "@/store/index";
import { useRouter } from 'next/router';

function SignUp  ()  {
  debugger;
  const dispatch = useDispatch();
  const router = useRouter();
  const [code, setCode] = useState(null);
  const { GetPatientUserRequestByCodeData,GenerateOtpData } = useSelector((state) => state.patientprofileslice);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    debugger;
    //if (router.asPath) {
      const queryString = router.asPath.split('?')[1];
      if (queryString) {
        const urlParams = new URLSearchParams(queryString);
        const newCode = urlParams.get('code');

        // Only update if the new code is different from the current code
        if (newCode && (newCode !== code || code === null)) {
          setCode(newCode);
        }
      }
    //}
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

  // Handle Verify Button Click
  const handleVerifyOtp = () => {

    if (otp.some((digit) => digit === '')) {
      setError(true);
      return;
    }

    const joinotp=otp.join("");
;
      if(joinotp == GenerateOtpData?.result){
      }
      else
      {
        // alert('Invalid OTP');
        setOpenSnackbar(true);
        return;
      }
    setLoading(true); // Show loading indicator
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 2000); // 2-second delay before proceeding
  };

  const handleSendCode = () =>{
    setStep(2);
    dispatch(GenerateOtp(GetPatientUserRequestByCodeData?.result.code));
  }

   // Regex to validate password
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@$%^*])(?!.*(.)\1\1).{10,20}$/;
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleSignUp = () => {
    // Clear any previous errors
    setPasswordError('');
    setConfirmPasswordError('');

    // Check if the password matches the regex
    if (!passwordRegex.test(password)) {
      setPasswordError('Password must be between 10 to 20 characters, contain at least one lowercase letter, one uppercase letter, one digit, one special character, and no three consecutive identical characters.');
      return;
    }

    // Check if the passwords match
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      return;
    }
    const signupobj = {
      Code : code,
      Otp : GenerateOtpData?.result.toString() ,
      Password : password.toString(),
      CreatedBy : "System"
    }
    dispatch(AddPatientUser(signupobj));
    router.push('/auth/signin');
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center'
      }}
    >
      <Box
        sx={{
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: 'white',
          width: '100%',
          position: 'relative'
        }}
      >
        {step === 2 && (
          <IconButton
            onClick={() => setStep(1)}
            sx={{ position: 'absolute', top: 10, left: 10 }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            mb: 4
          }}
        >
          <Image src="/statics/Logo.svg" alt="Logo" width={50} height={50} />
          <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
            Patient Portal
          </Typography>
        </Box>
        {step === 1 && (
          <>
            <Typography
              variant="h4"
              sx={{ fontWeight: 'bold', mt: 2, textAlign: 'left' }}
            >
              Sign Up
            </Typography>
            <Typography
              sx={{ color: 'gray', mt: 1, textAlign: 'justify', mb: 2 }}
            >
              Click ‘Get Code’ to receive a one-time verification code on your
              registered email.
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              label="Email"
              value={email}
              disabled
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2, borderRadius: '5px' }}
              onClick={handleSendCode}
            >
              Get Code
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <Typography
              variant="h4"
              sx={{ fontWeight: 'bold', mt: 2, textAlign: 'left' }}
            >
              Verification Code
            </Typography>
            <Typography sx={{ color: 'gray', mt: 1, textAlign: 'justify' }}>
              Enter the code from your email to continue.
            </Typography>
            <Grid container spacing={1} justifyContent="center" sx={{ mt: 2 }}>
              {otp.map((digit, index) => (
                <Grid item key={index}>
                  <TextField
                    id={`otp-${index}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
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
              sx={{ mt: 2 }}
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
              sx={{ mt: 1, borderRadius: '5px' }}
              onClick={handleSendCode}
            >
              Resend Code
            </Button>
          </>
        )}
        {step === 3 && (
          <>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2, textAlign: 'left' }}>
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
            <IconButton onClick={togglePasswordVisibility}>
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          )
        }}
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
            <IconButton onClick={toggleConfirmPasswordVisibility}>
              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          )
        }}
      />
      <Button
        fullWidth
        variant="contained"
        color="primary"
        sx={{ mt: 2, borderRadius: '5px' }}
        onClick={handleSignUp}
      >
        Sign Up & Login
      </Button>
          </>
        )}
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 'bold', mt: 6, textAlign: 'center' }}
        >
          © {new Date().getFullYear()} All rights reserved.
        </Typography>
      </Box>

      {/* Snackbar for Danger Message of invalid OTP */}
            <Snackbar
              open={openSnackbar}
              autoHideDuration={3000}
              onClose={() => setOpenSnackbar(false)}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <Alert onClose={() => setOpenSnackbar(false)} severity="error" variant="filled">
                Invalid OTP!
              </Alert>
            </Snackbar>

    </Container>
  );
};

export default SignUp;