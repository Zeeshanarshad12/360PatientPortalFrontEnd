import { ProtectedRoute } from '@/contexts/protectedRoute';
import { IntakeWizard } from '@/components/SmartIntake/IntakeWizard';
import { isIntakeToken } from '@/components/SmartIntake/api';

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

/**
 * /patientportal/intake/[token] — the visit intake form the practice sends from its console
 * (DQ_Patient_Access_Console → appointment → Intake → Create link). Requires the portal
 * sign-in: ProtectedRoute sends a signed-out patient to sign in and brings them back here
 * afterwards (see protectedRoute.tsx / GetToken). The link only opens for the patient it was
 * sent to, or an authorized user of theirs — the backend checks.
 */
const IntakePage = ({ token }: Props) => (
  <ProtectedRoute>
    {isIntakeToken(token ?? undefined) ? (
      <IntakeWizard token={token} />
    ) : (
      <div style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>This form isn&apos;t available</h1>
        <p style={{ fontSize: 13.5, color: '#94a0a8' }}>This link isn&apos;t complete. Please use the full link your practice sent you.</p>
      </div>
    )}
  </ProtectedRoute>
);

export default IntakePage;
