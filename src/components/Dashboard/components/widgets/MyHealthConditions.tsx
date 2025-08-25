import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  IconButton,
  Link,
  Chip
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { widgetContent } from '@/components/Dashboard/contexts/widgetData';
import { useDispatch, useSelector } from '@/store/index';
import { useState, useEffect, useMemo } from 'react';
import { getpatientproblems } from '@/slices/patientprofileslice';
import CircularProgressLoader from '@/components/ProgressLoaders/components/Circular';

interface Props {
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

const MyHealthConditions: React.FC<Props> = ({ dragHandleProps }) => {
  const dispatch = useDispatch();
  const [healthConditions, sethealthConditions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const Obj = {
          PatientId: localStorage.getItem('patientID')
        };

        const response = await dispatch(getpatientproblems(Obj)).unwrap();
        const data = response.result;
        sethealthConditions(data);
      } catch (error) {
        console.error('Error fetching medications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  return (
    <>
      {loading ? (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ pb: 1 }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Typography variant="h4" fontWeight="bold">
                {widgetContent.myHealthConditions.title}
              </Typography>
            </Box>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <CircularProgressLoader />
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ minHeight: 250, borderRadius: 3 }}>
          <CardContent sx={{ pb: 1 }}>
            {/* Header with title and badge */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h4" fontWeight="bold">
                {widgetContent.myHealthConditions.title}
                <Chip
                  label={healthConditions.length}
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

            {/* Scrollable Medications List */}
            <Box sx={{ maxHeight: 350, overflowY: 'auto', pr: 1 }}>
              {healthConditions.map((cond, index) => (
                <Box
                  key={index}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    p: 2,
                    mb: 1,
                    position: 'relative'
                  }}
                >
                  <Box display="flex" justifyContent="space-between">
                    <Typography fontWeight="bold">
                      {cond.icdCodeDescription}
                    </Typography>
                    <IconButton size="small">
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{ mt: 0.5 }}
                  >
                    Last reviewed:{' '}
                    {cond.updatedAt
                      ? new Date(cond.updatedAt).toLocaleDateString()
                      : new Date(cond.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="subtitle1" color="text.primary">
                    Provider: {'Dr.Amir Shahzad'} | Diagnosed:{' '}
                    {new Date(cond.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* See all link */}
            <Box textAlign="center" mt={2}>
              <Link
                href="#"
                underline="hover"
                color="primary"
                fontSize="0.9rem"
                fontWeight="bold"
              >
                See all Conditions
              </Link>
            </Box>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default MyHealthConditions;