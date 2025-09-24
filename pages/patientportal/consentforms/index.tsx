import ConsentFormsPage from '@/components/ConsentForms/index';
import { ProtectedRoute } from '@/contexts/protectedRoute';

const ConsentForms = () => {
  return (
  <>
      <ProtectedRoute>
        <ConsentFormsPage /> {/* main page component */}
      </ProtectedRoute>
    </>
  );
}

export default ConsentForms;