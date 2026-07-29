import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography
} from '@mui/material';

interface DocumentsHeaderProps {
  dateRange: string;
  onChangeDateRange: (value: string) => void;
}

const DocumentsHeader: React.FC<DocumentsHeaderProps> = ({
  dateRange,
  onChangeDateRange
}) => {
  const handleDateRangeChange = (e: SelectChangeEvent<string>) => {
    onChangeDateRange(e.target.value as string);
  };

  return (
    <Card sx={{ width: '100%' }}>
      <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Grid item xs={12} sm="auto">
            <Typography
              variant="h3"
              component="h1"
              fontWeight="bold"
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } }}
            >
              {'Documents'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm="auto">
            <Grid container spacing={2}>
              <Grid item xs={12} sm="auto">
                <FormControl
                  size="small"
                  fullWidth
                  sx={{ minWidth: { xs: '100%', sm: 160 } }}
                >
                  <InputLabel id="date-range-label">Date Range</InputLabel>
                  <Select
                    labelId="date-range-label"
                    id="date-range"
                    value={dateRange}
                    label="Date Range"
                    onChange={handleDateRangeChange}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="1m">Last 30 days</MenuItem>
                    <MenuItem value="6m">Last 6 months</MenuItem>
                    <MenuItem value="1y">Last 1 year</MenuItem>
                    <MenuItem value="2y">Last 2 years</MenuItem>
                    <MenuItem value="3y">Last 3 years</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DocumentsHeader;