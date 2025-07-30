import GetToken from "@/components/GetToken/GetToken";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "@/store/index";
import { GetPatientByEmail } from "@/slices/patientprofileslice";
import { useRouter } from 'next/router';
import { ProtectedRoute } from '@/contexts/protectedRoute';

const Dashboard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const types = localStorage.getItem("Email");
  // john.doe@gmail.com
  const { PatientByEmailData } = useSelector((state) => state.patientprofileslice);

  useEffect(() => {
    dispatch(GetPatientByEmail(types));
  }, [dispatch]);


  // useEffect(() => {
  //   // Redirect to /patientportal/profile when the component mounts
  //   router.push('/patientportal/profile');
  // }, [router]);



  const patient = PatientByEmailData?.[0];
  localStorage.setItem('patientEmail', types);
  useEffect(() => {
    if (patient?.patientID) {
      localStorage.setItem('patientID', patient?.patientID);
      localStorage.setItem('PracticeId', patient?.practiceId);
      localStorage.setItem('vdtAccess', patient?.vdtAccess);
      localStorage.setItem('pendingConsentFormCount', patient?.pendingConsentFormCount);
    }
  }, [patient?.patientID,patient?.vdtAccess]);

  return (
    <>
    <ProtectedRoute>
      <></>
    </ProtectedRoute>
      {/* <GetToken /> */}
      {/* Patient Portal Dashboard */}
    </>
  );
};

export default Dashboard;