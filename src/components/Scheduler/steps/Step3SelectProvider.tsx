import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Stack,
  Paper,
  Typography,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Autocomplete,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { useDispatch, useSelector } from '@/store/index';
import { GetProvidersbyPracticeID } from '@/slices/ScheduleSlice';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';
import { Provider, AppointmentData } from '../types';

interface Step3Props {
  onNext: (data: AppointmentData) => void;
  onBack: () => void;
  currentData?: AppointmentData;
}

const DEFAULT_VISIBLE_COUNT = 5;

const SPECIALTIES = [
  'All',
  'Primary Care',
  'Cardiology',
  'Neurology',
  'Orthopedics'
];

const SPECIALTY_KEYWORDS: Record<string, string[]> = {
  'Primary Care': ['primary care', 'family medicine', 'internal medicine'],
  Cardiology: ['cardiology', 'cardiac', 'cardio'],
  Neurology: ['neurology', 'neuro'],
  Orthopedics: ['orthopedic', 'ortho']
};

const Step3SelectProvider: React.FC<Step3Props> = ({
  onNext,
  onBack,
  currentData
}) => {
  const dispatch = useDispatch();
  const { practiceId } = useCurrentPatient();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    currentData?.provider || null
  );
  const [selectedSpecialty, setSelectedSpecialty] = useState(0);

  const { providers, providersLoading, providersError } = useSelector(
    (state: any) => state.schedule
  );

  useEffect(() => {
    dispatch(GetProvidersbyPracticeID({ practiceId }) as any);
  }, [practiceId, dispatch]);

  useEffect(() => {
    if (!selectedProvider || !providers || providers.length === 0) return;
    const match = providers.find(
      (provider: Provider) => provider.providerId === selectedProvider.providerId
    );
    if (match && match !== selectedProvider) {
      setSelectedProvider(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers]);

  const providersWithLowerSpecialty = useMemo(() => {
    const list: Provider[] = providers || [];
    return list.map((p) => ({
      provider: p,
      specialtyLower: (p.providerSpeciality || '').toLowerCase()
    }));
  }, [providers]);

  const specialtyFilteredProviders = useMemo(() => {
    const specialty = SPECIALTIES[selectedSpecialty];
    if (!specialty || specialty === 'All') {
      return providersWithLowerSpecialty.map((entry) => entry.provider);
    }
    const keywords = SPECIALTY_KEYWORDS[specialty] || [];
    return providersWithLowerSpecialty
      .filter((entry) =>
        keywords.some((keyword) => entry.specialtyLower.includes(keyword))
      )
      .map((entry) => entry.provider);
  }, [providersWithLowerSpecialty, selectedSpecialty]);

  const visibleProviders = useMemo(() => {
    const specialty = SPECIALTIES[selectedSpecialty];
    if (!specialty || specialty === 'All') {
      return specialtyFilteredProviders.slice(0, DEFAULT_VISIBLE_COUNT);
    }
    return specialtyFilteredProviders;
  }, [specialtyFilteredProviders, selectedSpecialty]);

  const handleNext = () => {
    if (!selectedProvider) {
      alert('Please select a provider');
      return;
    }
    onNext({ ...currentData, provider: selectedProvider });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const renderProviderCard = (provider: Provider) => (
    <Paper
      key={provider.providerId}
      onClick={() => setSelectedProvider(provider)}
      sx={{
        p: 2,
        cursor: 'pointer',
        border: '2px solid',
        borderColor:
          selectedProvider?.providerId === provider.providerId
            ? 'primary.main'
            : '#e0e0e0',
        bgcolor:
          selectedProvider?.providerId === provider.providerId
            ? 'primary.lighter'
            : 'white',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 1
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              width: 48,
              height: 48
            }}
          >
            {getInitials(provider.providerFullName)}
          </Avatar>
          <Box>
            <Typography fontWeight="bold">
              {provider.providerFullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {provider.providerSpeciality}
            </Typography>
            {provider.nextAvailable && (
              <Typography variant="caption" color="text.secondary">
                Next: {provider.nextAvailable}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {provider.badges?.map((badge) => (
            <Chip key={badge} label={badge} size="small" variant="outlined" />
          ))}
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
        Please select a provider for {currentData?.reasonForVisit?.appReason}
      </Typography>

      {/* Error Alert */}
      {providersError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {providersError}
        </Alert>
      )}

      {selectedProvider ? (
        /* Selected Provider Summary */
        <Box sx={{ mb: 3 }}>
          {renderProviderCard(selectedProvider)}
          <Button
            size="small"
            onClick={() => setSelectedProvider(null)}
            sx={{ mt: 1 }}
          >
            Change Provider
          </Button>
        </Box>
      ) : (
        <>
          {/* Search / Dropdown */}
          <Autocomplete<Provider, false, false, false>
            options={providers || []}
            value={selectedProvider}
            onChange={(e, newValue) => setSelectedProvider(newValue)}
            getOptionLabel={(option: Provider) => option.providerFullName}
            isOptionEqualToValue={(option, value) =>
              option.providerId === value.providerId
            }
            loading={providersLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search provider..."
                label="Search Provider"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {providersLoading ? (
                        <CircularProgress color="inherit" size={18} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
            renderOption={(props, option: Provider) => (
              <Box component="li" {...props} key={option.providerId}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 32,
                    height: 32,
                    fontSize: 14,
                    mr: 1.5
                  }}
                >
                  {getInitials(option.providerFullName)}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {option.providerFullName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.providerSpeciality}
                  </Typography>
                </Box>
              </Box>
            )}
            sx={{ mb: 3 }}
          />

          {/* Specialty Tabs */}
          <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={selectedSpecialty}
              onChange={(e, newValue) => setSelectedSpecialty(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {SPECIALTIES.map((specialty) => (
                <Tab key={specialty} label={specialty} />
              ))}
            </Tabs>
          </Box>

          {/* Loading State */}
          {providersLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={40} />
            </Box>
          )}

          {/* Provider Cards */}
          {!providersLoading && (
            <Stack spacing={2}>
              {visibleProviders.length > 0 ? (
                visibleProviders.map(renderProviderCard)
              ) : (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: 'center', py: 4 }}
                >
                  No providers available for this specialty
                </Typography>
              )}
            </Stack>
          )}
        </>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          sx={{ ml: 'auto' }}
          disabled={!selectedProvider}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

export default Step3SelectProvider;
