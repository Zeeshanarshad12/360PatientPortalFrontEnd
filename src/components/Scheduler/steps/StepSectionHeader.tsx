import React from 'react';
import { Box, TextField, InputAdornment, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface StepSectionHeaderProps {
  title: string;
  variant?: 'h6' | 'subtitle1' | 'subtitle2';
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchDisabled?: boolean;
  showSearch?: boolean;
}

// Section label on the left, search field on the right, on one row.
const StepSectionHeader: React.FC<StepSectionHeaderProps> = ({
  title,
  variant = 'h6',
  searchValue = '',
  onSearchChange,
  searchPlaceholder,
  searchDisabled,
  showSearch = true
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 1
    }}
  >
    <Typography variant={variant} fontWeight="bold">
      {title}
    </Typography>
    {showSearch && onSearchChange && (
      <TextField
        size="small"
        placeholder={searchPlaceholder}
        value={searchValue}
        disabled={searchDisabled}
        onChange={(e) => onSearchChange(e.target.value)}
        inputProps={{ 'aria-label': searchPlaceholder }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          )
        }}
        sx={{ width: { xs: '100%', sm: 300 } }}
      />
    )}
  </Box>
);

export default StepSectionHeader;
