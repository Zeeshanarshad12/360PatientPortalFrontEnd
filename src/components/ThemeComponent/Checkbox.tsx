import { FormControlLabel, Checkbox } from '@mui/material';
import { BsCheck } from 'react-icons/bs';

const ThemeCheckbox = (props) => {
  const checkBoxStyle = {
    color: 'lightgray'
  };
  const checkStyle = {
    backgroundColor: '#006AD4',
    color: 'white',
    width: '24px',
    height: '24px',
    borderRadius: '5px',
    boxShadow: '6px 10px 14px #bddeff'
  };

  return (
    <FormControlLabel
      control={
        <Checkbox
          sx={checkBoxStyle}
          checkedIcon={<BsCheck style={checkStyle} />}
          {...props}
        />
      }
      label=""
      sx={{ color: '#909090' }}
      name="isActive"
      onChange={props?.onChange}
    />
  );
};

export default ThemeCheckbox;
