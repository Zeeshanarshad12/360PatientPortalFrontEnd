import React, { useContext, useEffect } from "react";
import { Box, IconButton, Tooltip, styled, useTheme, useMediaQuery } from "@mui/material";
import MenuTwoToneIcon from "@mui/icons-material/MenuTwoTone";
import { SidebarContext } from "src/contexts/SidebarContext";
import CloseTwoToneIcon from "@mui/icons-material/CloseTwoTone";

import HeaderButtons from "./Buttons";
import Link from "next/link";
import Image from "next/image";
import ThemeText from "@/components/ThemeComponent/ThemeHeading";
import HeaderUserbox from "./Userbox";
import PracticeBox from "./PracticeBox/PracticeBox";
import ShareHealthInfo from "./ShareHealthInfo";
import { GetGeneralLookup } from "@/slices/static";
import { useDispatch, useSelector } from "@/store";

const HeaderWrapper = styled(Box)(({ theme }) => ({
  height: '70px',
  color: theme.palette.text.primary,
  padding: theme.spacing(0, 1),
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.drawer + 1,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  
  [theme.breakpoints.up('md')]: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  
  [theme.breakpoints.down('md')]: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  }
}));
function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
  const { GeneralLookupData } = useSelector((state) => state.static);
  const types = `encounterstatus,labStatusNew,TaskPriority,LabType,TaskStatus,SuperBillStatus,SuperBillPatientCondition,PatientProblemStatus,Auth02FAChannel,USStates,roles,examtype,RosReportedBy,AgeRangeType,Specialty,AccessLevel,VaccineUnit,VitalPains,tribalAffiliation,VitalPosition,BPPosition,BPSource,TemperatureSource,SmokingStatus,TobaccoType,TobaccoCessation,PacksPerDay,EncounterType,occupationIndustry,occupation,patientSuffix,patientPrefix,NamePrefix,AddressType,EncounterReason,SpecimenType,VolumeUnit,SourceSite,SpecimenSource,LabStatus,LabOrderType,BillType,CollectionMethod,PatientStatus,InsuranceCoverage,PhoneNumberType,EmailAddressType,PreferredContactMethod,gender,PatientStatus,genderidentity,PreferredLanguage,religion,PreferredContactMethod,insuranceCoverage,InsuranceRelation,CareTeamStatus,CareTeamMemberRelation,PharmacyType,EmergencyInfoRelation,ImmunizationRegistryStatus,ImmunizationNotificationPreference,AppointmentType,ColorCodingEntityType,AppointmentStatus,HolidayType,SeverityType,AllergyType,languageProficiency,LanguageAbility,Ethnicity,maritalstatus,sexualorientation,VaccineFundingProgram,VaccineFundingSource,VaccineRefusalReason,VaccineRoute,VaccineSite,VaccineType,SurgeryType,VaccineFundingProgram, VaccineFundingSource, VaccineRefusalReason,VaccineRoute,VaccineSite,VaccineType,PatientReferralMedium,taxonomy,GoalStatus,OrderEntityType,TaskAssociationEntityType,preferredInsuranceMethod,taskCategory,PaymentReason,CardType,paymentmethod,FlowRate,OxygenSource,LateralityType,orderControlStatus,labOrderStatus,signedStatus,labType,billType,SpecimenType,TobaccoStatus,SmokelessStatus,SpecimenSource,SpecimenAdditive,SpecimenCollectionMethod,SpecimenCollectionSite,VolumeUnit,SpecimenHandling,AllergyCriticality,AllergySeverity,VapingType,VapingUse,AllergyReaction,ReversalReason,IncomingReferralStatus,PriorAuthStatus,PriorAuthRequestMethod,FollowUpWhen,Race,OutgoingReferralStatus,AssessmentType,Payertype,priorAuthurl,FamilyRelation,RecordInterventionStatus,PregnancyStatus`;
  const dispatch = useDispatch();
  const handleLogoutApplication = async () => {
    try {
      window.location.reload();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  React.useLayoutEffect(() => {
    //  dispatch(GetGeneralLookup(types));
  }, [GeneralLookupData?.length, types]);

  useEffect(() => {
    const channel: BroadcastChannel = new BroadcastChannel("localstorage");
    channel.addEventListener("message", (event) => {
      if (event.data === "refresh") {
        // On Tab Switch
        window.location.reload();
      }
      if (event.data === "logout") {
        handleLogoutApplication();
      }
    });
    return () => {
      channel.close();
    };
  });
  // ================================> Dont Remove or Comment This Piece of Code

  return (
    <HeaderWrapper id="app-header-main">
      {/* Mobile: Hamburger Menu + Logo */}
      {isMobile && (
        <Box sx={{ display: 'flex', alignItems: 'center', order: 1 }}>
          <IconButton 
            color="primary" 
            onClick={toggleSidebar}
            sx={{ 
              mr: 1,
              p: 1,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            {!sidebarToggle ? <MenuTwoToneIcon /> : <CloseTwoToneIcon />}
          </IconButton>
          <Link href="/patientportal/dashboard" legacyBehavior>
            <a style={{ display: 'flex', alignItems: 'center' }}>
              <Image
                src="/statics/Logo.svg"
                alt="Patient Portal Logo"
                width={36}
                height={36}
                onClick={() => localStorage.removeItem("modules")}
                style={{ cursor: 'pointer' }}
              />
            </a>
          </Link>
        </Box>
      )}

      {/* Desktop: Logo + Title */}
      {!isMobile && (
        <Box sx={{ display: 'flex', alignItems: 'center', order: 1 }}>
          <Link href="/patientportal/dashboard" legacyBehavior>
            <a style={{ display: 'flex', alignItems: 'center' }}>
              <Image
                src="/statics/Logo.svg"
                alt="Patient Portal Logo"
                width={45}
                height={45}
                onClick={() => localStorage.removeItem("modules")}
                style={{ cursor: 'pointer', marginRight: '8px' }}
              />
            </a>
          </Link>
          <ThemeText 
            sx={{ 
              fontSize: { xs: '1.2rem', md: '1.7rem' },
              color: '#1976d2',
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}
          >
            Patient Portal
          </ThemeText>
        </Box>
      )}

      {/* Right side content */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 0.5, md: 1 },
          order: 2
        }}
      >
        {!isMobile && (
          <>
            <PracticeBox />
          </>
        )}
        <HeaderButtons />
        <HeaderUserbox />
      </Box>
    </HeaderWrapper>
  );
}

export default Header;
