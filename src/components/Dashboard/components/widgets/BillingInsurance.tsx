import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Link,
  Avatar,
  Divider
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { widgetContent } from '@/components/Dashboard/contexts/widgetData';

interface Props {
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

const getClaimStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return { bgcolor: '#27ae60', textColor: 'white' };
    default:
      return { bgcolor: '#e0e0e0', textColor: '#666' };
  }
};

const BillingInsurance: React.FC<Props> = ({ dragHandleProps }) => {
  const insurance = widgetContent.billingInsurance.data;
  const claims = insurance.claims;

  return (
    <Card sx={{ minHeight: 250, borderRadius: 3 }}>
      <CardContent sx={{ pb: 1 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" fontWeight="bold">
            {widgetContent.billingInsurance.title}
          </Typography>
          <Box {...dragHandleProps}>
            <IconButton size="small" sx={{ cursor: 'grab' }}>
              <DragIndicatorIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Primary Insurance Card */}
        <Box
          sx={{
            bgcolor: '#e3f0fb',
            borderRadius: 2,
            p: 2,
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography fontWeight="bold" color="text.primary">
              Primary Insurance
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={insurance.status}
                size="small"
                sx={{
                  bgcolor: '#1976d2',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  mr: 1
                }}
              />
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="body2" color="#1976d2" fontWeight="bold">
                Provider
              </Typography>
              <Typography variant="body2" color="text.primary">
                {insurance.provider}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="#1976d2" fontWeight="bold">
                Plan Type
              </Typography>
              <Typography variant="body2" color="text.primary">
                {insurance.type}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="#1976d2" fontWeight="bold">
                Member ID
              </Typography>
              <Typography variant="body2" color="text.primary">
                {insurance.memberId}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="#1976d2" fontWeight="bold">
                Group ID
              </Typography>
              <Typography variant="body2" color="text.primary">
                {insurance.groupId}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Recent Claims */}
        <Typography fontWeight="bold" sx={{ mb: 1 }}>
          Recent Claims
        </Typography>
        <Box>
          {claims.map((claim: any, index: number) => {
            const statusColors = getClaimStatusColor(claim.status);
            return (
              <Box
                key={index}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  p: 2,
                  mb: 1.5,
                  bgcolor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography fontWeight="bold" color="text.primary">
                      {claim.service}
                    </Typography>
                    <Chip
                      label={claim.status}
                      size="small"
                      sx={{
                        bgcolor: statusColors.bgcolor,
                        color: statusColors.textColor,
                        fontWeight: 'bold',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        ml: 1
                      }}
                    />
                  </Box>
                  <Typography fontWeight="bold" color="text.primary">
                    {claim.amount}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>
                    {claim.provider}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="text.primary">
                    {claim.date}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Claim ID: {claim.claimId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Coverage: {claim.coverage}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* View All Link */}
        <Box textAlign="center" mt={2}>
          <Link
            href="#"
            underline="hover"
            color="primary"
            fontSize="0.95rem"
            fontWeight="bold"
          >
            View all Claims
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BillingInsurance;