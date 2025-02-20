import {
  CardContent,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import React from 'react';
import { useSelector } from '@/store/index';

function Insurance() {
  const { PatientDetailsById } = useSelector(
    (state) => state.patientprofileslice
  );
  const patientInsurance = Array.isArray(PatientDetailsById?.item3)
    ? PatientDetailsById.item3
    : [];

  return (
    <CardContent>
      <Typography variant="h6" fontWeight="bold" color="primary">
        Insurance
      </Typography>
      <Divider sx={{ marginY: 2 }} />

      <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
        <Table sx={{ borderCollapse: 'separate', borderSpacing: '0 5px' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>
                Coverage
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>
                Plan
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>
                Subscriber ID
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>
                Copay
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>
                Effective Date
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>
                Relationship
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {patientInsurance.map((insurance, index) => (
              <TableRow key={index} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                <TableCell>{insurance?.coverage}</TableCell>
                <TableCell>{insurance?.planName}</TableCell>
                <TableCell>{insurance?.memberId}</TableCell>
                <TableCell>$ {insurance?.copay}</TableCell>
                <TableCell>{insurance?.effectiveDate}</TableCell>
                <TableCell>{insurance?.relationWithOwner}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  );
}

export default Insurance;