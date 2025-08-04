import { get, getWithoutToken, post, postWithoutToken } from './HttpProvider';
import featureConstants from './features-constants';
import { SERVICE_URLSV2 } from './ServiceUrl';
import { getPatientId } from '../utils/functions';

const ClearCahce = (data) =>
  get(
    SERVICE_URLSV2.ClearCahce,
    {},
    {
      feature: featureConstants.static
    }
  );
const GetGeneralLookup = (data) =>
  get(
    SERVICE_URLSV2.GeneralLookup + `?types=${data}`,
    {},
    {
      feature: featureConstants.static
    }
  );
const GetPatientByEmail = (data, flag) =>
  get(
    SERVICE_URLSV2.GetPatientByEmail + `?Email=${data}`,
    {},
    {
      feature: featureConstants.static,
      ApiVersion2Req: flag
    }
  );
const GetPatientDetailsById = (data, flag) =>
  get(
    SERVICE_URLSV2.GetPatientDetailsById + `?PatientId=${data}`,
    {},
    {
      feature: featureConstants.static,
      ApiVersion2Req: flag
    }
  );
const GetPatientEncounterDetails = (data, flag) =>
  get(
    `${SERVICE_URLSV2.GetPatientEncounterDetails}?&PatientId=${data?.PatientId}&dateflag=${data?.dateflag}&datefrom=${data?.datefrom}&dateto=${data?.dateto}`,
    {},
    {
      feature: featureConstants.static,
      ApiVersion2Req: flag
    }
  );
const GetPatientCCDADetail = (data) =>

  get(

    `${SERVICE_URLSV2.DownloadDocument}?&encounterId=${data?.encounterID}&humanReadable=${data?.humanReadable}`,
    {},
    {
      feature: featureConstants.static
    }
  );
const GetPatientCCDADetailCCDF = (data) =>

  get(

    `${SERVICE_URLSV2.DownloadDocument}?&encounterId=${data?.encounterID}&humanReadable=${data?.humanReadable}`,
    {},
    {
      feature: featureConstants.static
    }
  );
const GetServerTime = (data, flag) =>
  get(
    `${SERVICE_URLSV2.GetServerTime}`,
    {},
    {
      feature: featureConstants.static,
      ApiVersion2Req: flag
    }
  );
const GetPatientCCDAActivityLog = (data, flag) =>

  get(

    `${SERVICE_URLSV2.GetPatientCCDAActivityLog}?PatientId=${data?.PatientId}&Activity=${data?.Activity}&Daterange=${data?.Daterange}`,
    {},
    {
      feature: featureConstants.static,
      ApiVersion2Req: flag
    }
  );

const InsertActivityLog = (data, flag) =>

  post(

    SERVICE_URLSV2.InsertActivityLog, data,
    {
      feature: featureConstants.static,
      ApiVersion2Req: flag
    }
  );

const CreateAuthorizedUser = (data) =>

  post(

    SERVICE_URLSV2.CreateAuthorizedUser, data,
    {
      feature: featureConstants.static
    }
  );

const ShareDocument = (data) =>

  get(

    `${SERVICE_URLSV2.Share}?&encounterId=${data?.EncounterId}&emailAddress=${data?.PatientEmail}&message=${data?.message}&isSecure=${data?.includeCCD}`,
    {},
    {
      feature: featureConstants.static
    }
  );

const GetPatientAuthorizedUser = (data, flag) =>

  get(

    `${SERVICE_URLSV2.GetPatientAuthorizedUser}?PatientId=${data}`,
    {},
    {
      feature: featureConstants.static,
      ApiVersion2Req: flag
    }
  );

const GetPatientUserRequestByCode = (data) =>

  getWithoutToken(

    `${SERVICE_URLSV2.GetPatientUserRequestByCode}?&code=${data}`,
    {},
    {
      feature: featureConstants.static
    }
  );

const GenerateOtp = (data) =>

  getWithoutToken(

    `${SERVICE_URLSV2.GenerateOtp}?&code=${data}`,
    {},
    {
      feature: featureConstants.static
    }
  );


const UpdatePatientAuthorizedUserAccess = (data, flag) =>

  post(

    SERVICE_URLSV2.UpdatePatientAuthorizedUserAccess, data,
    {
      feature: featureConstants.static,
      ApiVersion2Req: flag
    }
  );

const AddPatientUser = (data) =>

  postWithoutToken(

    SERVICE_URLSV2.AddPatientUser, data,
    {
      feature: featureConstants.static
    }
  );

const GetToken = (data) =>

  getWithoutToken(

    `${SERVICE_URLSV2.GetToken}?&username=${data?.username}&password=${data?.password}`,
    {},
    {
      feature: featureConstants.static
    }
  );

const GetSharingModulesData = (data, flag) =>

  get(

    `${SERVICE_URLSV2.GetSharingModulesData}?PatientId=${data}`,
    {},
    {
      feature: featureConstants.static,
      ApiVersion2Req: flag
    }
  );

const UpdateSharingModulesData = (data, flag) =>

  get(

    `${SERVICE_URLSV2.UpdateSharingModulesData}?Data=${data}`,
    {},
    {
      feature: featureConstants.static,
      ApiVersion2Req: flag
    }
  );

const saveConsentForm = (data, flag) =>
  post(

    SERVICE_URLSV2.saveConsentForm, data,
    {

      feature: featureConstants.static,
      ApiVersion2Req: flag
    }
  );

const GetConsentFormData = (data, flag) =>

  get(

    `${SERVICE_URLSV2.GetConsentFormData}?PatientId=${data}`,
    {},
    {
      feature: featureConstants.static,
      ApiVersion2Req: flag
    }
  );

  const GetConsentFormContent = (data, flag) =>

  get(

    `${SERVICE_URLSV2.GetConsentFormContent}?&PatientId=${data?.PatientId}&FormID=${data?.FormID}`,
    {},
    {
      feature: featureConstants.static,
      ApiVersion2Req: flag
    }
  );
  



const apiServicesV2 = {
  GetGeneralLookup,
  ClearCahce,
  GetPatientByEmail,
  GetPatientDetailsById,
  GetPatientEncounterDetails,
  GetPatientCCDADetail,
  GetPatientCCDADetailCCDF,
  GetServerTime,
  GetPatientCCDAActivityLog,
  InsertActivityLog,
  CreateAuthorizedUser,
  ShareDocument,
  GetPatientAuthorizedUser,
  UpdatePatientAuthorizedUserAccess,
  GetPatientUserRequestByCode,
  GenerateOtp,
  AddPatientUser,
  GetToken,
  GetSharingModulesData,
  UpdateSharingModulesData,
  saveConsentForm,
  GetConsentFormData,
  GetConsentFormContent

};
export default apiServicesV2;
