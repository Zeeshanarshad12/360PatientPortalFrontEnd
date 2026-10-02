import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import type { SectionSubmission, WizardStep } from './types';
import { WizardStepper } from './WizardStepper';
import { FormStep } from './FormStep';
import { ChecklistStep, FamilyHistoryStep, SocialHistoryStep } from './ChecklistSteps';
import { MedicationStep } from './MedicationStep';

function sameValues(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

const initialValues = (steps: WizardStep[]): Record<number, string[]> =>
  Object.fromEntries(steps.map((s, i) => [i, s.kind === 'form' ? s.fields.map((f) => f.value) : [...s.baseline]]));

/**
 * One step at a time; Save & Next saves the step. A checklist-type step left exactly as it was
 * on the chart is sent as "still accurate" (attest) instead of a new submission. A failed save
 * keeps the patient on the step with their answers intact — `onSubmitSection` tells them why.
 */
export function WizardBody({ steps, onSubmitSection }: { steps: WizardStep[]; onSubmitSection: (step: WizardStep, submission: SectionSubmission) => Promise<void> }) {
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>(() => steps.map(() => false));
  const [values, setValues] = useState<Record<number, string[]>>(() => initialValues(steps));
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);

  if (finished) {
    return (
      <Box sx={{ py: 8, px: 3, textAlign: 'center' }}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 56, mb: 1 }} />
        <Typography variant="h3" sx={{ mb: 1 }}>
          All done — thank you
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your forms have been submitted. Anything that needs staff review will be added to your chart after they take a look.
        </Typography>
      </Box>
    );
  }

  const step = steps[current];
  const isLast = current === steps.length - 1;
  const stepValues = values[current] ?? [];
  const setStepValues = (next: string[]) => setValues((prev) => ({ ...prev, [current]: next }));

  async function goNext() {
    if (busy) return;
    setBusy(true);
    try {
      const submission: SectionSubmission = step.kind !== 'form' && sameValues(stepValues, step.baseline) ? { type: 'attest' } : { type: 'submit', values: stepValues };
      await onSubmitSection(step, submission);
      setCompleted((c) => c.map((v, i) => (i === current ? true : v)));
      if (isLast) setFinished(true);
      else setCurrent((c) => c + 1);
    } catch {
      // Stay on this step; the handler already showed the reason.
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box>
      <WizardStepper labels={steps.map((s) => s.label)} current={current} completed={completed} onSelect={setCurrent} />
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="overline" color="text.secondary">
          Section {current + 1} of {steps.length}
        </Typography>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {step.label}
        </Typography>

        {step.kind === 'form' && (
          <FormStep
            key={current}
            fields={step.fields}
            values={stepValues}
            onChange={(i, v) => setStepValues(stepValues.map((x, idx) => (idx === i ? v : x)))}
            searchPayers={step.searchPayers}
          />
        )}
        {step.kind === 'checklist' && <ChecklistStep key={current} catalog={step.catalog} values={stepValues} onChange={setStepValues} />}
        {step.kind === 'family-history' && (
          <FamilyHistoryStep key={current} relatives={step.relatives} conditions={step.conditions} values={stepValues} onChange={setStepValues} />
        )}
        {step.kind === 'social-history' && <SocialHistoryStep key={current} groups={step.groups} values={stepValues} onChange={setStepValues} />}
        {step.kind === 'medications' && <MedicationStep key={current} values={stepValues} onChange={setStepValues} search={step.search} />}
      </Box>

      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <Button variant="outlined" disabled={current === 0 || busy} onClick={() => setCurrent((c) => Math.max(0, c - 1))}>
          Previous
        </Button>
        <Button variant="contained" disabled={busy} onClick={goNext}>
          {busy ? 'Saving…' : isLast ? 'Save & Finish' : 'Save & Next'}
        </Button>
      </Box>
    </Box>
  );
}
