import { get, post } from './HttpProvider';
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
  const GetPatientByEmail = (data,flag) =>
    get(
      SERVICE_URLSV2.GetPatientByEmail + `?Email=${data}`,
      {},
      {
        feature: featureConstants.static,
        ApiVersion2Req: flag
      }
    );
    const GetPatientDetailsById = (data,flag) =>
      get(
        SERVICE_URLSV2.GetPatientDetailsById + `?PatientId=${data}`,
        {},
        {
          feature: featureConstants.static,
          ApiVersion2Req: flag
        }
      );
    const GetPatientEncounterDetails = (data,flag) =>
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
      const GetPatientCCDAActivityLog = (data,flag) =>
    
        get(
          
          `${SERVICE_URLSV2.GetPatientCCDAActivityLog}?PatientId=${data?.PatientId}&Activity=${data?.Activity}&Daterange=${data?.Daterange}`,
          {},
          {
            feature: featureConstants.static,
            ApiVersion2Req: flag
          }
        );

        const InsertActivityLog = (data,flag) =>
    
          post(
            
            SERVICE_URLSV2.InsertActivityLog, data,
            {
              feature: featureConstants.static,
              ApiVersion2Req: flag
            }
          );    
          
       const ShareDocument = (data) =>
   
         get(
           
          `${SERVICE_URLSV2.Share}?&encounterId=${data?.EncounterId}&emailAddress=${data?.PatientEmail}`,
           {},
           {
             feature: featureConstants.static
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
  GetPatientCCDAActivityLog,
  InsertActivityLog,
  ShareDocument
  
};
export default apiServicesV2;
