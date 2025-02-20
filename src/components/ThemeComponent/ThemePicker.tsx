import { DatePicker, LocalizationProvider } from '@mui/lab';
import { TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React, { useState } from 'react';

function DatePickerCompo(props: any) {
  const ImageComp = () => {
    return <img src="/statics/calender.svg" width={'15px'} />;
  };

  const minDate = new Date('1900-01-01');

  const [inputValue, setInputValue] = useState<string>('');

  const handleChange = (newValue: Date | null) => {
    // Check if newValue is a Date object

    if (newValue instanceof Date && !isNaN(newValue.getTime())) {
      if (props?.views && props.views[0] === 'year') {
        const currentDate = new Date();
        if (newValue.getFullYear() === currentDate.getFullYear()) {
          // If the selected year is the current year, set the date to the first day of that year
          const firstDayOfYear = new Date(newValue.getFullYear(), 0, 1);
          setInputValue(firstDayOfYear.toLocaleDateString('en-US'));
          props.onChange && props.onChange(firstDayOfYear);
        } else {
          const formattedDate = `${
            newValue.getMonth() + 1
          }/${newValue.getDate()}/${newValue.getFullYear()}`;
          setInputValue(formattedDate);
          props.onChange && props.onChange(newValue);
        }
      } else {
        setInputValue(newValue.toLocaleDateString('en-US'));
        props.onChange && props.onChange(newValue);
      }
    } else {
      // Handle case where newValue is null
      setInputValue('');
      props.onChange && props.onChange(null);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const lastChar = inputValue.slice(-1);
    const isValid = lastChar === '' || /^\d+$/.test(lastChar);

    if (isValid) {
      setInputValue(inputValue);
      props?.inputChange ? props?.inputChange(inputValue) : '';
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value.length === 8 || value.length === 7) {
      const year = parseInt(value.substring(6));
      if (year < 100) {
        event.target.setCustomValidity(' ');
        props?.onBlur && props?.onBlur();
      } else {
        event.target.setCustomValidity('');
        const date = new Date(
          value.substring(0, 2) + '/' + value.substring(2, 4) + '/' + year
        );
        props?.onChange && props?.onChange(date);
        props?.onBlur && props?.onBlur();
      }
    } else {
      event.target.setCustomValidity('');
      props?.onBlur && props?.onBlur();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        views={props.views}
        value={props.value}
        inputFormat={props.inputFormat}
        disabled={props.disabled}
        minDate={props.minDate ? props.minDate : minDate}
        maxDate={props?.maxDate}
        onChange={handleChange}
        disableFuture={props.future}
        disablePast={props.past}
        components={{
          OpenPickerIcon: ImageComp
        }}
        PopperProps={{
          className: props.inset ? '' : 'customposition'
        }}
        renderInput={(params) => (
          <TextField
            style={{
              width: props.width,
              height: props.height
            }}
            {...params}
            size="small"
            onBlur={handleBlur}
            onChange={handleInputChange}
            value={inputValue}
            onInput={(e: any) => {
              props?.onInput?.(e.target.value);
            }}
            type={props.type}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'transparent',
                bgcolor: 'white',
                height: '37px'
              },

              '& fieldset': {
                border: props.bordernone ? 'none' : '',
                padding: '0px',
                margin: '0px'
              },
              ...props.customsx
            }}
            helperText={null}
            error={
              props?.error || inputValue.length === 7 || inputValue.length === 6
            }
          />
        )}
      />
    </LocalizationProvider>
  );
}

DatePickerCompo.defaultProps = {
  disabled: false,
  paddingStyle: '8.5px 14px',
  width: '100%',
  height: '30px',
  inset: 'customposition',
  inputFormat: 'MM/dd/yyyy',
  customsx: ''
};

export default DatePickerCompo;
