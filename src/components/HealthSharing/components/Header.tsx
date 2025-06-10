import React, { useState } from 'react';
import {
  Typography,
  Button,
  Grid,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { useActivityLogState } from '@/components/HealthSharing/contexts/activityLogStates';
import { useActivityLoadState } from '@/components/HealthSharing/contexts/activityLoadStates';
import { useHealthRecordLoadState } from '@/components/HealthSharing/contexts/healthRecordLoadStates';
import { useAriaHiddenFixOnDialog } from '@/hooks/useAriaHiddenFixOnDialog';

const HealthRecordHeader = () => {
  const { isActivityLog, setIsActivityLog } = useActivityLogState();
  const { setIsActivityLoad } = useActivityLoadState();
  const { setIsHealthRecordLoad } = useHealthRecordLoadState();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSwitchViewClick = () => {
    setIsActivityLog(!isActivityLog);
    setIsActivityLoad(false);
    setIsHealthRecordLoad(false);
  };

  const handleApiTokenClick = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);

  const tokenData = [
    { token: 'A3F9D74E2B8C6015', date: '05/09/25', status: 'Active' },
    { token: 'A3F9D74E2B8C6015', date: '05/09/25', status: 'Expired' },
    { token: 'A3F9D74E2B8C6018', date: '05/09/25', status: 'Active' },
  ];

  useAriaHiddenFixOnDialog(isDialogOpen);

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Typography variant="h3" component="h1" fontWeight="bold">
          {isActivityLog ? 'Activity Log' : 'My Health Record'}
        </Typography>

        <Stack direction="row" spacing={0.5}>
          {/* {!isActivityLog && (
            <Button
              variant="outlined"
              sx={{ textTransform: 'none', borderRadius: '5px' }}
              onClick={handleApiTokenClick}
              
            >
              API Token
            </Button>
          )} */}

          <Button
            variant={isActivityLog ? 'contained' : 'outlined'}
            sx={{
              textTransform: 'none', borderRadius: '5px', '&:focus': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              },
              '&:focus-visible': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              }
            }}
            onClick={handleSwitchViewClick}
          >
            {isActivityLog ? 'Back to My Health Record' : 'Activity Log'}
          </Button>
        </Stack>
      </Grid>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {/* <DialogTitle sx={{ m: 0, p: 2 }}>
          API Tokens
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle> */}

        <DialogTitle sx={{ fontWeight: 'bold' }}>
          API Tokens
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <Divider sx={{ marginY: 1 }} />
        </DialogTitle>

        <DialogContent >
          <Card sx={{ backgroundColor: 'rgba(96, 148, 185, 0.16)', mb: 2, borderRadius: 2 }}>
            <CardContent sx={{ padding: 1 }}>
              <Typography variant="body1" fontWeight="bold">
                Use these Tokens to access your data.
              </Typography>
            </CardContent>
          </Card>

          <Table stickyHeader sx={{ borderCollapse: 'separate', borderSpacing: '0 5px' }}>
            <TableHead>
              <TableRow>
                <TableCell>API Tokens</TableCell>
                <TableCell>Generated on</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tokenData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.token}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined" sx={{ borderRadius: '5px' }}>
            Close
          </Button>
          <Button onClick={() => alert('Token Generated')} variant="contained" sx={{ borderRadius: '5px' }}>
            Generate Token
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HealthRecordHeader;
