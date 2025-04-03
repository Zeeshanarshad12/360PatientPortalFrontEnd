import React from "react";
import { ProtectedRoute } from '@/contexts/protectedRoute';
import { Icons } from "@/icons/themeicons";
import Image from "next/image";

const pages = () => {
  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "80vh" // Adjust height as needed
    }}>
      <Image 
        src={Icons.comingsoon} 
        alt="Patient Portal Patient Visits"
        width={700}  
          height={200}   
        priority  
      />
    </div>
  );
  
};

export default pages;
