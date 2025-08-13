import React, { useEffect } from 'react';
import PatientDashboard from '@/components/Dashboard/index';
import { ProtectedRoute } from '@/contexts/protectedRoute';
import { useDispatch, useSelector } from "@/store/index";
import { GetPatientByEmail } from "@/slices/patientprofileslice";
import { useRouter } from 'next/router';
import GetToken from "@/components/GetToken/GetToken";

const Dashboard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const types = localStorage.getItem("Email");
  const { PatientByEmailData } = useSelector((state) => state.patientprofileslice);

  useEffect(() => {
    dispatch(GetPatientByEmail(types));
  }, [dispatch]);

  const patient = PatientByEmailData?.[0];
  localStorage.setItem('patientEmail', types);

  useEffect(() => {
    if (patient?.patientID) {
      debugger;
      localStorage.setItem('patientID', patient?.patientID);
      localStorage.setItem('PracticeId', patient?.practiceId);
      localStorage.setItem('vdtAccess', patient?.vdtAccess);
      localStorage.setItem('pendingConsentFormCount', patient?.pendingConsentFormCount);
    }
  }, [patient?.patientID,patient?.vdtAccess]);

  return (
    <>
      <ProtectedRoute>
        <PatientDashboard /> {/* main page component */}
      </ProtectedRoute>
    </>
  );
};

export default Dashboard;