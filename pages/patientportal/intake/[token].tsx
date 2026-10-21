import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/contexts/protectedRoute';
import { IntakeWizard } from '@/components/SmartIntake/IntakeWizard';
import { IntakeOtpGate } from '@/components/SmartIntake/IntakeOtpGate';
import { isIntakeToken } from '@/components/SmartIntake/api';
import { getIntakeSession, hasPortalSession } from '@/components/SmartIntake/intakeSession';

type Props = { token: string | null };

/**
 * Hands the page its token on the first render (a statically optimised dynamic route only
 * gets it after the client-side router becomes ready). The portal runs on a Node server
 * (server.js), so this is one lightweight server render with no data fetching — the form
 * itself still loads in the browser with the patient's portal token.
 */
export const getServerSideProps = async ({ params }: { params?: { token?: string | string[] } }): Promise<{ props: Props }> => {
  const token = typeof params?.token === 'string' ? params.token : null;
  return { props: { token } };
};

const NotAvailable = () => (
  <div style={{ padding: '80px 24px', textAlign: 'center' }}>
    <h1 style={{ fontSize: 18, fontWeight: 700 }}>This form isn&apos;t available</h1>
    <p style={{ fontSize: 13.5, color: '#94a0a8' }}>This link isn&apos;t complete. Please use the full link your practice sent you.</p>
  </div>
);

type Access = 'checking' | 'portal' | 'session' | 'code';

/**
 * Who is opening the link:
 *  - a signed-in portal user → the form, as before (the backend checks the link is theirs);
 *  - a patient with a verified one-time-code session for this link → the form, with that session;
 *  - anyone else (e.g. a patient who isn't registered on the portal) → the one-time-code screen.
 */
const IntakeAccessGate = ({ token }: { token: string }) => {
  const [access, setAccess] = useState<Access>('checking');

  useEffect(() => {
    setAccess(hasPortalSession() ? 'portal' : getIntakeSession(token) ? 'session' : 'code');
  }, [token]);

  if (access === 'checking') return null;
  if (access === 'portal')
    return (
      <ProtectedRoute>
        <IntakeWizard token={token} />
      </ProtectedRoute>
    );
  if (access === 'session') return <IntakeWizard token={token} />;
  return <IntakeOtpGate token={token} onVerified={() => setAccess('session')} />;
};

/**
 * /patientportal/intake/[token] — the visit intake form the practice sends from its console
 * (DQ_Patient_Access_Console → appointment → Intake → Create link). A registered patient signs in
 * to the portal (ProtectedRoute brings them back here afterwards — see GetToken); a patient who
 * isn't registered verifies a one-time code instead (IntakeOtpGate), which opens only this link.
 * The link only opens for the patient it was sent to, or an authorized user of theirs — the
 * backend checks.
 */
const IntakePage = ({ token }: Props) =>
  isIntakeToken(token ?? undefined) ? <IntakeAccessGate token={token as string} /> : <NotAvailable />;

export default IntakePage;
