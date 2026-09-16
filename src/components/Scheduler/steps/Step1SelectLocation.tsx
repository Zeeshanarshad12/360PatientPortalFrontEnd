import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import { useDispatch, useSelector } from '@/store/index';
import {
  GetPracticeLocationForPatient,
  setSelectedLocation
} from '@/slices/ScheduleSlice';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';
import { Facility, AppointmentData } from '../types';
import StepLayout from './StepLayout';

interface Step1Props {
  onNext: (data: AppointmentData) => void;
  onBack?: () => void;
  currentData?: AppointmentData;
}

const normalizeText = (value?: string) =>
  (value || '').replace(/\s+/g, '').toLowerCase();

const findMatchingFacility = (
  facilities: Facility[],
  target: Facility
): Facility | undefined => {
  const byId = facilities.find(
    (facility) => String(facility.id) === String(target.id)
  );
  if (byId) return byId;

  const targetName = normalizeText(target.name);
  const byName =
    targetName &&
    facilities.find((facility) => normalizeText(facility.name) === targetName);
  if (byName) return byName;

  const targetAddress = normalizeText(target.address);
  return (
    (targetAddress &&
      facilities.find(
        (facility) => normalizeText(facility.address) === targetAddress
      )) ||
    undefined
  );
};

export const mapToFacility = (item: any): Facility => {
  const address1 = item?.address1 ?? item?.Address1 ?? item?.address ?? '';
  const address2 = item?.address2 ?? item?.Address2 ?? '';
  const address = [address1, address2].filter(Boolean).join(', ');

  return {
    id: item?.locationId ?? item?.LocationId ?? item?.id,
    name: item?.locationName ?? item?.LocationName ?? item?.name,
    address,
    city: item?.city ?? item?.City,
    state: item?.state ?? item?.State,
    zip: item?.zipCode ?? item?.ZipCode ?? item?.zip ?? item?.Zip,
    phone:
      item?.phoneNumber ??
      item?.PhoneNumber ??
      item?.phone ??
      item?.contactNumber,
    latitude: item?.latitude ?? item?.Latitude,
    longitude: item?.longitude ?? item?.Longitude
  };
};

const Step1SelectLocation: React.FC<Step1Props> = ({
  onNext,
  onBack,
  currentData
}) => {
  const dispatch = useDispatch();
  const { practiceId } = useCurrentPatient();
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    currentData?.facility || null
  );

  const { locations, locationsLoading, locationsError } = useSelector(
    (state: any) => state.schedule
  );

  useEffect(() => {
    dispatch(GetPracticeLocationForPatient({ practiceId }) as any);
  }, [practiceId, dispatch]);

  const facilities: Facility[] = useMemo(
    () => (locations || []).map(mapToFacility),
    [locations]
  );

  useEffect(() => {
    if (!selectedFacility || facilities.length === 0) return;
    const match = findMatchingFacility(facilities, selectedFacility);
    if (match && match !== selectedFacility) {
      setSelectedFacility(match);
      dispatch(setSelectedLocation(match));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilities]);

  // TPM feedback: when the practice only has one location, there's nothing
  // for the patient to choose between, so skip showing the location picker
  // and go straight to the next step with that location pre-selected.
  const autoAdvancedRef = useRef(false);
  useEffect(() => {
    if (
      locationsLoading ||
      selectedFacility ||
      autoAdvancedRef.current ||
      facilities.length !== 1
    ) {
      return;
    }
    autoAdvancedRef.current = true;
    const onlyFacility = facilities[0];
    setSelectedFacility(onlyFacility);
    dispatch(setSelectedLocation(onlyFacility));
    onNext({ ...currentData, facility: onlyFacility });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilities, locationsLoading, selectedFacility]);

  const handleSelectFacility = (facility: Facility) => {
    setSelectedFacility(facility);
    dispatch(setSelectedLocation(facility));
  };

  const handleNext = () => {
    if (!selectedFacility) {
      alert('Please select a facility');
      return;
    }
    onNext({ ...currentData, facility: selectedFacility });
  };

  const renderFacilityCard = (facility: Facility, isSelected: boolean) => (
    <Paper
      key={facility.id}
      onClick={() => handleSelectFacility(facility)}
      sx={{
        p: 2,
        cursor: 'pointer',
        border: '2px solid',
        borderColor: isSelected ? 'primary.main' : '#e0e0e0',
        bgcolor: isSelected ? 'primary.lighter' : 'white',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 1
        }
      }}
    >
      <Typography fontWeight="bold" variant="subtitle1">
        {facility.name}
      </Typography>

      {facility.address && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 0.5,
            mt: 0.5
          }}
        >
          <LocationOnIcon
            fontSize="small"
            sx={{ color: 'text.secondary', mt: '2px' }}
          />
          <Typography variant="body2" color="text.secondary">
            {facility.address}
            {facility.city ? `, ${facility.city}` : ''}
            {facility.state ? `, ${facility.state}` : ''}
            {facility.zip ? ` ${facility.zip}` : ''}
          </Typography>
        </Box>
      )}

      {facility.phone && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mt: 0.5
          }}
        >
          <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {facility.phone}
          </Typography>
        </Box>
      )}
    </Paper>
  );

  return (
    <StepLayout
      footer={
        <>
          {onBack && (
            <Button variant="outlined" onClick={onBack}>
              Cancel
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ ml: 'auto' }}
            disabled={!selectedFacility}
          >
            Continue
          </Button>
        </>
      }
    >
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
        Please select the facility
      </Typography>

      {locationsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {locationsError}
        </Alert>
      )}

      {locationsLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={40} />
        </Box>
      )}

      {!locationsLoading && selectedFacility ? (
        /* Selected Location Summary */
        <Box>
          {renderFacilityCard(selectedFacility, true)}
          <Button
            size="small"
            onClick={() => {
              setSelectedFacility(null);
              dispatch(setSelectedLocation(null));
            }}
            sx={{ mt: 1 }}
          >
            Change Location
          </Button>
        </Box>
      ) : (
        !locationsLoading && (
          <Stack spacing={2}>
            {facilities.length > 0 ? (
              facilities.map((facility: Facility) =>
                renderFacilityCard(facility, false)
              )
            ) : (
              <Typography
                color="text.secondary"
                sx={{ textAlign: 'center', py: 4 }}
              >
                No facilities available
              </Typography>
            )}
          </Stack>
        )
      )}
    </StepLayout>
  );
};

export default Step1SelectLocation;
