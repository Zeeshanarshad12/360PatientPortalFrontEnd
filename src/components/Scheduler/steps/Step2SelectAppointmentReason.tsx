import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Pagination,
  TextField,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useDispatch, useSelector } from '@/store/index';
import {
  Searchappointmentreason,
  GetAllAppointmentType
} from '@/slices/ScheduleSlice';
import { AppointmentData, AppointmentTypeOption } from '../types';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';
import StepLayout from './StepLayout';
import StepSectionHeader from './StepSectionHeader';
import { useFitPageSize } from './useFitPageSize';

interface Step2Props {
  onNext: (data: AppointmentData) => void;
  onBack: () => void;
  currentData?: AppointmentData;
  stepNumber?: number;
  stepLabel?: string;
}

const normalizeText = (value?: string) =>
  (value || '').trim().replace(/\s+/g, ' ').toLowerCase();

const Step2SelectAppointmentReason: React.FC<Step2Props> = ({
  onNext,
  onBack,
  currentData,
  stepNumber,
  stepLabel
}) => {
  const dispatch = useDispatch();
  const { practiceId } = useCurrentPatient();
  const [selectedReason, setSelectedReason] = useState<any>(
    currentData?.reasonForVisit || null
  );
  const [selectedAppointmentType, setSelectedAppointmentType] =
    useState<AppointmentTypeOption | null>(currentData?.appointmentType || null);
  const [reasonSearchTerm, setReasonSearchTerm] = useState('');
  // Bug 432487: patients must be able to type a reason that isn't in the
  // predefined list; id: 0 marks it as custom (same sentinel Step5 uses
  // for "not a real backend id" elsewhere).
  const [customReasonText, setCustomReasonText] = useState('');
  const [appointmentTypeSearchTerm, setAppointmentTypeSearchTerm] =
    useState('');
  const [typePage, setTypePage] = useState(1);

  const {
    appointmentReasons,
    appointmentReasonsLoading,
    appointmentReasonsError,
    appointmentTypes,
    appointmentTypesLoading,
    appointmentTypesError
  } = useSelector((state: any) => state.schedule);

  useEffect(() => {
    dispatch(
      Searchappointmentreason({
        searchTerm: '',
        practiceId,
        patientOnly: true
      }) as any
    );
  }, [practiceId, dispatch]);

  useEffect(() => {
    dispatch(GetAllAppointmentType({ PracticeId: practiceId }) as any);
  }, [practiceId, dispatch]);

  // Reschedule flow only knows the appointment type's display text up front
  // (see UpcomingAppointments.tsx), not its id/duration. Once the real list
  // loads, swap the text-only placeholder for the matching full record so
  // the correct card highlights and Step4's duration math has slotDuration.
  useEffect(() => {
    if (!selectedAppointmentType || !appointmentTypes?.length) return;
    if (selectedAppointmentType.id) return;
    const targetText = normalizeText(selectedAppointmentType.text);
    const match = appointmentTypes.find(
      (type: AppointmentTypeOption) => normalizeText(type.text) === targetText
    );
    if (match) {
      setSelectedAppointmentType(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentTypes]);

  // TPM feedback: inactive reasons must not be shown to the patient.
  const reasons = useMemo(
    () =>
      (appointmentReasons || []).filter(
        (reason: any) => reason.isActive !== false
      ),
    [appointmentReasons]
  );

  // Filters the reason chips below in place.
  const filteredReasons = useMemo(() => {
    const term = reasonSearchTerm.trim().toLowerCase();
    if (!term) return reasons;
    return reasons.filter((reason: any) =>
      (reason.appReason || '').toLowerCase().includes(term)
    );
  }, [reasons, reasonSearchTerm]);

  const filteredAppointmentTypes = useMemo(() => {
    const term = appointmentTypeSearchTerm.trim().toLowerCase();
    if (!term) return appointmentTypes || [];
    return (appointmentTypes || []).filter((type: AppointmentTypeOption) =>
      (type.text || '').toLowerCase().includes(term)
    );
  }, [appointmentTypes, appointmentTypeSearchTerm]);

  const theme = useTheme();
  const typeColumns = useMediaQuery(theme.breakpoints.up('sm')) ? 2 : 1;
  const { containerRef: typeListRef, pageSize: typePageSize } = useFitPageSize(
    typeColumns,
    filteredAppointmentTypes.length
  );

  const typePageCount = Math.max(
    1,
    Math.ceil(filteredAppointmentTypes.length / typePageSize)
  );

  useEffect(() => {
    setTypePage(1);
  }, [appointmentTypeSearchTerm]);

  // Page size follows the available height, so keep the page in range
  // when the window/modal is resized.
  useEffect(() => {
    if (typePage > typePageCount) setTypePage(typePageCount);
  }, [typePage, typePageCount]);

  const visibleAppointmentTypes = useMemo(() => {
    const start = (typePage - 1) * typePageSize;
    return filteredAppointmentTypes.slice(start, start + typePageSize);
  }, [filteredAppointmentTypes, typePage, typePageSize]);

  const isReasonSelected = (reason: any) =>
    selectedReason?.id === reason.id ||
    (!!selectedReason?.appReason &&
      selectedReason.appReason === reason.appReason);

  const isTypeSelected = (type: AppointmentTypeOption) =>
    selectedAppointmentType?.id === type.id ||
    (!selectedAppointmentType?.id &&
      normalizeText(selectedAppointmentType?.text) === normalizeText(type.text));

  const handleNext = () => {
    if (!selectedReason) {
      alert('Please select a reason for visit');
      return;
    }
    if (!selectedAppointmentType) {
      alert('Please select an appointment type');
      return;
    }
    onNext({
      ...currentData,
      reasonForVisit: selectedReason,
      appointmentType: selectedAppointmentType
    });
  };

  return (
    <StepLayout
      stepNumber={stepNumber}
      stepLabel={stepLabel}
      scrollContent={false}
      footer={
        <>
          <Button variant="outlined" onClick={onBack}>
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ ml: 'auto' }}
            disabled={!selectedReason || !selectedAppointmentType}
          >
            Continue
          </Button>
        </>
      }
    >
      {/* Reason for visit: header stays fixed, chips scroll on their own. */}
      <Box sx={{ flexShrink: 0 }}>
        <StepSectionHeader
          title="Select Reason for Visit"
          variant="subtitle1"
          searchValue={reasonSearchTerm}
          onSearchChange={setReasonSearchTerm}
          searchPlaceholder="Search Reason for Visit"
          showSearch={!appointmentReasonsLoading && reasons.length > 0}
        />

        {appointmentReasonsError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {appointmentReasonsError}
          </Alert>
        )}

        {appointmentReasonsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignContent: 'flex-start',
              gap: 0.5,
              mt: 0.75,
              maxHeight: 64,
              overflowY: 'auto',
              pr: 0.5
            }}
          >
            {selectedReason?.id === 0 && selectedReason?.appReason && (
              <Chip
                size="small"
                label={`Custom: ${selectedReason.appReason}`}
                color="primary"
                variant="filled"
                onDelete={() => setSelectedReason(null)}
              />
            )}
            {filteredReasons.map((reason: any) => (
              <Chip
                key={reason.id}
                size="small"
                label={reason.appReason}
                onClick={() => setSelectedReason(reason)}
                color={isReasonSelected(reason) ? 'primary' : 'default'}
                variant={isReasonSelected(reason) ? 'filled' : 'outlined'}
              />
            ))}
            {reasons.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No appointment reasons available.
              </Typography>
            )}
            {reasons.length > 0 && filteredReasons.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No reasons found.
              </Typography>
            )}
          </Box>
        )}

        {/* Bug 432487: always available, not just on a failed search -
            the patient can describe their own reason when nothing in the
            list fits. */}
        {!appointmentReasonsLoading && (
          <Box sx={{ display: 'flex', gap: 1, mt: 0.75, alignItems: 'flex-start' }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Can't find your reason? Type it here"
              sx={{ '& .MuiInputBase-input': { py: 0.75 } }}
              value={customReasonText}
              onChange={(e) => setCustomReasonText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customReasonText.trim()) {
                  setSelectedReason({
                    id: 0,
                    appReason: customReasonText.trim(),
                    isActive: true,
                    totalCount: 0
                  });
                  setCustomReasonText('');
                }
              }}
            />
            <Button
              size="small"
              variant="outlined"
              disabled={!customReasonText.trim()}
              sx={{ flexShrink: 0 }}
              onClick={() => {
                setSelectedReason({
                  id: 0,
                  appReason: customReasonText.trim(),
                  isActive: true,
                  totalCount: 0
                });
                setCustomReasonText('');
              }}
            >
              Use This
            </Button>
          </Box>
        )}
      </Box>

      {/* Appointment type: header fixed, list paginated and scrollable. */}
      <Box sx={{ flexShrink: 0, mt: 1 }}>
        <StepSectionHeader
          title="Select Appointment Type"
          variant="subtitle1"
          searchValue={appointmentTypeSearchTerm}
          onSearchChange={setAppointmentTypeSearchTerm}
          searchPlaceholder="Search Appointment Type"
          showSearch={
            !appointmentTypesLoading && (appointmentTypes || []).length > 0
          }
        />
        {appointmentTypesError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {appointmentTypesError}
          </Alert>
        )}
      </Box>

      {/* Takes all remaining height; the page size is derived from it
          (useFitPageSize) so the list fills the space and pagination sits
          right above the footer on any screen height. */}
      <Box
        ref={typeListRef}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          mt: 0.75,
          pr: 0.5
        }}
      >
        {appointmentTypesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (appointmentTypes || []).length === 0 ? (
          <Alert severity="info">No appointment types available.</Alert>
        ) : filteredAppointmentTypes.length === 0 ? (
          <Typography
            color="text.secondary"
            sx={{ textAlign: 'center', py: 2 }}
          >
            No results found.
          </Typography>
        ) : (
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
            {visibleAppointmentTypes.map((type: AppointmentTypeOption) => {
              const selected = isTypeSelected(type);
              const label = type.slotDuration
                ? `${type.text} (${type.slotDuration} min)`
                : type.text;
              return (
                <Paper
                  key={type.id ?? type.text}
                  data-fit-item
                  title={label}
                  onClick={() =>
                    !type.disableType && setSelectedAppointmentType(type)
                  }
                  sx={{
                    py: 0.75,
                    px: 1.5,
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: type.disableType ? 'not-allowed' : 'pointer',
                    opacity: type.disableType ? 0.5 : 1,
                    border: '2px solid',
                    borderColor: selected ? 'primary.main' : '#e0e0e0',
                    bgcolor: selected ? 'primary.lighter' : 'white',
                    transition: 'all 0.2s',
                    '&:hover': type.disableType
                      ? undefined
                      : { borderColor: 'primary.main', boxShadow: 1 }
                  }}
                >
                  <Typography fontWeight="bold" variant="body2" noWrap>
                    {label}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>

      {typePageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.75, flexShrink: 0 }}>
          <Pagination
            count={typePageCount}
            page={typePage}
            onChange={(_e, value) => setTypePage(value)}
            size="small"
            color="primary"
          />
        </Box>
      )}
    </StepLayout>
  );
};

export default Step2SelectAppointmentReason;
