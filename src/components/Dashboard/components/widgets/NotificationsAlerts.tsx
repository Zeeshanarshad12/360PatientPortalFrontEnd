import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Link,
  Avatar
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { widgetContent } from '@/components/Dashboard/contexts/widgetData';

interface Props {
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

const NotificationsAlerts: React.FC<Props> = ({ dragHandleProps }) => {
  const notifications = widgetContent.notifications.data;

  return (
    <Card sx={{ minHeight: 250, borderRadius: 3 }}>
      <CardContent sx={{ pb: 1 }}>
        {/* Header with Count */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h4" fontWeight="bold">
            {widgetContent.notifications.title}
            <Chip
              label={notifications.length}
              color="default"
              size="small"
              sx={{
                fontWeight: 'bold',
                bgcolor: 'black',
                color: 'white',
                ml: 2
              }}
            />
          </Typography>
          <Box {...dragHandleProps}>
            <IconButton size="small" sx={{ cursor: 'grab' }}>
              <DragIndicatorIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Notifications List */}
        <Box sx={{ maxHeight: 350, overflowY: 'auto', pr: 1 }}>
          {notifications.map((notification: any, index: number) => (
            <Box
              key={index}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2,
                mb: 1.5,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                bgcolor: '#fff'
              }}
            >
              {/* Bell Icon */}
              <Avatar
                sx={{
                  bgcolor: '#e3f2fd',
                  color: '#1976d2',
                  width: 40,
                  height: 40,
                  mt: 0.5
                }}
              >
                <NotificationsIcon sx={{ fontSize: 20 }} />
              </Avatar>

              {/* Notification Content */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="text.primary"
                  sx={{ mb: 0.5 }}
                >
                  {notification.message}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.primary"
                  fontSize="0.8rem"
                >
                  {notification.timestamp}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* View All Link */}
        <Box textAlign="center" mt={2}>
          <Link
            href="#"
            underline="hover"
            color="primary"
            fontSize="0.9rem"
            fontWeight="bold"
          >
            View all Notifications
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NotificationsAlerts;