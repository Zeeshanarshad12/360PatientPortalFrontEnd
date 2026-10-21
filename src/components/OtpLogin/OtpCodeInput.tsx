import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Box } from '@mui/material';

export const OTP_LENGTH = 6;

interface OtpCodeInputProps {
  value: string[];
  onChange: (digits: string[]) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
  describedBy?: string;
}

export interface OtpCodeInputHandle {
  focus: () => void;
}

/**
 * Six single-digit boxes that behave like one field:
 *  - autocomplete="one-time-code" on the first box so iOS/Android can offer the code; the OS (and
 *    paste) may drop the whole code into one box, so any multi-digit input is spread across boxes;
 *  - inputMode="numeric" for the number keypad;
 *  - each box is labelled "Digit n of 6" inside a labelled group (WCAG 2.1 AA).
 */
const OtpCodeInput = forwardRef<OtpCodeInputHandle, OtpCodeInputProps>(
  ({ value, onChange, onComplete, disabled, error, describedBy }, ref) => {
    const inputs = useRef<Array<HTMLInputElement | null>>([]);

    useImperativeHandle(ref, () => ({
      focus: () => {
        const firstEmpty = value.findIndex((d) => !d);
        inputs.current[firstEmpty === -1 ? OTP_LENGTH - 1 : firstEmpty]?.focus();
      }
    }));

    const commit = (next: string[], focusIndex: number) => {
      onChange(next);
      inputs.current[Math.min(focusIndex, OTP_LENGTH - 1)]?.focus();
      if (next.every((d) => d !== '')) onComplete?.(next.join(''));
    };

    const fillFrom = (index: number, raw: string) => {
      const digits = raw.replace(/\D/g, '');
      if (!digits) return;
      // A full code always fills from the start, wherever the cursor was.
      const startAt = digits.length >= OTP_LENGTH ? 0 : index;
      const next = [...value];
      digits
        .slice(0, OTP_LENGTH - startAt)
        .split('')
        .forEach((d, i) => {
          next[startAt + i] = d;
        });
      commit(next, startAt + digits.length);
    };

    const handleChange = (index: number, raw: string) => {
      if (raw === '') {
        const next = [...value];
        next[index] = '';
        onChange(next);
        return;
      }
      // Typing over an existing digit yields two characters; keep the newest.
      const digits = raw.replace(/\D/g, '');
      if (digits.length > 1 && value[index] && raw.length === 2) {
        fillFrom(index, digits.slice(-1));
        return;
      }
      fillFrom(index, digits);
    };

    const handleKeyDown = (
      index: number,
      e: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (e.key === 'Backspace' && !value[index] && index > 0) {
        e.preventDefault();
        const next = [...value];
        next[index - 1] = '';
        onChange(next);
        inputs.current[index - 1]?.focus();
      } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        inputs.current[index - 1]?.focus();
      } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
        e.preventDefault();
        inputs.current[index + 1]?.focus();
      }
    };

    const handlePaste = (
      index: number,
      e: React.ClipboardEvent<HTMLInputElement>
    ) => {
      e.preventDefault();
      fillFrom(index, e.clipboardData.getData('text'));
    };

    return (
      <Box
        role="group"
        aria-label="One-time code, 6 digits"
        aria-describedby={describedBy}
        sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', my: 2 }}
      >
        {value.map((digit, index) => (
          <Box
            key={index}
            component="input"
            ref={(el: HTMLInputElement | null) => {
              inputs.current[index] = el;
            }}
            id={`otp-login-digit-${index + 1}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={index === 0 ? OTP_LENGTH : 2}
            aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
            aria-invalid={error || undefined}
            disabled={disabled}
            value={digit}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(index, e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
              handleKeyDown(index, e)
            }
            onPaste={(e: React.ClipboardEvent<HTMLInputElement>) =>
              handlePaste(index, e)
            }
            onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
              e.target.select()
            }
            sx={{
              width: '100%',
              maxWidth: 52,
              height: 56,
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              borderRadius: '6px',
              border: '1px solid',
              borderColor: error ? 'error.main' : 'rgba(0,0,0,0.35)',
              backgroundColor: disabled ? 'action.disabledBackground' : '#fff',
              color: 'text.primary',
              outline: 'none',
              '&:focus': {
                borderColor: 'primary.main',
                boxShadow: '0 0 0 2px #1976d2'
              }
            }}
          />
        ))}
      </Box>
    );
  }
);

export default OtpCodeInput;
