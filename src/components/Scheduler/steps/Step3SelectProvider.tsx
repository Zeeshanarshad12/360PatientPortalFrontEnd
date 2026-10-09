import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useDispatch, useSelector } from '@/store/index';
import {
  GetProvidersbyPracticeID,
  GetProviderTaxonomiesByPracticeId
} from '@/slices/ScheduleSlice';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';
import { Provider, AppointmentData } from '../types';
import StepLayout from './StepLayout';
import StepSectionHeader from './StepSectionHeader';
import ScrollableChipTabs from './ScrollableChipTabs';
import { useFitPageSize } from './useFitPageSize';

interface Step3Props {
  onNext: (data: AppointmentData) => void;
  onBack: () => void;
  currentData?: AppointmentData;
}

interface TaxonomyTab {
  label: string;
  code: string | null;
}

const normalize = (value?: string | null) =>
  (value || '').trim().replace(/\s+/g, ' ').toLowerCase();

// Accepts either a plain string or an object row from
// getprovidertaxonomiesbypracticeid. When the row only carries a code
// (e.g. "101YM0800X"), the description is resolved from the providers'
// own taxonomy -> taxonomyDescription pairs.
const mapToTaxonomyTab = (
  item: any,
  descriptionByCode: Map<string, string>
): TaxonomyTab => {
  const code =
    typeof item === 'string'
      ? item
      : item?.taxonomy ??
        item?.Taxonomy ??
        item?.taxonomyCode ??
        item?.TaxonomyCode ??
        item?.code ??
        null;
  const description =
    typeof item === 'string'
      ? null
      : item?.taxonomyDescription ??
        item?.TaxonomyDescription ??
        item?.description ??
        item?.Description ??
        item?.taxonomyName ??
        item?.displayName ??
        item?.name ??
        null;
  const codeStr = code ? String(code).trim() : null;
  const label =
    (description && stripTaxonomyCode(String(description), codeStr)) ||
    (codeStr && descriptionByCode.get(normalize(codeStr))) ||
    codeStr ||
    '';
  return { label, code: codeStr };
};

// The API sends descriptions as "101Y00000X - Counselor"; tabs show only
// the description text.
const TAXONOMY_CODE_PREFIX = /^\s*[0-9A-Z]{10}\s*[-–:]\s*/i;
const stripTaxonomyCode = (description: string, code: string | null) => {
  let text = description.trim();
  if (code && text.toLowerCase().startsWith(code.toLowerCase())) {
    text = text.slice(code.length).replace(/^\s*[-–:]\s*/, '');
  }
  return text.replace(TAXONOMY_CODE_PREFIX, '').trim();
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
  const [providerSearchTerm, setProviderSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const {
    providers,
    providersLoading,
    providersError,
    providerTaxonomies,
    providerTaxonomiesError
  } = useSelector((state: any) => state.schedule);

  const selectedFacilityId = currentData?.facility?.id;

  useEffect(() => {
    dispatch(GetProviderTaxonomiesByPracticeId({ practiceId }) as any);
  }, [practiceId, dispatch]);

  // TODO: remove once the taxonomy/provider data flow is verified on QA.
  useEffect(() => {
    console.log('[Step3] providerTaxonomies response:', providerTaxonomies);
  }, [providerTaxonomies]);

  useEffect(() => {
    console.log('[Step3] providers response:', providers);
  }, [providers]);

  useEffect(() => {
    dispatch(
      GetProvidersbyPracticeID({
        practiceId,
        locationId: selectedFacilityId
      }) as any
    );
  }, [practiceId, selectedFacilityId, dispatch]);

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
      // Commented out per backend dev request: GetProvidersbyPracticeID now
      // receives locationId, so scheduling-eligibility filtering may be
      // handled server-side. Not deleted - may be reinstated.
      //
      // Bug 432754 ("Cancelled Appointments" showing as a selectable
      // provider): tried reinstating this filter, but live API data shows
      // isSchedulingProvider: false on real, active providers too (e.g.
      // providerIsActive: true clinicians with a valid NPI/phone/license),
      // so it does not reliably distinguish real providers from junk
      // entries. Reverted - this needs a backend-side fix instead.
      // if (p.isSchedulingProvider === false) return false;
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

  // Tabs come from the practice's taxonomy list (getprovidertaxonomiesbypracticeid);
  // index 0 is always "All". Providers are grouped by their own
  // taxonomy code / taxonomyDescription from getprovidersbypracticeid.
  const taxonomyTabs: TaxonomyTab[] = useMemo(() => {
    const descriptionByCode = new Map<string, string>();
    (providers || []).forEach((p: Provider) => {
      const code = normalize(p.taxonomy);
      const description = (p.taxonomyDescription || '').trim();
      if (code && description && !descriptionByCode.has(code)) {
        descriptionByCode.set(code, description);
      }
    });
    const seen = new Map<string, TaxonomyTab>();
    (Array.isArray(providerTaxonomies) ? providerTaxonomies : []).forEach(
      (item: any) => {
        const tab = mapToTaxonomyTab(item, descriptionByCode);
        const key = normalize(tab.label);
        if (key && !seen.has(key)) seen.set(key, tab);
      }
    );
    const distinct = Array.from(seen.values()).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
    return [{ label: 'All', code: null }, ...distinct];
  }, [providerTaxonomies, providers]);

  useEffect(() => {
    if (selectedSpecialty >= taxonomyTabs.length) {
      setSelectedSpecialty(0);
    }
  }, [taxonomyTabs, selectedSpecialty]);

  // The provider search should filter the existing card list in
  // place instead of showing matches in a separate dropdown.
  const specialtyFilteredProviders = useMemo(() => {
    const tab = taxonomyTabs[selectedSpecialty];
    let list = activeProviders;
    if (tab && selectedSpecialty !== 0) {
      const tabLabel = normalize(tab.label);
      const tabCode = normalize(tab.code);
      list = list.filter(
        (p) =>
          (!!tabCode && normalize(p.taxonomy) === tabCode) ||
          normalize(p.taxonomyDescription) === tabLabel
      );
    }
    const term = providerSearchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter((p) =>
        (p.providerFullName || '').toLowerCase().includes(term)
      );
    }
    return list;
  }, [activeProviders, taxonomyTabs, selectedSpecialty, providerSearchTerm]);

  // Bug 432560: paginate the provider list (both the "All" tab and every
  // specialty tab) instead of showing an arbitrary top-5 slice or one long
  // unpaginated list.
  // Page size fills the available height (see useFitPageSize).
  const theme = useTheme();
  const providerColumns = useMediaQuery(theme.breakpoints.up('sm')) ? 2 : 1;
  const { containerRef: providerListRef, pageSize: providersPageSize } =
    useFitPageSize(providerColumns, specialtyFilteredProviders.length);

  const pageCount = Math.max(
    1,
    Math.ceil(specialtyFilteredProviders.length / providersPageSize)
  );

  useEffect(() => {
    setPage(1);
  }, [selectedSpecialty, providerSearchTerm]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const visibleProviders = useMemo(() => {
    const start = (page - 1) * providersPageSize;
    return specialtyFilteredProviders.slice(start, start + providersPageSize);
  }, [specialtyFilteredProviders, page, providersPageSize]);

  const handleNext = () => {
    if (!selectedProvider) {
      alert('Please select a provider');
      return;
    }
    onNext({ ...currentData, provider: selectedProvider });
  };

  const renderProviderCard = (provider: Provider) => (
    <Paper
      key={provider.providerId}
      data-fit-item
      title={
        provider.taxonomyDescription
          ? `${provider.providerFullName} (${provider.taxonomyDescription})`
          : provider.providerFullName
      }
      onClick={() => setSelectedProvider(provider)}
      sx={{
        py: 0.75,
        px: 1.5,
        minWidth: 0,
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
          gap: 1
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight="bold" variant="body2" noWrap>
            {provider.providerFullName}
            {provider.taxonomyDescription && (
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 'normal', ml: 0.75 }}
              >
                ({provider.taxonomyDescription})
              </Typography>
            )}
          </Typography>
          {provider.nextAvailable && (
            <Typography variant="caption" color="text.secondary">
              Next: {provider.nextAvailable}
            </Typography>
          )}
        </Box>

        {!!provider.badges?.length && (
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            {provider.badges.map((badge) => (
              <Chip key={badge} label={badge} size="small" variant="outlined" />
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );

  return (
    <StepLayout
      scrollContent={false}
      header={
        <StepSectionHeader
          title={`Select a Provider for ${
            currentData?.appointmentType?.text ||
            currentData?.reasonForVisit?.appReason ||
            ''
          }`.trim()}
          searchValue={providerSearchTerm}
          onSearchChange={setProviderSearchTerm}
          searchPlaceholder="Search Provider"
          searchDisabled={providersLoading}
          showSearch={!selectedProvider}
        />
      }
      subHeader={
        !selectedProvider && taxonomyTabs.length > 1 ? (
          <ScrollableChipTabs
            ariaLabel="Provider taxonomy"
            items={taxonomyTabs.map((tab) => ({
              key: tab.code || tab.label,
              label: tab.label
            }))}
            value={selectedSpecialty}
            onChange={setSelectedSpecialty}
          />
        ) : undefined
      }
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
      {/* Error Alert */}
      {providersError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {providersError}
        </Alert>
      )}
      {providerTaxonomiesError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {providerTaxonomiesError}
        </Alert>
      )}

      {selectedProvider ? (
        /* Selected Provider Summary */
        <Box sx={{ mb: 3, maxWidth: { md: '50%' }, overflowY: 'auto' }}>
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
          {/* Takes all remaining height; page size is derived from it so
              the list fills the space and pagination sits above the footer. */}
          <Box
            ref={providerListRef}
            sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}
          >
            {providersLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={40} />
              </Box>
            ) : visibleProviders.length > 0 ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'minmax(0, 1fr)',
                    sm: 'repeat(2, minmax(0, 1fr))'
                  },
                  gap: 0.75
                }}
              >
                {visibleProviders.map(renderProviderCard)}
              </Box>
            ) : (
              <Typography
                color="text.secondary"
                sx={{ textAlign: 'center', py: 4 }}
              >
                No providers available for this specialty
              </Typography>
            )}
          </Box>
          {!providersLoading && pageCount > 1 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                pt: 0.75,
                flexShrink: 0
              }}
            >
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
    </StepLayout>
  );
};

export default Step3SelectProvider;
