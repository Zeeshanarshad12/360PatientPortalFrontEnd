export const SERVICE_URLSV2 = {
  // service URL's version 2 Dot Net Backend (API End-Points)
  GeneralLookup: 'generallookup/getgenerallookups',
  ClearCahce: 'permissions/clearusersessioncache',
  GetPatientByEmail: 'patientportal/getpatientbyemail',
  GetPatientDetailsById: 'patientportal/getpatientdetailsbyid',
  GetPatientEncounterDetails: 'patientportal/getpatientencounterdetails',
  DownloadDocument: 'ccda/download',
  GetPatientCCDAActivityLog: 'patientportal/getpatientccdaactivitylog',
  InsertActivityLog: 'patientportal/insertactivitylog',
  CreateAuthorizedUser: 'patientuser/authorizepatientuserrequest',
  Share: '/ccda/share',
  GetPatientAuthorizedUser: 'patientportal/getpatientauthorizeduser',
  UpdatePatientAuthorizedUserAccess: 'patientportal/updatepatientauthorizeduseraccess',
  GetPatientUserRequestByCode: 'patientuser/getpatientuserrequestbycode',
  GenerateOtp: 'patientuser/generateotp',
  AddPatientUser: 'patientuser/addpatientuser',
  GetToken: 'patientuser/gettoken'
};