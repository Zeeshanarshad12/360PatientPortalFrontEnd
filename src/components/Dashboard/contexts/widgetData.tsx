import { useDispatch } from '@/store/index';
import { useState, useEffect } from 'react';
import { getdashboardconfigurations } from '@/slices/patientprofileslice';
 
export const useInitialLayout = () => {
  const [layout, setLayout] = useState<Record<string, string[]>>({
    column1: [],
    column2: [],
    column3: []
  });
 
  const dispatch = useDispatch();
 
  useEffect(() => {
    debugger;
    const fetchData = async () => {
      try {
        const Obj = {
          // PatientId: '27246' // later replace with localStorage if needed
          Email: localStorage.getItem('Email')
        };
 
        const response = await dispatch(getdashboardconfigurations(Obj)).unwrap();
        const savedLayout = response.result;
 
        // Build layout from API result
        const tempLayout: Record<string, { header: string; row: number }[]> = {
          column1: [],
          column2: [],
          column3: []
        };
 
        savedLayout.forEach(({ header, column, row }: any) => {
          const columnKey = `column${column}`;
          if (tempLayout[columnKey]) {
            tempLayout[columnKey].push({ header, row });
          }
        });
 
        const finalLayout: Record<string, string[]> = {
          column1: [],
          column2: [],
          column3: []
        };
 
        Object.entries(tempLayout).forEach(([columnKey, items]) => {
          finalLayout[columnKey] = items
            .sort((a, b) => a.row - b.row)
            .map((item) => item.header);
        });
 
        setLayout(finalLayout);
      } catch (error) {
        console.error('Error fetching Layout:', error);
      }
    };
 
    fetchData();
  }, [dispatch]);
 
  return layout;
};

export const widgetContent: Record<string, any> = {
  currentMedications: {
    title: 'Current Medications'
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
    title: 'My Health Conditions'
  },
  myMedicalTimeline: {
    title: 'My Medical Timeline'
  },
  allergies: {
    title: 'Allergies'
  },
  labResults: {
    title: 'Lab Results'
  },
  upcomingAppointments: {
    title: 'Upcoming Appointments'
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