import { useEffect, useRef, useState } from 'react';
import { Box, Popover, Tooltip, Typography, useTheme } from '@mui/material';
import Image from 'next/image';
import { useSelector } from '@/store/index';
import { Icons } from '@/icons/themeicons';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PatientRecord {
  patientID: number;
  firstName?: string;
  lastName?: string;
  practiceId?: string | number;
  practiceName?: string;
  vdtAccess?: string;
  pendingConsentFormCount?: number;
  isDefault?: boolean;
  [key: string]: any;
}

interface PracticeGroup {
  practiceId: string | number;
  practiceName: string;
  patients: PatientRecord[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getLocalItem = (key: string): string =>
  typeof window !== 'undefined' ? (localStorage.getItem(key) ?? '') : '';

const getPracticeId = (patient: PatientRecord): string | number =>
  patient?.practiceId ?? 'unknown';

const getPracticeName = (patient: PatientRecord): string =>
  patient?.practiceName ?? 'Unknown Practice';

const normalisePatientList = (raw: unknown): PatientRecord[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.result)) return obj.result as PatientRecord[];
    if (Array.isArray(obj.data)) return obj.data as PatientRecord[];
    return Object.values(obj) as PatientRecord[];
  }
  return [];
};

const groupByPractice = (patients: PatientRecord[]): PracticeGroup[] => {
  const map: Record<string, PracticeGroup> = {};
  for (const patient of patients) {
    const practiceId = getPracticeId(patient);
    const practiceName = getPracticeName(patient);
    const key = practiceId !== 'unknown' ? String(practiceId) : practiceName;
    if (!map[key]) map[key] = { practiceId, practiceName, patients: [] };
    map[key].patients.push(patient);
  }
  return Object.values(map);
};

// Reads current patient display values from localStorage into a plain object.
// Called once on mount and again after every practice switch.
const readFallbackFromStorage = () => ({
  patientName: `${getLocalItem('FirstName')} ${getLocalItem('LastName')}`.trim(),
  practiceName: getLocalItem('PracticeName'),
});

// ─── Component ────────────────────────────────────────────────────────────────

function PracticeBox() {
  const theme = useTheme();
  const anchorRef = useRef<HTMLDivElement | null>(null);

  // ALL useState/useRef/useSelector hooks declared at the very top
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [popoverWidth, setPopoverWidth] = useState<number>(220);

  // Initialised from localStorage via lazy initialiser function (SSR-safe)
  const [currentPatientId, setCurrentPatientId] = useState<string>(
    () => getLocalItem('patientID'),
  );
  const [currentPracticeId, setCurrentPracticeId] = useState<string>(
    () => getLocalItem('PracticeId'),
  );

  // Fallback display values stored in state — NOT read inline from localStorage.
  // This prevents showing stale data: values are seeded on mount from localStorage
  // (which is guaranteed correct by the isSessionReady gate in Dashboard),
  // then updated explicitly on every practice switch.
  const [displayFallback, setDisplayFallback] = useState(readFallbackFromStorage);

  const { PatientByEmailData } = useSelector((state) => state.patientprofileslice);

  // ALL useEffect hooks declared before any derived logic
  useEffect(() => {
    const sync = () => {
      setCurrentPatientId(getLocalItem('patientID'));
      setCurrentPracticeId(getLocalItem('PracticeId'));
      // Keep fallback in sync so header always shows correct name instantly
      setDisplayFallback(readFallbackFromStorage());
    };
    window.addEventListener('practiceChanged', sync);
    return () => window.removeEventListener('practiceChanged', sync);
  }, []);

  // ─── Derived values (computed after all hooks) ────────────────────────────

  const patientList = normalisePatientList(PatientByEmailData);
  const practicesArray = groupByPractice(patientList);

  // Prefer a live Redux match for the selected patient
  const selectedPatient = patientList.find(
    (p) => p.patientID != null && String(p.patientID) === currentPatientId,
  );

  // Use live Redux data when available; fall back to state (not raw localStorage)
  const displayPracticeName = selectedPatient
    ? getPracticeName(selectedPatient)
    : displayFallback.practiceName;

  const displayPatientName = selectedPatient
    ? `${selectedPatient.firstName ?? ''} ${selectedPatient.lastName ?? ''}`.trim()
    : displayFallback.patientName;

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleOpen = (): void => {
    if (anchorRef.current) {
      setPopoverWidth(anchorRef.current.getBoundingClientRect().width);
    }
    setIsOpen(true);
  };

  const handleClose = (): void => setIsOpen(false);

  const handlePracticeSelect = (practice: PracticeGroup): void => {
    const patient =
      practice.patients.find((p) => p.isDefault) ?? practice.patients[0];
    if (!patient) return;

    const patientId = String(patient.patientID);
    const practiceId = String(getPracticeId(patient));
    const practiceName = getPracticeName(patient);
    const firstName = patient.firstName ?? '';
    const lastName = patient.lastName ?? '';

    localStorage.setItem('patientID', patientId);
    localStorage.setItem('PracticeId', practiceId);
    localStorage.setItem('PracticeName', practiceName);
    localStorage.setItem('FirstName', firstName);
    localStorage.setItem('LastName', lastName);
    localStorage.setItem('vdtAccess', String(patient.vdtAccess ?? ''));
    localStorage.setItem('pendingConsentFormCount', String(patient.pendingConsentFormCount ?? ''));

    setCurrentPatientId(patientId);
    setCurrentPracticeId(practiceId);
    // Update fallback immediately so header reflects new selection
    // before Redux has a chance to re-render with updated data
    setDisplayFallback({ patientName: `${firstName} ${lastName}`.trim(), practiceName });

    setIsOpen(false);
    window.dispatchEvent(new Event('practiceChanged'));
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Trigger box */}
      <Box
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          p: 0,
          minWidth: '220px',
          maxWidth: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'start',
          gap: 1,
          bgcolor: 'white',
          borderRadius: '4px',
          border: '1px solid #d3d9e3',
          height: '40px',
          cursor: 'pointer',
          ':hover': { border: `1px solid ${theme.colors.primary.main}` },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '40px' }}>
          <Image src={Icons.pafill} alt="practice icon" width={20} height={20} />
        </Box>

        <Box sx={{ overflow: 'hidden', flex: 1, pr: 1 }}>
          {/* Patient name */}
          <Typography
            title={displayPatientName}
            sx={{
              fontSize: '13px',
              lineHeight: 1.3,
              color: 'black',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {displayPatientName}
          </Typography>

          {/* Practice name */}
          <Tooltip
            title={displayPracticeName}
            arrow
            placement="bottom-start"
            PopperProps={{
              modifiers: [{ name: 'preventOverflow', options: { boundary: 'viewport' } }],
            }}
            componentsProps={{
              tooltip: { sx: { maxWidth: '200px', fontSize: '11px', wordBreak: 'break-word' } },
            }}
          >
            <Typography
              color="primary"
              sx={{
                fontSize: '12px',
                fontWeight: 600,
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block',
              }}
            >
              {displayPracticeName}
            </Typography>
          </Tooltip>
        </Box>
      </Box>

      {/* Dropdown */}
      <Popover
        disableScrollLock
        open={isOpen}
        anchorEl={anchorRef.current}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          mt: 0.3,
          '.MuiPopover-paper': {
            border: `1px solid ${theme.colors.primary.main}`,
            width: `${popoverWidth}px`,
            p: 0.5,
            borderRadius: '6px',
            boxShadow: '0px 4px 16px rgba(0,0,0,0.12)',
          },
        }}
      >
        <Box
          sx={{
            maxHeight: '40vh',
            minHeight: '60px',
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#d3d9e3', borderRadius: '4px' },
          }}
        >
          {practicesArray.length === 0 ? (
            <Typography sx={{ p: 1, fontSize: '12px', color: 'text.secondary' }}>
              {PatientByEmailData === null ? 'Loading practices...' : 'No practices available'}
            </Typography>
          ) : (
            practicesArray.map((practice, index) => {
              const isSelected = String(practice.practiceId) === currentPracticeId;
              const representativePatient =
                practice.patients.find((p) => p.isDefault) ?? practice.patients[0];

              return (
                <Box
                  key={practice.practiceId ?? index}
                  onClick={() => handlePracticeSelect(practice)}
                  sx={{
                    p: 1,
                    pl: 1.5,
                    mt: index > 0 ? 0.3 : 0,
                    borderBottom: '1px solid #f0f2f5',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: isSelected ? '#E3F2FD' : 'transparent',
                    '&:hover': { bgcolor: isSelected ? '#BBDEFB' : '#EBF3FF' },
                  }}
                >
                  <Image src={Icons.hospital} alt="hospital" width={16} height={16} />

                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Tooltip
                      title={practice.practiceName}
                      arrow
                      placement="bottom-start"
                      PopperProps={{
                        modifiers: [{ name: 'preventOverflow', options: { boundary: 'viewport' } }],
                      }}
                      componentsProps={{
                        tooltip: { sx: { maxWidth: '200px', fontSize: '11px', wordBreak: 'break-word' } },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '13px',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? 'primary.main' : 'text.primary',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {practice.practiceName}
                      </Typography>
                    </Tooltip>

                    {representativePatient && (
                      <Typography
                        sx={{
                          fontSize: '11px',
                          color: 'text.secondary',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {representativePatient.firstName} {representativePatient.lastName}
                      </Typography>
                    )}
                  </Box>

                  {isSelected && (
                    <Typography sx={{ fontSize: '14px', color: 'primary.main', fontWeight: 700 }}>
                      ✓
                    </Typography>
                  )}
                </Box>
              );
            })
          )}
        </Box>
      </Popover>
    </>
  );
}

export default PracticeBox;
