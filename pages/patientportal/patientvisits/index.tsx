import React from "react";
import { ProtectedRoute } from '@/contexts/protectedRoute';

const pages = () => {
   return (
      <>
      <ProtectedRoute>
        <></>
        <div>Patient Portal Patient Visits</div>
      </ProtectedRoute>
        {/* <GetToken /> */}
        {/* Patient Portal Dashboard */}
      </>
    );

  
};

export default pages;
