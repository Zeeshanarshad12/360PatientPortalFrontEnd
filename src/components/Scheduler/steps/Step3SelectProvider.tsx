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
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Pagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useDispatch, useSelector } from '@/store/index';
import { GetProvidersbyPracticeID } from '@/slices/ScheduleSlice';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';
import { Provider, AppointmentData } from '../types';
import StepLayout from './StepLayout';

interface Step3Props {
  onNext: (data: AppointmentData) => void;
  onBack: () => void;
  currentData?: AppointmentData;
}

const PROVIDERS_PAGE_SIZE = 6;

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
  const [providerSearchTerm, setProviderSearchTerm] = useState('');
  const [page, setPage] = useState(1);

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

  const selectedFacilityId = currentData?.facility?.id;

  // TPM feedback: inactive providers must not be shown to the patient.
  // Also defensively exclude providers explicitly
  // flagged as ineligible for patient scheduling (e.g. Clinical
  // Support/training accounts) and providers explicitly tied to a
  // different location than the one the patient selected. locationId 0
  // means "no location assigned" in the API data, not an actual location,
  // so it's treated like null and doesn't trigger a mismatch. The taxonomy
  // over-restriction still needs a backend fix — this only filters on
  // fields the API already sends.
  const activeProviders: Provider[] = useMemo(() => {
    return (providers || []).filter((p: Provider) => {
      if (p.providerIsActive === false) return false;
      if (p.isSchedulingProvider === false) return false;
      if (
        selectedFacilityId != null &&
        p.locationId != null &&
        p.locationId !== 0 &&
        String(p.locationId) !== String(selectedFacilityId)
      ) {
        return false;
      }
      return true;
    });
  }, [providers, selectedFacilityId]);

  const providersWithLowerSpecialty = useMemo(() => {
    return activeProviders.map((p) => ({
      provider: p,
      specialtyLower: (p.providerSpecialty || '').trim().toLowerCase()
    }));
  }, [activeProviders]);

  // TPM feedback: specialty tabs must be practice-wise configurable. There's
  // no per-practice specialty API/settings anywhere in the system yet, so
  // instead of a hardcoded fixed list of specialties, derive the tabs from
  // whatever specialties this practice's own providers actually have.
  const specialties = useMemo(() => {
    const seen = new Map<string, string>();
    providersWithLowerSpecialty.forEach(({ provider, specialtyLower }) => {
      if (specialtyLower && !seen.has(specialtyLower)) {
        seen.set(specialtyLower, (provider.providerSpecialty || '').trim());
      }
    });
    const distinct = Array.from(seen.values()).sort((a, b) =>
      a.localeCompare(b)
    );
    return ['All', ...distinct];
  }, [providersWithLowerSpecialty]);

  useEffect(() => {
    if (selectedSpecialty >= specialties.length) {
      setSelectedSpecialty(0);
    }
  }, [specialties, selectedSpecialty]);

  // The provider search should filter the existing card list in
  // place instead of showing matches in a separate dropdown.
  const specialtyFilteredProviders = useMemo(() => {
    const specialty = specialties[selectedSpecialty];
    let list = providersWithLowerSpecialty;
    if (specialty && specialty !== 'All') {
      const specialtyLower = specialty.toLowerCase();
      list = list.filter((entry) => entry.specialtyLower === specialtyLower);
    }
    const term = providerSearchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter((entry) =>
        entry.provider.providerFullName.toLowerCase().includes(term)
      );
    }
    return list.map((entry) => entry.provider);
  }, [providersWithLowerSpecialty, specialties, selectedSpecialty, providerSearchTerm]);

  // Bug 432560: paginate the provider list (both the "All" tab and every
  // specialty tab) instead of showing an arbitrary top-5 slice or one long
  // unpaginated list.
  const pageCount = Math.max(
    1,
    Math.ceil(specialtyFilteredProviders.length / PROVIDERS_PAGE_SIZE)
  );

  useEffect(() => {
    setPage(1);
  }, [selectedSpecialty, providerSearchTerm]);

  const visibleProviders = useMemo(() => {
    const start = (page - 1) * PROVIDERS_PAGE_SIZE;
    return specialtyFilteredProviders.slice(start, start + PROVIDERS_PAGE_SIZE);
  }, [specialtyFilteredProviders, page]);

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
              {provider.providerSpecialty}
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
    <StepLayout
      footer={
        <>
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
        </>
      }
    >
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
          {/* Filters the provider cards below in place; no
              separate results dropdown. */}
          <TextField
            fullWidth
            label="Select Provider"
            placeholder="Search provider by name..."
            value={providerSearchTerm}
            onChange={(e) => setProviderSearchTerm(e.target.value)}
            disabled={providersLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: providersLoading ? (
                <CircularProgress color="inherit" size={18} />
              ) : undefined
            }}
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
              {specialties.map((specialty) => (
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
            <>
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
              {pageCount > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={pageCount}
                    page={page}
                    onChange={(_e, value) => setPage(value)}
                    size="small"
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}
    </StepLayout>
  );
};

export default Step3SelectProvider;
