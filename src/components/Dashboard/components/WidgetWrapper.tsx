import React from 'react';

import CurrentMedications from './widgets/CurrentMedications';
import MyVitals from './widgets/MyVitals';
import MyHealthConditions from './widgets/MyHealthConditions';
import MyMedicalTimeline from './widgets/MyMedicalTimeline';
import Allergies from './widgets/Allergies';
import LabResults from './widgets/LabResults';
import UpcomingAppointments from './widgets/UpcomingAppointments';
import NotificationsAlerts from './widgets/NotificationsAlerts';
import BillingInsurance from './widgets/BillingInsurance';

interface Props {
  id: string;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>; // receive from SortableItem
}

const WidgetWrapper: React.FC<Props> = ({ id, dragHandleProps }) => {
  const components: Record<string, JSX.Element> = {
    currentMedications: <CurrentMedications dragHandleProps={dragHandleProps} />,
    myVitals: <MyVitals dragHandleProps={dragHandleProps} />,
    myHealthConditions: <MyHealthConditions dragHandleProps={dragHandleProps} />,
    myMedicalTimeline: <MyMedicalTimeline dragHandleProps={dragHandleProps} />,
    allergies: <Allergies dragHandleProps={dragHandleProps} />,
    labResults: <LabResults dragHandleProps={dragHandleProps} />,
    upcomingAppointments: <UpcomingAppointments dragHandleProps={dragHandleProps} />,
    notifications: <NotificationsAlerts dragHandleProps={dragHandleProps} />,
    billingInsurance: <BillingInsurance dragHandleProps={dragHandleProps} />,
  };

  return components[id] || <div>Widget not found</div>;
};

export default WidgetWrapper;