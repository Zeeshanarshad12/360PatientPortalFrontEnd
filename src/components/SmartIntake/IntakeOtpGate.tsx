import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  Radio,
  RadioGroup,
  Typography
} from '@mui/material';
import AuthShell from '@/components/OtpLogin/AuthShell';
import OtpCodeInput, {
  OTP_LENGTH,
  OtpCodeInputHandle
} from '@/components/OtpLogin/OtpCodeInput';
import {
  formatMmSs,
  formatSpoken,
  useCountdown
} from '@/components/OtpLogin/useCountdown';
import {
  OtpChannel,
  OtpChannelOption,
  OtpLoginError,
  sendOtpCode,
  startIntakeOtp,
  verifyIntakeOtp
} from '@/services/otpLoginService';
import { rememberPostLoginRedirect } from '@/utils/postLoginRedirect';
import { saveIntakeSession } from './intakeSession';

type Step = 'intro' | 'choose' | 'code';

const DEFAULT_CODE_LIFETIME_SECONDS = 5 * 60;

const NEUTRAL_LIMIT_MESSAGE =
  "We can't send or check a code right now. Please wait a while and try again, or sign in to your portal account.";

const emptyDigits = () => Array<string>(OTP_LENGTH).fill('');

const messageFor = (error: unknown): string => {
  const e = error instanceof OtpLoginError ? error : null;
  switch (e?.code) {
    case 'RATE_LIMITED':
    case 'RESEND_NOT_AVAILABLE':
      return NEUTRAL_LIMIT_MESSAGE;
    case 'NETWORK':
      return "We couldn't reach the portal. Check your connection and try again.";
    default:
      return 'Something went wrong. Please try again.';
  }
};

const channelLabel = (option: OtpChannelOption) =>
  option.channel === 'sms'
    ? `Text message to ${option.maskedDestination}`
    : `Email to ${option.maskedDestination}`;

const focusRing = {
  '&:focus': { outline: '2px solid #1976d2', outlineOffset: '2px' },
  '&:focus-visible': { outline: '2px solid #1976d2', outlineOffset: '2px' }
};

const srOnly = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap'
} as const;

/**
 * What a patient who is NOT registered on the portal sees when they open their intake link: instead
 * of being sent to a sign-in they can't use, they get a one-time code on the email or mobile number
 * their practice has on file for them (the link says who they are; nothing is typed in). A verified
 * code opens only this link's forms - it is not a portal sign-in.
 *
 * Registered patients can still sign in to the portal instead.
 */
export function IntakeOtpGate({
  token,
  onVerified
}: {
  token: string;
  onVerified: () => void;
}) {
  const router = useRouter();

  const [step, setStep] = useState<Step>('intro');
  // The challenge id is an opaque server handle; kept in memory only (never the URL or storage).
  const [challengeId, setChallengeId] = useState('');
  const [channels, setChannels] = useState<OtpChannelOption[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<OtpChannel | ''>('');
  const [sentTo, setSentTo] = useState<OtpChannelOption | null>(null);

  const [digits, setDigits] = useState<string[]>(emptyDigits);
  const [codeDead, setCodeDead] = useState<'expired' | 'locked' | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [announcement, setAnnouncement] = useState('');

  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const codeInputRef = useRef<OtpCodeInputHandle | null>(null);
  const verifyingRef = useRef(false);
  const { remaining, start: startCountdown, clear: clearCountdown } =
    useCountdown();

  const canResend = remaining === 0 || codeDead !== null;

  useEffect(() => {
    if (step === 'code') codeInputRef.current?.focus();
    else headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (step !== 'code' || codeDead) return;
    if (remaining === 0) {
      setAnnouncement('Your code has expired. You can now request a new code.');
    } else if (remaining % 60 === 0 || remaining === 30 || remaining === 10) {
      setAnnouncement(
        `You can request a new code in ${formatSpoken(remaining)}.`
      );
    }
  }, [remaining, step, codeDead]);

  const resetCodeState = (seconds?: number) => {
    setDigits(emptyDigits());
    setCodeDead(null);
    setError('');
    startCountdown(seconds ?? DEFAULT_CODE_LIFETIME_SECONDS);
  };

  const startOver = (message?: string) => {
    setStep('intro');
    setChallengeId('');
    setChannels([]);
    setSelectedChannel('');
    setSentTo(null);
    setDigits(emptyDigits());
    setCodeDead(null);
    setNotice('');
    clearCountdown();
    setError(message ?? '');
  };

  const handleStart = async () => {
    setError('');
    setBusy(true);
    try {
      const result = await startIntakeOtp(token);
      setChallengeId(result.challengeId);
      const options = Array.isArray(result.channels) ? result.channels : [];
      setChannels(options);

      if (result.requiresChannelSelection && options.length > 1) {
        setSelectedChannel(options[0].channel);
        setStep('choose');
      } else {
        // Already sent (or, for a link that isn't live, pretended to) - same screen either way.
        setSentTo(null);
        resetCodeState(
          result.resendAvailableInSeconds ?? result.expiresInSeconds
        );
        setNotice("If this link is valid, we've sent a code.");
        setStep('code');
      }
    } catch (e) {
      setError(messageFor(e));
    } finally {
      setBusy(false);
    }
  };

  const handleSend = async () => {
    if (!selectedChannel) return;
    setError('');
    setBusy(true);
    try {
      const result = await sendOtpCode(challengeId, selectedChannel);
      setSentTo(channels.find((c) => c.channel === selectedChannel) ?? null);
      resetCodeState(result?.resendAvailableInSeconds ?? result?.expiresInSeconds);
      setNotice('');
      setStep('code');
    } catch (e) {
      if (e instanceof OtpLoginError && e.code === 'OTP_CHALLENGE_INVALID') {
        startOver('Your request timed out. Please start again.');
      } else {
        setError(messageFor(e));
      }
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || busy) return;
    setError('');
    setBusy(true);
    try {
      const result = await sendOtpCode(challengeId, sentTo?.channel);
      resetCodeState(result?.resendAvailableInSeconds ?? result?.expiresInSeconds);
      setNotice(
        sentTo
          ? `We've sent a new code to ${sentTo.maskedDestination}. Any earlier code no longer works.`
          : "If this link is valid, we've sent a new code. Any earlier code no longer works."
      );
      codeInputRef.current?.focus();
    } catch (e) {
      if (e instanceof OtpLoginError && e.code === 'OTP_CHALLENGE_INVALID') {
        startOver('Your request timed out. Please start again.');
      } else {
        setError(messageFor(e));
      }
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (code?: string) => {
    const value = code ?? digits.join('');
    if (verifyingRef.current || codeDead) return;
    if (!/^\d{6}$/.test(value)) {
      setError('Enter all 6 digits of your code.');
      codeInputRef.current?.focus();
      return;
    }

    verifyingRef.current = true;
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const result = await verifyIntakeOtp(challengeId, value);
      if (!result?.intakeSessionToken) throw new OtpLoginError('UNKNOWN');
      saveIntakeSession(token, result.intakeSessionToken, result.expiresInSeconds);
      setAnnouncement('Code verified. Opening your forms.');
      onVerified();
      return;
    } catch (e) {
      const err = e instanceof OtpLoginError ? e : new OtpLoginError('UNKNOWN');
      setDigits(emptyDigits());
      switch (err.code) {
        case 'OTP_INVALID':
          if (err.attemptsRemaining === 0) {
            setCodeDead('locked');
            setError(
              'Too many incorrect attempts. This code no longer works. Request a new code.'
            );
          } else {
            setError(
              typeof err.attemptsRemaining === 'number'
                ? `That code is incorrect. You have ${err.attemptsRemaining} ${
                    err.attemptsRemaining === 1 ? 'attempt' : 'attempts'
                  } left.`
                : 'That code is incorrect. Please try again.'
            );
            setTimeout(() => codeInputRef.current?.focus(), 0);
          }
          break;
        case 'OTP_LOCKED':
          setCodeDead('locked');
          setError(
            'Too many incorrect attempts. This code no longer works. Request a new code.'
          );
          break;
        case 'OTP_EXPIRED':
          setCodeDead('expired');
          setError('This code has expired. Request a new code.');
          break;
        case 'OTP_CHALLENGE_INVALID':
          startOver('Your request timed out. Please start again.');
          break;
        default:
          setError(messageFor(err));
      }
      setBusy(false);
    } finally {
      verifyingRef.current = false;
    }
  };

  // For patients who do have a portal account: sign in as usual and come back to this link.
  const goToPortalSignIn = () => {
    rememberPostLoginRedirect(window.location.pathname);
    router.push('/');
  };

  const heading = (text: string) => (
    <Typography
      variant="h3"
      component="h1"
      ref={headingRef}
      tabIndex={-1}
      sx={{ fontWeight: 'bold', mt: 2, textAlign: 'left', outline: 'none' }}
    >
      {text}
    </Typography>
  );

  const spinner = (label: string) => (
    <CircularProgress size={24} sx={{ color: 'white' }} aria-label={label} />
  );

  const renderIntro = () => (
    <Box
      component="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        handleStart();
      }}
    >
      {heading('Verify it’s you to open your forms')}
      <Typography
        variant="subtitle1"
        component="p"
        sx={{ mt: 1, textAlign: 'left', mb: 2, fontWeight: 'bold' }}
      >
        We&apos;ll send a one-time code to the email address or mobile number
        your practice has on file for you. You don&apos;t need a portal account.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        sx={{ mt: 1, borderRadius: '5px', ...focusRing }}
        disabled={busy}
      >
        {busy ? spinner('Sending') : 'Send me a code'}
      </Button>
    </Box>
  );

  const renderChoose = () => (
    <Box
      component="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
    >
      {heading('Where should we send it?')}

      {error && (
        <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
          {error}
        </Alert>
      )}

      <FormControl component="fieldset" sx={{ mt: 2, width: '100%', textAlign: 'left' }}>
        <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>
          Send my one-time code by
        </FormLabel>
        <RadioGroup
          name="intake-otp-channel"
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value as OtpChannel)}
        >
          {channels.map((option) => (
            <FormControlLabel
              key={option.channel}
              value={option.channel}
              control={<Radio />}
              label={channelLabel(option)}
              disabled={busy}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        sx={{ mt: 2, borderRadius: '5px', ...focusRing }}
        disabled={busy || !selectedChannel}
      >
        {busy ? spinner('Sending') : 'Send code'}
      </Button>
    </Box>
  );

  const renderCode = () => (
    <Box
      component="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        handleVerify();
      }}
    >
      {heading('Enter your code')}
      <Typography
        id="intake-otp-code-help"
        variant="subtitle1"
        component="p"
        sx={{ mt: 1, textAlign: 'left', fontWeight: 'bold' }}
      >
        {sentTo
          ? `We sent a 6-digit code to ${sentTo.maskedDestination}.`
          : "If this link is valid, we've sent a 6-digit code."}{' '}
        It expires in 5 minutes.
      </Typography>

      {notice && !error && (
        <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }} role="status">
          {notice}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
          {error}
        </Alert>
      )}

      <OtpCodeInput
        ref={codeInputRef}
        value={digits}
        onChange={(next) => {
          setDigits(next);
          if (error && !codeDead) setError('');
        }}
        onComplete={(code) => handleVerify(code)}
        disabled={busy || codeDead !== null}
        error={!!error && !codeDead}
        describedBy="intake-otp-code-help"
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        sx={{ borderRadius: '5px', ...focusRing }}
        disabled={busy || codeDead !== null}
      >
        {busy ? spinner('Checking code') : 'Verify and open my forms'}
      </Button>

      <Box
        sx={{
          mt: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          flexWrap: 'wrap'
        }}
      >
        <Typography variant="body2" component="p" aria-hidden="true">
          {canResend
            ? "Didn't get a code?"
            : `Resend available in ${formatMmSs(remaining)}`}
        </Typography>
        <Button
          type="button"
          variant="outlined"
          size="small"
          onClick={handleResend}
          disabled={!canResend || busy}
          aria-label={
            canResend
              ? 'Resend code'
              : `Resend code, available in ${formatSpoken(remaining)}`
          }
          sx={focusRing}
        >
          {canResend ? 'Resend code' : `Resend code (${formatMmSs(remaining)})`}
        </Button>
      </Box>

      <Typography
        variant="body2"
        component="p"
        sx={{ mt: 2, textAlign: 'left', color: 'text.secondary' }}
      >
        We&apos;ll never ask you for this code by phone or email.
      </Typography>
    </Box>
  );

  return (
    <>
      <Head>
        <title>Verify your identity - Patient Portal</title>
      </Head>
      <AuthShell>
        {step === 'intro' && renderIntro()}
        {step === 'choose' && renderChoose()}
        {step === 'code' && renderCode()}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={goToPortalSignIn}
            sx={{ fontWeight: 'bold', ...focusRing }}
          >
            I have a portal account — sign in instead
          </Link>
        </Box>

        {/* Polite live region for countdown and status updates. */}
        <Box component="div" aria-live="polite" aria-atomic="true" sx={srOnly}>
          {announcement}
        </Box>
      </AuthShell>
    </>
  );
}

export default IntakeOtpGate;
