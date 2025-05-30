import { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip
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
  const handleLogin = async () => {
    // Check if both fields are filled
    if (!email || !password) {
      setError('Both fields are required!');
      return;
    }
    setLoading(true);
    // Clear error message and perform login logic
    setError('');
    const loginobj = {
      username: email,
      password: password
    };

    const response = await dispatch(GetToken(loginobj)).unwrap();
    if (!response || !response.access_token || response.error_description) {
      // setError('Invalid Credentials');
      setError(response.error_description);
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Clear the error when the user starts typing in the email field
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    // Clear the error when the user starts typing in the password field
    if (error) setError('');
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
          <Typography variant="h3" component="h3" sx={{ fontWeight: 'bold' }}>
            Patient Portal
          </Typography>
        </Box>

        <Typography
          variant="h4"
          component="h4"
          sx={{ fontWeight: 'bold', mt: 2, textAlign: 'left' }}
        >
          Sign In
        </Typography>
        <Typography
          variant="subtitle2"
          component="h6"
          sx={{ mt: 1, textAlign: 'left', mb: 2 }}
        >
          Enter your email address and password to sign in
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
          InputProps={{
            endAdornment: (
              <>
                <IconButton
                  onClick={togglePasswordVisibility}
                  id="LoginEyeIcon"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                  <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
                    {showPassword ? 'Hide' : 'Show'}
                  </span>
                </IconButton>
              </>
            )
          }}
          error={!!error} // Show error if email or password is empty
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
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : (
            'Login'
          )}
        </Button>

        <Typography
          variant="subtitle2"
          component="p"
          sx={{ mt: 3, textAlign: 'left', mb: 2 }}
        >
          To use the patient portal, you need an invitation from your provider.
          If you haven't registered yet, please request your doctor or their
          office to send an invite.
        </Typography>
        <Typography
          variant="subtitle2"
          component="p"
          sx={{ fontWeight: 'bold', mt: 6, textAlign: 'center' }}
        >
          © {new Date().getFullYear()} All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;