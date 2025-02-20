import React from 'react';

interface ErrorMessageProps {
  touched: Record<string, boolean>;
  errors: Record<string, string>;
  fieldName: string;
  errorapp?: { err?: string };
  sx?: React.CSSProperties; // React.CSSProperties is a type for inline style objects
  fromReferral?: boolean;
}

const ErrorMessage = ({
  touched,
  errors,
  fieldName,
  fromReferral,
  errorapp,
  sx = {}
}: ErrorMessageProps) => {
  return (touched[fieldName] && errors[fieldName]) || errorapp?.err ? (
    <div
      style={{
        marginTop: '5px',
        ...sx
      }}
      className="MuiFormHelperText-root Mui-error MuiFormHelperText-sizeSmall MuiFormHelperText-contained css-162hp40-MuiFormHelperText-root"
    >
      <span
        className="validation-message"
        style={{
          color: fromReferral && 'rgb(232, 20, 20)',
          fontWeight: fromReferral && '400',
          fontSize: fromReferral && '14px'
        }}
      >
        {errors[fieldName]}
      </span>
    </div>
  ) : null;
};
export default ErrorMessage;
