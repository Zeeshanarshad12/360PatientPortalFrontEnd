import React, { useContext, useEffect } from "react";
import { Box, IconButton, Tooltip, styled } from "@mui/material";
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

const HeaderWrapper = styled(Box)(
  ({ theme }) => `
        height: 62px;
        color: ${theme.header.textColor};
        padding: ${theme.spacing(0, 1)};
        right: 0;
        top: 0;
        z-index: 6;
        background-color: rgba(255,255,255,0.4);
        backdrop-filter: blur(15px);
        box-shadow: ${theme.header.boxShadow};
        position: fixed;
        justify-content: space-between;
        width: 100%;
        // @media (min-width: ${theme.breakpoints.values.md}px) {
        //     left: ${theme.spacing(20)};
        //     width: auto;
        // }
`
);
function Header() {
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
    <>
      <HeaderWrapper
        id="app-header-main"
        display="flex"
        alignItems="center"
        style={{
          borderBottom: "1px solid #d3d9e3",
          boxShadow: "0px 1px 2px #00000029",  
          height: "60px",
        }}
      >
        <Box display={"flex"} alignItems="center">
          <Link href="/patientportal/profile" legacyBehavior>
            <a>
              <Image
                src="/statics/Logo.svg"
                alt="picture"
                width={45}
                style={{ marginLeft: "5px" }}
                height={45}
                onClick={() => localStorage.removeItem("modules")}
              />
            </a>
          </Link>
          <ThemeText sx={{ fontSize: "27px", ml: 1, color: "#8C8C8C" }}>
            Patient Portal
          </ThemeText>
        </Box>
        <Box display="flex" alignItems="center" justifyContent={"end"}>
          <PracticeBox />
          {/* <ShareHealthInfo /> */}
          <HeaderButtons />
          <HeaderUserbox />
          <Box
            component="span"
            sx={{
              display: { md: "none", xs: "inline-block" },
            }}
          >
            <Tooltip arrow title="Toggle Menu">
              <IconButton color="primary" onClick={toggleSidebar}>
                {!sidebarToggle ? <MenuTwoToneIcon /> : <CloseTwoToneIcon />}{" "}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </HeaderWrapper>
    </>
  );
}

export default Header;
