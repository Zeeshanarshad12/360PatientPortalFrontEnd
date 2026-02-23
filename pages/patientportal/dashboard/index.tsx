import React, { useEffect, useState } from 'react';
import PatientDashboard from '@/components/Dashboard/index';
import { ProtectedRoute } from '@/contexts/protectedRoute';
import { useDispatch, useSelector } from "@/store/index";
import { GetPatientByEmail } from "@/slices/patientprofileslice";
import { CircularProgress } from '@mui/material';
import { Box } from '@mui/system';

const Dashboard = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState<string | null>(null);
  const { PatientByEmailData } = useSelector((state) => state.patientprofileslice);
  const [practiceKey, setPracticeKey] = useState<string | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false); // KEY FIX


  // Safe localStorage access
  useEffect(() => {
    const storedEmail = localStorage.getItem("Email");
    if (storedEmail) {
      localStorage.setItem('patientEmail', storedEmail);
      setEmail(storedEmail);
    }
  }, []);

  // Fetch patient data on load
  useEffect(() => {
    if (!email) return;
    dispatch(GetPatientByEmail(email));
  }, [email, dispatch]);

  // Listen for practice changes — re-dispatch practice-dependent calls
 useEffect(() => {
  const handlePracticeChange = () => {
    setPracticeKey(localStorage.getItem('PracticeId')); // changing key remounts PatientDashboard
  };
  window.addEventListener('practiceChanged', handlePracticeChange);
  return () => window.removeEventListener('practiceChanged', handlePracticeChange);
}, []);


  useEffect(() => {
  if (!Array.isArray(PatientByEmailData) || PatientByEmailData.length === 0) return;

  // Only skip if stored patientID belongs to the current user
  const existingPatientId = localStorage.getItem('patientID');
  const currentUserPatientIds = PatientByEmailData.map((p) => String(p.patientID));
  const isAlreadyCorrectUser = existingPatientId && currentUserPatientIds.includes(existingPatientId);
  //if (existingPatientId && currentUserPatientIds.includes(existingPatientId)) return;
  if (!isAlreadyCorrectUser) {
  const defaultPatient =
    PatientByEmailData.find((p) => p.isDefault) ?? PatientByEmailData[0];
  if (!defaultPatient?.patientID) return;

  localStorage.setItem('patientID', String(defaultPatient.patientID));
  localStorage.setItem('PracticeId', String(defaultPatient.practiceId ?? ''));
  localStorage.setItem('PracticeName', String(defaultPatient.practiceName ?? ''));
  localStorage.setItem('FirstName', String(defaultPatient.firstName ?? ''));
  localStorage.setItem('LastName', String(defaultPatient.lastName ?? ''));
  localStorage.setItem('vdtAccess', String(defaultPatient.vdtAccess ?? ''));
  localStorage.setItem('pendingConsentFormCount', String(defaultPatient.pendingConsentFormCount ?? ''));
  setPracticeKey(String(defaultPatient.practiceId ?? ''));
  }
  else {
      setPracticeKey(localStorage.getItem('PracticeId'));
    }
    setIsSessionReady(true);
}, [PatientByEmailData]);
  

 // Block the entire dashboard until session is verified
  if (!isSessionReady) {
    return (
      <ProtectedRoute>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </ProtectedRoute>
    );
  }
 
  return (
    <ProtectedRoute>
      <PatientDashboard key={practiceKey ?? 'default'}/>
    </ProtectedRoute>
  );
};

export default Dashboard;
