import { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Box, Card, CircularProgress, Divider, Typography } from '@mui/material';
import SnackbarUtils from '@/content/snackbar';
import { intakeApi, IntakeApiError } from './api';
import { buildSteps, type IntakeSearches } from './buildSteps';
import type { IntakeDrug, IntakeForm, IntakePayer, IntakeValue, SectionSubmission, WizardStep } from './types';
import { WizardBody } from './WizardBody';

/** The page frame — the same white card + heading as the portal's Profile page. The portal
 * layout is a fixed 100vh frame with overflow hidden, so (like the Documents / Consent Forms
 * pages) this page scrolls itself: the viewport minus the theme's header height. */
function PageCard({ subtitle, children }: { subtitle?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        // Tight to the header and sidebar, like the portal's other pages (the layout already
        // adds a 5px left margin).
        pt: 0.5,
        pl: 0.5,
        pr: 1,
        pb: 1,
        width: '100%',
        flex: 1,
        height: (theme) => `calc(100vh - ${(theme as unknown as { header?: { height?: string } }).header?.height ?? '75px'})`,
        overflowY: 'auto'
      }}
    >
      <Card>
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 3, pb: 2 }}>
          <Typography variant="h3">Visit Intake</Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Divider />
        {children}
      </Card>
    </Box>
  );
}

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <PageCard>
      <Box sx={{ maxWidth: 640, mx: 'auto', px: 3, py: 8, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {children}
        </Typography>
      </Box>
    </PageCard>
  );
}

/**
 * The practice's intake form for one visit, opened from the link the practice sent. The
 * patient is already signed in (the page is behind ProtectedRoute); the backend only returns
 * the form when the link is live and belongs to this portal account (the patient, or an
 * authorized user of theirs). Each finished step is saved to the practice straight away —
 * sections the practice reviews wait for staff, the rest go on the chart immediately.
 */
export function IntakeWizard({ token }: { token: string }) {
  const [form, setForm] = useState<IntakeForm | null>(null);
  const [error, setError] = useState<IntakeApiError | null>(null);

  useEffect(() => {
    let cancelled = false;
    setForm(null);
    setError(null);
    intakeApi
      .getForm(token)
      .then((f) => !cancelled && setForm(f))
      .catch((e: IntakeApiError) => !cancelled && setError(e));
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Every drug/payer a search returned, by display label — the steps only deal in text, so this
  // is how a submitted answer is matched back to the record picked (the backend re-verifies).
  const pickedDrugs = useRef(new Map<string, IntakeDrug>());
  const pickedPayers = useRef(new Map<string, IntakePayer>());
  const searches = useMemo<IntakeSearches>(
    () => ({
      async drugs(query) {
        const drugs = await intakeApi.searchDrugs(token, query);
        drugs.forEach((d) => pickedDrugs.current.set(d.description.toLowerCase(), d));
        return drugs.map((d) => d.description);
      },
      async payers(query) {
        const payers = await intakeApi.searchPayers(token, query);
        payers.forEach((p) => pickedPayers.current.set(p.name.toLowerCase(), p));
        return [...new Set(payers.map((p) => p.name))];
      }
    }),
    [token]
  );
  const steps = useMemo(() => (form ? buildSteps(form, searches) : []), [form, searches]);

  if (error) {
    return error.status === 404 ? (
      <Message title="This form isn't available">
        The link may have expired, been replaced by a newer one, or been sent to a different account. Please contact your practice for a new link.
      </Message>
    ) : (
      <Message title="Something went wrong">{error.message}</Message>
    );
  }
  if (!form) {
    return (
      <PageCard>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      </PageCard>
    );
  }
  if (!steps.length) return <Message title="Nothing needed right now">There&apos;s nothing for you to fill in for this visit.</Message>;

  const start = form.appointment.start ? new Date(form.appointment.start) : null;

  /** Form fields keep their label ("Label: value") and drop blanks; a payer answer carries the
   * picked plan; a medication carries the picked drug (matched on the drug part of
   * "Drug — how you take it" — one kept from the chart has no pick and is matched server-side). */
  function toValues(step: WizardStep, values: string[]): (string | IntakeValue)[] {
    if (step.kind === 'form') {
      return values.flatMap((raw, i) => {
        const value = raw.trim();
        const field = step.fields[i];
        if (!value || !field) return [];
        const text = `${field.label}: ${value}`;
        const payer = field.type === 'payer' ? pickedPayers.current.get(value.toLowerCase()) : undefined;
        return [payer ? { text, sourceId: payer.insurancePlanId, payerId: payer.payerId } : text];
      });
    }
    if (step.kind === 'medications') {
      return values.map((text) => {
        const drug = pickedDrugs.current.get(text.split(' — ')[0].trim().toLowerCase());
        return drug ? { text, medication: drug } : text;
      });
    }
    return values;
  }

  async function submit(step: WizardStep, submission: SectionSubmission) {
    try {
      await intakeApi.submitSection(token, step.code, submission.type === 'attest' ? { attest: true } : { values: toValues(step, submission.values) });
    } catch (err) {
      const e = err as IntakeApiError;
      SnackbarUtils.error(e.status === 404 ? "This form isn't available any more. Please contact your practice." : e.message, false);
      throw err;
    }
  }

  return (
    <PageCard
      subtitle={
        <>
          Hi {form.patient.preferredName || form.patient.firstName} — please complete these forms for your{' '}
          {form.appointment.visitType ? <b>{form.appointment.visitType}</b> : 'visit'}
          {form.appointment.providerName && <> with {form.appointment.providerName}</>}
          {start && !Number.isNaN(start.getTime()) && <> on {format(start, "EEEE, MMM d 'at' h:mm a")}</>}.
        </>
      }
    >
      <WizardBody steps={steps} onSubmitSection={submit} />
    </PageCard>
  );
}
