'use client';

import React, { useEffect } from 'react';
import { CommunicationBody } from './components/CommunicationBody';
import { NewMessageModal } from './components/NewMessageModal';
import { fetchPatientProviders } from '@/slices/messagesSlice';

import { useCurrentPatient } from '@/contexts/CurrentPatientContext';
import { useDispatch } from 'react-redux';

const PatientCommunication: React.FC = () => {
  const dispatch = useDispatch();
  const { practiceId } = useCurrentPatient();

  useEffect(() => {
    if (!practiceId) return;
    dispatch(fetchPatientProviders(Number(practiceId)));
  }, [dispatch, practiceId]);

  return (
    <div className="comm-page">
      <CommunicationBody />
      <NewMessageModal />
    </div>
  );
};

export default PatientCommunication;
