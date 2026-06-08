'use client';

import React, { useState, useEffect } from 'react';
import { CommunicationBody } from './components/CommunicationBody';
import { NewMessageModal } from './components/NewMessageModal';
import { fetchPatientProviders } from '@/slices/messagesSlice';

import { useCurrentPatient } from '@/contexts/CurrentPatientContext';
import { useDispatch } from 'react-redux';
import HeartProgressLoader from '@/components/ProgressLoaders/components/HeartLoader';

const PatientCommunication: React.FC = () => {
  const [heartLoading, setHeartLoading] = useState(true);
  const dispatch = useDispatch();
  const { practiceId } = useCurrentPatient();

  useEffect(() => {
    if (!practiceId) return;
    dispatch(fetchPatientProviders(Number(practiceId)));
  }, [dispatch, practiceId]);

  useEffect(() => {
    const timer = setTimeout(() => setHeartLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);
  if (heartLoading) return <HeartProgressLoader />;

  return (
    <div className="comm-page">
      <CommunicationBody />
      <NewMessageModal />
    </div>
  );
};

export default PatientCommunication;
