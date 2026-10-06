import { useEffect, useState } from 'react';
import { Alert, Box, Chip, CircularProgress, Stack } from '@mui/material';
import ConsentFormViewer from '@/components/ConsentForms/components/ConsentFormViewer';
import type { ConsentForm } from '@/types/ConsentForm';
import { useDispatch } from '@/store/index';
import { GetConsentFormContent } from '@/slices/patientprofileslice';
import { convertDraftToHtml } from '@/utils/draftToHtmlWithAlignment';
import type { IntakeConsent } from './types';

type Row = Record<string, unknown>;

/** The form's text: the EMR stores HTML or Draft.js JSON — the same handling as the Consent
 * Forms page (ConsentFormsLayout). */
function toHtml(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim()) return '';
  if (raw.trim().startsWith('<')) return raw;
  try {
    return convertDraftToHtml(JSON.parse(raw));
  } catch {
    return raw;
  }
}

/**
 * One consent form the visit type requires. Shown and signed with the portal's own consent
 * viewer and signature dialog, so it saves exactly like the Consent Forms page does
 * (PatientPortal/SubmitConsentForm → dbo.SignedConsentForms, plus the signed PDF filed to the
 * patient's documents). A form the patient already signed shows as signed.
 */
export function ConsentStep({ consent, patientId, onSignedChange }: { consent: IntakeConsent; patientId: string; onSignedChange: (signed: boolean) => void }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState<ConsentForm | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setForm(null);
    setError(null);
    (async () => {
      try {
        const response = await dispatch(GetConsentFormContent({ PatientId: patientId, FormID: consent.consentFormId })).unwrap();
        const detail = ((response?.result as Row[] | undefined) ?? [])[0];
        if (cancelled) return;
        const content = toHtml(detail?.content);
        if (!content) {
          setError("This form's text isn't available. Please contact your practice before signing.");
          return;
        }
        const signature = typeof detail?.signature === 'string' && detail.signature ? detail.signature : undefined;
        setForm({
          PatientID: Number(patientId),
          FormID: consent.consentFormId,
          Title: consent.name,
          Content: content,
          Status: signature ? 'Signed' : 'Pending',
          Signature: signature,
          SignedByName: (detail?.signedByName as string | null | undefined) ?? null
        });
        onSignedChange(Boolean(signature));
      } catch {
        if (!cancelled) setError("We couldn't load this form. Please try again in a few minutes.");
      }
    })();
    return () => {
      cancelled = true;
    };
    // onSignedChange is a fresh closure each render; reloading only matters when the form changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, consent.consentFormId, patientId]);

  if (error) return <Alert severity="warning">{error}</Alert>;
  if (!form) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        {consent.version && <Chip size="small" label={`Version ${consent.version}`} />}
        <Chip size="small" label={consent.expiryMonths ? `Valid ${consent.expiryMonths} months from signature` : 'No expiry'} />
        {form.Status === 'Signed' && <Chip size="small" color="success" label="Signed" />}
      </Stack>
      {/* The viewer fills its parent's height and scrolls its own body. */}
      <Box sx={{ height: { xs: '60vh', md: '62vh' }, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
        <ConsentFormViewer
          form={form}
          pendingForms={[]}
          onSelectForm={() => undefined}
          triggerRefresh={() => undefined}
          onFormSigned={(_formId, signature, renderedHTML) => {
            setForm((f) => (f ? { ...f, Status: 'Signed', Signature: signature, SignedDate: new Date().toISOString(), Content: renderedHTML } : f));
            onSignedChange(true);
          }}
        />
      </Box>
    </Box>
  );
}
