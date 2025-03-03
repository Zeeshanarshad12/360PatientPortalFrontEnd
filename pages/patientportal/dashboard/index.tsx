import GetToken from "@/components/GetToken/GetToken";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "@/store/index";
import { GetPatientByEmail } from "@/slices/patientprofileslice";
import { useRouter } from 'next/router';

const Dashboard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const types = `john.doe@gmail.com`;
  const { PatientByEmailData } = useSelector((state) => state.patientprofileslice);

  useEffect(() => {
    dispatch(GetPatientByEmail(types));
  }, [dispatch]);


  useEffect(() => {
    // Redirect to /patientportal/profile when the component mounts
    router.push('/patientportal/profile');
  }, [router]);



  const patient = PatientByEmailData?.[0];
  localStorage.setItem('patientEmail', types);
  useEffect(() => {
    if (patient?.patientID) {
      localStorage.setItem('patientID', patient?.patientID);
    }
  }, [patient?.patientID]);

  return (
    <>
      <GetToken />
      Patient Portal Dashboard
    </>
  );
};

export default Dashboard;