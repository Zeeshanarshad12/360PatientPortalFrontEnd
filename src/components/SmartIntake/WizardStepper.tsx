import { Box, LinearProgress, Step, StepButton, Stepper } from '@mui/material';

/** The portal's own MUI Stepper (as in the appointment scheduler) plus a thin progress bar;
 * any step can be revisited. */
export function WizardStepper({
  labels,
  current,
  completed,
  onSelect
}: {
  labels: string[];
  current: number;
  completed: boolean[];
  onSelect: (i: number) => void;
}) {
  return (
    <Box sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
      <LinearProgress variant="determinate" value={((current + 1) / labels.length) * 100} sx={{ height: 3 }} />
      <Box sx={{ overflowX: 'auto', py: 2, px: 1 }}>
        <Stepper nonLinear activeStep={current} alternativeLabel sx={{ minWidth: labels.length * 96 }}>
          {labels.map((label, i) => (
            <Step key={`${label}-${i}`} completed={completed[i]}>
              <StepButton color="inherit" onClick={() => onSelect(i)}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Box>
    </Box>
  );
}
