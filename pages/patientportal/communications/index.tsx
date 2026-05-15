import PatientCommunication from '@/components/Communication/index';
import { ProtectedRoute } from '@/contexts/protectedRoute';

const Communication = () => {
  return (
    <>
      <ProtectedRoute>
        <PatientCommunication />
      </ProtectedRoute>
    </>
  );
};

export default Communication;
