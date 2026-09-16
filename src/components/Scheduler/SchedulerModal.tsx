import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Step1SelectLocation from './steps/Step1SelectLocation';
import Step2SelectAppointmentReason from './steps/Step2SelectAppointmentReason';
import Step3SelectProvider from './steps/Step3SelectProvider';
import Step4SelectProviderSchedule from './steps/Step4SelectProviderSchedule';
import Step5SaveAppointmentData from './steps/Step5SaveAppointmentData';
import { AppointmentData } from './types';

interface SchedulerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: (appointmentData: AppointmentData) => void;
  appointmentId?: string | number | null;
  initialAppointmentData?: AppointmentData;
}

const steps = [
  'Select Location',
  'Reason for your visit',
  'Select Provider',
  'Choose Date & Time',
  'Confirm & Book'
];

const SchedulerModal: React.FC<SchedulerModalProps> = ({
  open,
  onClose,
  onConfirm,
  appointmentId,
  initialAppointmentData
}) => {
  const isEditMode = !!appointmentId;
  const [currentStep, setCurrentStep] = useState(0);
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({});
  const [wasOpen, setWasOpen] = useState(false);

  // Reset synchronously during render (not in an effect) so Step1 mounts
  // with the correct currentData on its very first render instead of one
  // render late — the step components only read currentData in a useState
  // initializer, so a late effect-based sync would leave them permanently
  // unfilled.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setCurrentStep(0);
      setAppointmentData(initialAppointmentData || {});
    }
  }

  const handleNext = (data: AppointmentData) => {
    setAppointmentData(data);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setAppointmentData({});
    onClose();
  };

  const handleSuccess = () => {
    onConfirm?.(appointmentData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1SelectLocation
            onNext={handleNext}
            onBack={handleClose}
            currentData={appointmentData}
          />
        );
      case 1:
        return (
          <Step2SelectAppointmentReason
            onNext={handleNext}
            onBack={handleBack}
            currentData={appointmentData}
          />
        );
      case 2:
        return (
          <Step3SelectProvider
            onNext={handleNext}
            onBack={handleBack}
            currentData={appointmentData}
          />
        );
      case 3:
        return (
          <Step4SelectProviderSchedule
            onNext={handleNext}
            onBack={handleBack}
            currentData={appointmentData}
          />
        );
      case 4:
        return (
          <Step5SaveAppointmentData
            onConfirm={handleClose}
            onSuccess={handleSuccess}
            onBack={handleBack}
            currentData={appointmentData}
            appointmentId={appointmentId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(_event, reason) => {
        if (reason === 'backdropClick') return;
        handleClose();
      }}
      // Bug 432589: "sm" (600px) was too cramped for the appointment
      // details and date/time slot grid, especially now that a full week
      // can show up to 7 day columns.
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      {/* Header with Title and Close Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {isEditMode ? 'Edit Appointment' : 'New Appointment'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Step {currentStep + 1} of {steps.length}
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose}
          aria-label="close"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Stepper */}
      <Box sx={{ px: 2, pt: 2, mb: 2 }}>
        <Stepper activeStep={currentStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Content */}
      {/* Bug 432480: fixed height + flex column so each step's footer buttons
          render in a stable position instead of drifting with content length. */}
      <DialogContent
        sx={{ height: 520, display: 'flex', flexDirection: 'column', p: 3 }}
      >
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
};

export default SchedulerModal;
