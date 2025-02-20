import GetToken from "@/components/GetToken/GetToken";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "@/store/index";
import { GetPatientByEmail } from "@/slices/patientprofileslice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const types = `john.doe@gmail.com`;
  const { PatientByEmailData } = useSelector((state) => state.patientprofileslice);

  useEffect(() => {
    dispatch(GetPatientByEmail(types));
  }, [dispatch]);

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