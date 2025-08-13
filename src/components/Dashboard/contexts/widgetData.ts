export const savedLayout = [
  { header: 'currentMedications', column: 1, row: 1 },
  { header: 'myHealthConditions', column: 1, row: 2 },
  { header: 'labResults', column: 1, row: 3 },

  { header: 'myVitals', column: 3, row: 1 },
  { header: 'myMedicalTimeline', column: 2, row: 2 },
  { header: 'allergies', column: 2, row: 1 },

  { header: 'upcomingAppointments', column: 2, row: 3 },
  { header: 'notifications', column: 3, row: 2 },
  { header: 'billingInsurance', column: 3, row: 3 }
];

export const initialLayout = (() => {
  const tempLayout: Record<string, { header: string; row: number }[]> = {
    column1: [],
    column2: [],
    column3: []
  };

  savedLayout.forEach(({ header, column, row }) => {
    const columnKey = `column${column}`;
    tempLayout[columnKey].push({ header, row });
  });

  const finalLayout: Record<string, string[]> = {
    column1: [],
    column2: [],
    column3: []
  };

  Object.entries(tempLayout).forEach(([columnKey, items]) => {
    finalLayout[columnKey] = items
      .sort((a, b) => a.row - b.row)
      .map(item => item.header);
  });

  return finalLayout;
})();

export const widgetContent: Record<string, any> = {
  currentMedications: {
    title: 'Current Medications',
    data: [
      {
        name: 'Lisinopril 10mg',
        frequency: 'Once daily, Before Meal',
        prescribedBy: 'Dr. Smith Simmons',
        duration: {
          start: '11/07/2025',
          end: '12/08/2025'
        },
        isNew: true
      },
      {
        name: 'Amitriptyline 500mg',
        frequency: 'Twice daily, Before Meal',
        prescribedBy: 'Dr. Smith Simmons',
        duration: {
          start: '11/07/2025',
          end: '12/08/2025'
        },
        isNew: false
      },
      {
        name: 'Vitamin D3 1000 IU',
        frequency: 'Once daily, Before Meal',
        prescribedBy: 'Dr. Smith Simmons',
        duration: {
          start: '11/07/2025',
          end: '12/08/2025'
        },
        isNew: true
      }
    ]
  },
  myVitals: {
    title: 'My Vitals',
    data: {
      dates: ['Jul 23', 'May 24', 'Feb 25'],
      vitals: [
        {
          name: 'BP',
          fullName: 'Blood Pressure',
          unit: '',
          values: ['120/85', '122/86', '120/84']
        },
        {
          name: 'BMI',
          fullName: 'Body Mass Index',
          unit: '',
          values: ['67', '86', '33']
        },
        {
          name: 'Weight',
          fullName: 'Weight',
          unit: 'lbs',
          values: ['59', '86', '88']
        },
        {
          name: 'Height',
          fullName: 'Height',
          unit: 'ft-in',
          values: ['4.2', '35.1', '5.5']
        },
        {
          name: 'Heart Rate',
          fullName: 'Heart Rate',
          unit: 'bpm',
          values: ['85', '86', '97']
        },
        {
          name: 'Temp',
          fullName: 'Temperature',
          unit: 'F',
          values: ['98.2', '98.2', '98.3']
        }
      ]
    }
  },
  myHealthConditions: {
    title: 'My Health Conditions',
    data: [
      {
        condition: 'Hypertension',
        reviewed: 'Dec 28, 2025',
        provider: 'Dr. Smith Simmons',
        diagnosed: '2021'
      },
      {
        condition: 'Type 2 Diabetes',
        reviewed: 'Jan 10, 2025',
        provider: 'Dr. Sara William',
        diagnosed: '2019'
      }
    ]
  },
  myMedicalTimeline: {
    title: 'My Medical Timeline',
    data: [
      {
        title: 'Specialist Consultation',
        provider: 'Dr. Smith Simmons',
        status: 'Completed',
        date: '07/04/2025',
        time: '09:00 - 09:30',
        location: 'Prime Care Clinic',
        description: 'Patient referred for Endocrinology consultation suboptimal glycemic control despite dual oral therapy.',
        associatedDetails: ['2 Problems', 'Medications']
      },
      {
        title: 'Emergency',
        provider: 'Dr. Sara William',
        status: 'Discharged',
        date: '16/12/2025',
        time: '09:00 - 09:30',
        location: 'City General Hospital - ER',
        description: 'Patient presented to the ED due to acute onset dizziness and near-syncope that occurred while standing from a seated position at home.',
        associatedDetails: ['2 Problems', 'Medications']
      },
      {
        title: 'Annual Wellness Visit',
        provider: 'Dr. Smith Simmons',
        status: 'Completed',
        date: '06/15/2025',
        time: '10:00 - 11:00',
        location: 'Prime Care Clinic',
        description: 'Routine annual wellness examination with comprehensive health assessment and preventive care recommendations.',
        associatedDetails: ['1 Problem', '2 Medications']
      },
      {
        title: 'Lab Work Follow-up',
        provider: 'Dr. Joseph Brooks',
        status: 'Completed',
        date: '05/20/2025',
        time: '08:30 - 09:00',
        location: 'LabCorp - Downtown',
        description: 'Follow-up blood work to monitor diabetes management and kidney function.',
        associatedDetails: ['Lab Results']
      },
      {
        title: 'Cardiology Consultation',
        provider: 'Dr. Michael Chen',
        status: 'Pending',
        date: '08/10/2025',
        time: '14:00 - 15:00',
        location: 'Heart & Vascular Institute',
        description: 'Initial consultation for chest pain evaluation and cardiovascular assessment.',
        associatedDetails: ['1 Problem']
      },
      {
        title: 'Physical Therapy Session',
        provider: 'Dr. Sarah Johnson',
        status: 'Completed',
        date: '04/28/2025',
        time: '11:00 - 12:00',
        location: 'Rehabilitation Center',
        description: 'Physical therapy session for lower back pain management and mobility improvement.',
        associatedDetails: ['1 Problem']
      },
      {
        title: 'Dental Cleaning',
        provider: 'Dr. Robert Wilson',
        status: 'Completed',
        date: '03/15/2025',
        time: '13:00 - 14:00',
        location: 'Bright Smile Dental',
        description: 'Routine dental cleaning and oral health examination.',
        associatedDetails: []
      },
      {
        title: 'Eye Exam',
        provider: 'Dr. Lisa Thompson',
        status: 'Completed',
        date: '02/20/2025',
        time: '15:30 - 16:30',
        location: 'Vision Care Center',
        description: 'Comprehensive eye examination and prescription update.',
        associatedDetails: []
      },
      {
        title: 'Flu Shot',
        provider: 'Nurse Practitioner',
        status: 'Completed',
        date: '10/15/2024',
        time: '09:00 - 09:15',
        location: 'Prime Care Clinic',
        description: 'Annual influenza vaccination.',
        associatedDetails: []
      },
      {
        title: 'Blood Pressure Check',
        provider: 'Dr. Smith Simmons',
        status: 'Completed',
        date: '09/30/2024',
        time: '10:00 - 10:30',
        location: 'Prime Care Clinic',
        description: 'Routine blood pressure monitoring and medication adjustment.',
        associatedDetails: ['1 Problem', '1 Medication']
      },
      {
        title: 'X-Ray Examination',
        provider: 'Dr. David Rodriguez',
        status: 'Completed',
        date: '08/25/2024',
        time: '14:00 - 14:30',
        location: 'Radiology Department',
        description: 'Chest X-ray for respiratory symptoms evaluation.',
        associatedDetails: ['1 Problem']
      },
      {
        title: 'Nutrition Consultation',
        provider: 'Dr. Emily Davis',
        status: 'Completed',
        date: '07/10/2024',
        time: '11:30 - 12:30',
        location: 'Nutrition Center',
        description: 'Dietary consultation for diabetes management and weight control.',
        associatedDetails: ['1 Problem']
      },
      {
        title: 'Sleep Study',
        provider: 'Dr. James Anderson',
        status: 'Completed',
        date: '06/05/2024',
        time: '22:00 - 06:00',
        location: 'Sleep Lab',
        description: 'Overnight sleep study for sleep apnea evaluation.',
        associatedDetails: ['1 Problem']
      }
    ]
  },
  allergies: {
    title: 'Allergies',
    data: [
      { name: 'Pollen Extracts', severity: 'Severe', category: 'Medication', onset: '11/03/2025' },
      { name: 'House Dust', severity: 'Mild', category: 'Medication', onset: '11/03/2025' },
      { name: 'Egg Yolk', severity: 'Low', category: 'Food', onset: '11/03/2025' }
    ]
  },
  labResults: {
    title: 'Lab Results',
    data: [
      {
        group: 'Comprehensive Metabolic Panel',
        date: '07/05/24',
        provider: 'LabCorp',
        panel: [
          { label: 'Glucose', value: 61, normal: '70-100 mg/dL' },
          { label: 'Sodium', value: 137, normal: '135-145 mmol/L' },
          { label: 'Potassium', value: 2.9, normal: '3.5-5.0 mmol/L' },
          { label: 'Calcium', value: 6.0, normal: '8.5-10.2 mg/dL', critical: true },
          { label: 'Total Protein', value: 8.1, normal: '6.0-8.3 g/dL' }
        ]
      },
      {
        group: 'COVID 19 Serology',
        date: '06/24/24',
        provider: '',
        panel: [
          { label: 'SARS CoV 2 AB IGG' }
        ]
      },
      {
        group: 'Blood CP',
        date: '09/30/2024',
        provider: 'Quest Diagnostics'
      },
      {
        group: 'LFT Test',
        date: '09/30/2024',
        provider: 'LabCorp'
      }
    ]
  },
  upcomingAppointments: {
    title: 'Upcoming Appointments',
    data: [
      {
        type: 'Annual Wellness',
        doctor: 'Dr. Smith Simmons',
        status: 'Pending',
        date: '07/04/2025',
        time: '10:00 am - 11:00am',
        location: '18305 Alderwood Mall Pkwy, Lynnwood, WA 98037'
      },
      {
        type: 'Follow Up',
        doctor: 'Dr. Joseph Brooks',
        status: 'Confirmed',
        date: '07/04/2025',
        time: '10:00 am - 11:00am',
        location: '18305 Alderwood Mall Pkwy, Lynnwood, WA 98037'
      }
    ]
  },
  notifications: {
    title: 'Notifications & Alerts',
    data: [
      {
        message: 'You have next medication pending ready to intake',
        timestamp: '12/07/2025 11:00am'
      },
      {
        message: 'You Appointment has been confirmed With Dr. Joseph Brook on Follow up..',
        timestamp: '12/07/2025 11:00am'
      }
    ]
  },
  billingInsurance: {
    title: 'Billing & Insurance Coverage',
    data: {
      provider: 'Blue Cross Blue Shield',
      type: 'PPO Gold',
      memberId: 'ABX12345678',
      groupId: 'GRP987658',
      status: 'Active',
      claims: [
        {
          service: 'Lab Work',
          status: 'Paid',
          provider: 'Quest Diagnostics',
          amount: '$285',
          date: 'Jan 15, 2025',
          claimId: 'CLM-2025-001',
          coverage: '100%'
        },
        {
          service: 'X-Ray',
          status: 'Paid',
          provider: 'Radiology Plus',
          amount: '$150',
          date: 'Dec 28, 2024',
          claimId: 'CLM-2024-124',
          coverage: '80%'
        }
      ]
    }
  }
};