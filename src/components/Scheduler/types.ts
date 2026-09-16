export interface Facility {
  id: string | number;
  name: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}

export interface ReasonForVisit {
  id: number;
  appReason: string;
  isActive: boolean | null;
  totalCount: number;
}

export interface Provider {
  providerId: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  providerFullName: string;
  title?: string;
  npi?: string;
  locationId?: number;
  locationName?: string | null;
  practiceId?: number;
  practiceName?: string | null;
  providerSpecialty: string;
  isDefault?: boolean;
  isSupervising?: boolean;
  isBillingProvider?: boolean;
  isSchedulingProvider?: boolean;
  providerIsActive?: boolean | null;
  badges?: string[];
  nextAvailable?: string;
}

export interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

export interface AppointmentTypeOption {
  id?: number;
  text: string;
  slotDuration?: number;
  disableType?: boolean;
}

export interface AppointmentData {
  facility?: Facility;
  reasonForVisit?: ReasonForVisit;
  provider?: Provider;
  appointmentType?: AppointmentTypeOption;
  date?: string;
  time?: string;
  slotDurationMinutes?: number;
}

export interface SchedulerState {
  currentStep: number;
  appointmentData: AppointmentData;
}
