import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import type { SectionStep, SectionSubmission, WizardStep } from './types';
import { WizardStepper } from './WizardStepper';
import { FormStep } from './FormStep';
import {
  ChecklistStep,
  FamilyHistoryStep,
  SocialHistoryStep
} from './ChecklistSteps';
import { MedicationStep } from './MedicationStep';
import { ConsentStep } from './ConsentStep';
import { validateFields } from './fieldRules';

function sameValues(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

const initialValues = (steps: WizardStep[]): Record<number, string[]> =>
  Object.fromEntries(
    steps.map((s, i) => [
      i,
      s.kind === 'form'
        ? s.fields.map((f) => f.value)
        : s.kind === 'consent'
        ? []
        : [...s.baseline]
    ])
  );

/**
 * One step at a time; Save & Next saves the step. A checklist-type step left exactly as it was
 * on the chart is sent as "still accurate" (attest) instead of a new submission. A failed save
 * keeps the patient on the step with their answers intact — `onSubmitSection` tells them why.
 * Consent steps save themselves when signed (the portal's consent signing); Next waits for it.
 */
export function WizardBody({
  steps,
  onSubmitSection
}: {
  steps: WizardStep[];
  onSubmitSection: (
    step: SectionStep,
    submission: SectionSubmission
  ) => Promise<void>;
}) {
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>(() =>
    steps.map(() => false)
  );
  const [values, setValues] = useState<Record<number, string[]>>(() =>
    initialValues(steps)
  );
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const [signed, setSigned] = useState<Record<number, boolean>>({});
  // Steps the patient tried to save with errors: every error on them shows, not just touched ones.
  const [triedSave, setTriedSave] = useState<Record<number, boolean>>({});
  // Sections the patient chose to skip for now (nothing saved for them) - listed on the finish screen.
  const [skipped, setSkipped] = useState<Record<number, boolean>>({});

  const skippedLabels = steps
    .filter((_, i) => skipped[i] && !completed[i])
    .map((s) => s.label);

  if (finished) {
    return (
      <Box sx={{ py: 8, px: 3, textAlign: 'center' }}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 56, mb: 1 }} />
        <Typography
          variant="h4"
          component="h2"
          sx={{ mb: 1, fontSize: '1.25rem' }}
        >
          All done — thank you
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your forms have been submitted. Anything that needs staff review will
          be added to your chart after they take a look.
        </Typography>
        {skippedLabels.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            You skipped: {skippedLabels.join(', ')}. Open this same link any
            time before your visit to finish{' '}
            {skippedLabels.length === 1 ? 'it' : 'them'}.
          </Typography>
        )}
      </Box>
    );
  }

  const step = steps[current];
  const isLast = current === steps.length - 1;
  const stepValues = values[current] ?? [];
  const setStepValues = (next: string[]) =>
    setValues((prev) => ({ ...prev, [current]: next }));
  const needsSignature = step.kind === 'consent' && !signed[current];
  const fieldErrors =
    step.kind === 'form'
      ? validateFields(step.code, step.fields, stepValues)
      : [];
  const hasErrors = fieldErrors.some(Boolean);

  async function goNext() {
    if (busy || needsSignature) return;
    if (hasErrors) {
      setTriedSave((prev) => ({ ...prev, [current]: true }));
      return;
    }
    setBusy(true);
    try {
      if (step.kind !== 'consent') {
        const submission: SectionSubmission =
          step.kind !== 'form' && sameValues(stepValues, step.baseline)
            ? { type: 'attest' }
            : { type: 'submit', values: stepValues };
        await onSubmitSection(step, submission);
      }
      setCompleted((c) => c.map((v, i) => (i === current ? true : v)));
      setSkipped((prev) => ({ ...prev, [current]: false }));
      if (isLast) setFinished(true);
      else setCurrent((c) => c + 1);
    } catch {
      // Stay on this step; the handler already showed the reason.
    } finally {
      setBusy(false);
    }
  }

  // Skip: move on without saving this section (the patient can come back via the same link).
  // Every intake section can be skipped; consent forms still need a signature to continue.
  const canSkip = step.kind !== 'consent';
  function skip() {
    if (busy) return;
    setSkipped((prev) => ({ ...prev, [current]: true }));
    if (isLast) setFinished(true);
    else setCurrent((c) => c + 1);
  }

  return (
    <Box>
      <WizardStepper
        labels={steps.map((s) => s.label)}
        current={current}
        completed={completed}
        onSelect={setCurrent}
      />
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="overline" color="text.secondary">
          Step {current + 1} of {steps.length}
        </Typography>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {step.label}
        </Typography>

        {step.kind === 'form' && (
          <FormStep
            key={current}
            fields={step.fields}
            values={stepValues}
            errors={fieldErrors}
            showAllErrors={!!triedSave[current]}
            onChange={(changes) => {
              const at = current;
              setValues((prev) => ({
                ...prev,
                [at]: (prev[at] ?? []).map((x, idx) =>
                  idx in changes ? changes[idx] : x
                )
              }));
            }}
            searchPayers={step.searchPayers}
          />
        )}
        {step.kind === 'checklist' && (
          <ChecklistStep
            key={current}
            catalog={step.catalog}
            values={stepValues}
            onChange={setStepValues}
          />
        )}
        {step.kind === 'family-history' && (
          <FamilyHistoryStep
            key={current}
            relatives={step.relatives}
            conditions={step.conditions}
            values={stepValues}
            onChange={setStepValues}
          />
        )}
        {step.kind === 'social-history' && (
          <SocialHistoryStep
            key={current}
            groups={step.groups}
            values={stepValues}
            onChange={setStepValues}
          />
        )}
        {step.kind === 'medications' && (
          <MedicationStep
            key={current}
            values={stepValues}
            onChange={setStepValues}
            search={step.search}
          />
        )}
        {step.kind === 'consent' && (
          <ConsentStep
            key={current}
            consent={step.consent}
            patientId={step.patientId}
            prefill={step.prefill}
            documentTitle={step.documentTitle}
            sign={step.sign}
            loadContent={step.loadContent}
            onSignedChange={(isSigned) => {
              const at = current;
              setSigned((prev) => ({ ...prev, [at]: isSigned }));
            }}
          />
        )}
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
        <Button
          variant="outlined"
          disabled={current === 0 || busy}
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
        >
          Previous
        </Button>
        <Box sx={{ flex: 1 }} />
        {canSkip && (
          <Button
            variant="outlined"
            color="secondary"
            disabled={busy}
            onClick={skip}
            sx={{ mr: 1 }}
          >
            Skip for now
          </Button>
        )}
        <Button
          variant="contained"
          disabled={busy || needsSignature}
          onClick={goNext}
        >
          {busy
            ? 'Saving…'
            : needsSignature
            ? 'Sign to continue'
            : step.kind === 'consent'
            ? isLast
              ? 'Finish'
              : 'Next'
            : isLast
            ? 'Save & Finish'
            : 'Save & Next'}
        </Button>
      </Box>
    </Box>
  );
}
