import PatientDocuments from '@/components/Documents/index';
import { ProtectedRoute } from '@/contexts/protectedRoute';

const Document = () => {
  return (
  <>
      <ProtectedRoute>
        <PatientDocuments /> {/* main page component */}
      </ProtectedRoute>
    </>
  );
}

export default Document;