import React from "react";
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
          width={1000}  
          height={300}  
          priority  
        />
      </div>
    );
};

export default pages;
