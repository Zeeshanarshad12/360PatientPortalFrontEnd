/*eslint-disable*/
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiServicesV2 from '@/services/requestHandler';
import SnackbarUtils from '../content/snackbar';
import { setToken } from '@/utils/functions';
import Router from 'next/router';

const initialState = {
  PatientByEmailData: null,
  PatientByEmailDataLoader: false,
  PatientDetailsById: null,
  PatientDetailsByIdLoader: false,
  PatientEncounterData: null,
  PatientEncounterLoader: false,
  PatientCCDADetail: null,
  PatientCCDADetailLoader: false,
  PatientCCDADetailXMLF: null,
  PatientCCDADetailCCDFLoader: false,
  PatientCCDAActivityLog: null,
  PatientCCDAActivityLogLoader: false,
  patientEmail: null as string | null,
  InsertActivityLogData: null,
  InsertActivityLogLoader: false,
  clearcache: false,
  EncounterId: null,
  ShareDocumentData: null,
  ShareDocumentLoader: false,
  CreateAuthorizedUserData: null,
  CreateAuthorizedUserLoader: false,
  GetPatientAuthorizedUserData: null,
  GetPatientAuthorizedUserLoader: false,
  GetPatientUserRequestByCodeData: null,
  GetPatientUserRequestByCodeLoader: false,
  GenerateOtpData: null,
  GenerateOtpLoader: false,
  GetTokenData: null,
  GetTokenLoader: false,
  GetSharingModulesDataList: null,
  GetSharingModulesDataLoader: false,
  getServerTimeData: null,
  GetConsentFormDataList: null,
  GetConsentFormDataLoader: false
};

export const ClearCahceNLogout: any = createAsyncThunk(
  'ClearCahceNLogout',
  async (_data: any, _thunkAPI) => {
    const res = await apiServicesV2.ClearCahce();
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data?.result;
      }
    } catch (error) {}
  }
);
export const GetPatientByEmail: any = createAsyncThunk(
  'GetPatientByEmail',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.GetPatientByEmail(data, 'ApiVersion2Req');
    try {
      if (res?.status === 200 || res?.status === 201) {
        //Router.push('/patientportal/profile');
        return res?.data?.result;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);
export const GetPatientDetailsById: any = createAsyncThunk(
  'GetPatientDetailsById',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.GetPatientDetailsById(
      data,
      'ApiVersion2Req'
    );
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data?.result;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);
export const GetPatientEncounterDetails: any = createAsyncThunk(
  'GetPatientEncounterDetails',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.GetPatientEncounterDetails(
      data,
      'ApiVersion2Req'
    );

    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data?.result;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);
export const GetPatientCCDADetail: any = createAsyncThunk(
  'GetPatientCCDADetail',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.GetPatientCCDADetail(data);
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);
export const GetPatientCCDADetailCCDF: any = createAsyncThunk(
  'GetPatientCCDADetailCCDF',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.GetPatientCCDADetailCCDF(data);
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);
export const GetPatientCCDAActivityLog: any = createAsyncThunk(
  'GetPatientCCDAActivityLog',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.GetPatientCCDAActivityLog(
      data,
      'ApiVersion2Req'
    );
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);
export const InsertActivityLog: any = createAsyncThunk(
  'InsertActivityLog',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.InsertActivityLog(data, 'ApiVersion2Req');
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data.result;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);
export const GetServerTime: any = createAsyncThunk(
  'GetServerTime',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.GetServerTime(data);
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data.result;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);
export const CreateAuthorizedUser: any = createAsyncThunk(
  'CreateAuthorizedUser',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.CreateAuthorizedUser(data);
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data.result;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);
export const GetPatientAuthorizedUser: any = createAsyncThunk(
  'GetPatientAuthorizedUser',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.GetPatientAuthorizedUser(
      data,
      'ApiVersion2Req'
    );
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);
export const UpdatePatientAuthorizedUserAccess: any = createAsyncThunk(
  'UpdatePatientAuthorizedUserAccess',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.UpdatePatientAuthorizedUserAccess(
      data,
      'ApiVersion2Req'
    );
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const GetPatientUserRequestByCode: any = createAsyncThunk(
  'GetPatientUserRequestByCode',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.GetPatientUserRequestByCode(data);
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const GenerateOtp: any = createAsyncThunk(
  'GenerateOtp',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.GenerateOtp(data);
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const AddPatientUser: any = createAsyncThunk(
  'AddPatientUser',
  async (data, thunkAPI) => {
    try {
      const res = await apiServicesV2.AddPatientUser(data);
      if (res?.status === 200 || res?.status === 201) {
        return res?.data.result;
      }
    } catch (error: any) {
      const backendMessage =
        error?.data?.responseException?.exceptionMessage?.message ||
        error?.data?.message ||
        error?.message ||
        'Something went wrong';

      SnackbarUtils.error(backendMessage, false);

      return thunkAPI.rejectWithValue({
        message: backendMessage,
        data: error?.response?.data
      });
    }
  }
);

export const AddExistingUser: any = createAsyncThunk(
  'AddExistingUser',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.AddExistingUser(data);
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data.result;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const GetToken: any = createAsyncThunk(
  'GetToken',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.GetToken(data);
    try {
      if (res?.status === 200 || res?.status === 201) {
        const result = res?.data?.result;
        setToken(
          result?.access_token,
          result?.Email,
          result?.FirstName,
          result?.LastName,
          result?.UserAccessType,
          result?.PracticeName,
          result.PatientID,
          result.PracticeID,
          result.vdtAccess
        );

        if (result?.access_token) {
          Router.push('/patientportal/dashboard');
          return result;
        }
        return result;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const ShareDocument: any = createAsyncThunk(
  'ShareDocument',
  async (data) => {
    try {
      const res = await apiServicesV2.ShareDocument(data);
      if (res?.status === 200 || res?.status === 201) {
        return res.data;
      } else {
        return res.data;
      }
    } catch (error: any) {
      // Optional: log or transform the error
      return error?.data;
    }
  }
);

export const GetSharingModulesData: any = createAsyncThunk(
  'GetSharingModulesData',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.GetSharingModulesData(
      data,
      'ApiVersion2Req'
    );
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const UpdateSharingModulesData: any = createAsyncThunk(
  'UpdateSharingModulesData',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.UpdateSharingModulesData(
      data,
      'ApiVersion2Req'
    );
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const saveConsentForm: any = createAsyncThunk(
  'saveConsentForm',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.saveConsentForm(data, 'ApiVersion2Req');
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const GetConsentFormData: any = createAsyncThunk(
  'GetConsentFormData',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.GetConsentFormData(data, 'ApiVersion2Req');
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const GetConsentFormContent: any = createAsyncThunk(
  'GetConsentFormContent',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.GetConsentFormContent(
      data,
      'ApiVersion2Req'
    );
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const uploadAndSaveConsentFormDocument: any = createAsyncThunk(
  'uploadAndSaveConsentFormDocument',
  async (
    data: {
      patientId: string;
      practiceId: string;
      title: string;
      documentFile: File | null;
    },
    thunkAPI
  ) => {
    const { patientId, practiceId, title, documentFile } = data;

    if (!documentFile) {
      return thunkAPI.rejectWithValue('No document file to upload');
    }

    // Resolve document type ID for "Consent Form" using the same API as SidebarMenu
    let consentFormTypeId: number | null = null;
    try {
      const typeRes = await apiServicesV2.getAllDocumentTypes(
        {
          patientId: Number(patientId),
          practiceId: Number(practiceId),
          fromDate: '2000-01-01T00:00:00.000Z',
          toDate: new Date(Date.now() + 86400000).toISOString()
        },
        'ApiVersion2Req'
      );
      if (typeRes?.status === 200 || typeRes?.status === 201) {
        const types: any[] = typeRes?.data?.result ?? [];
        outer: for (const parent of types) {
          const subs: any[] = parent?.documentSubTypes ?? [];
          for (const sub of subs) {
            if (
              typeof sub?.name === 'string' &&
              sub.name.toLowerCase().includes('consent') &&
              !sub.isDeleted
            ) {
              consentFormTypeId = sub.id;
              break outer;
            }
          }
          if (
            typeof parent?.name === 'string' &&
            parent.name.toLowerCase().includes('consent') &&
            !parent.isDeleted
          ) {
            consentFormTypeId = parent.id;
            break;
          }
        }
      }
    } catch {
      // Continue with upload even if type lookup fails
    }

    // Skip upload if a document with the same title already exists for this patient
    // (prevents duplicate when the backend's SubmitConsentForm also creates a document)
    if (consentFormTypeId !== null) {
      try {
        const existingRes = await apiServicesV2.getAllSelectedDocuments(
          {
            patientId: Number(patientId),
            practiceId: Number(practiceId),
            documentTypeId: consentFormTypeId,
            fromDate: '2000-01-01',
            toDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
          },
          'ApiVersion2Req'
        );
        if (existingRes?.status === 200 || existingRes?.status === 201) {
          const existingDocs: any[] = existingRes?.data?.result ?? [];
          const alreadyExists = existingDocs.some(
            (doc: any) =>
              doc.documentName === title || doc.displayName === title
          );
          if (alreadyExists) {
            return { success: true };
          }
        }
      } catch {
        // Continue with upload if the existence check fails
      }
    }

    const formData = new FormData();
    formData.append('files', documentFile);

    try {
      const uploadRes = await apiServicesV2.UploadPatientDocument(formData);
      if (uploadRes?.status !== 200 && uploadRes?.status !== 201) {
        return thunkAPI.rejectWithValue('Document upload failed');
      }

      const documentUri = uploadRes?.data?.result?.[0]?.documentName;

      const addRes = await apiServicesV2.AddDocument({
        patientId: Number(patientId),
        practiceId: Number(practiceId),
        displayName: title,
        documentName: title,
        fileName: documentFile.name,
        extension: 'pdf',
        ...(consentFormTypeId !== null && { documentType: consentFormTypeId }),
        documentUri,
        sizeInBytes: documentFile.size,
        signed: true,
        showOnPortal: true,
        isActive: true,
        date: new Date().toISOString(),
        shareWithPatient: true,
        isIncomingReferral: false,
        comments: '',
        assignedUsers: []
      });

      if (addRes?.status === 200 || addRes?.status === 201) {
        return { success: true };
      }
      return thunkAPI.rejectWithValue('Failed to save document metadata');
    } catch {
      return thunkAPI.rejectWithValue('Document upload failed');
    }
  }
);

export const GetPatientActiveMedications: any = createAsyncThunk(
  'GetPatientActiveMedications',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.GetPatientActiveMedications(
      data,
      'ApiVersion2Req'
    );
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const GetPatientAllergies: any = createAsyncThunk(
  'GetPatientAllergies',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.GetPatientAllergies(data, 'ApiVersion2Req');
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const getpatientvitals: any = createAsyncThunk(
  'getpatientvitals',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.getpatientvitals(data, 'ApiVersion2Req');
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const getpatientproblems: any = createAsyncThunk(
  'getpatientproblems',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.getpatientproblems(data, 'ApiVersion2Req');
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const getpatientappointments: any = createAsyncThunk(
  'getpatientappointments',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.getpatientappointments(
      data,
      'ApiVersion2Req'
    );
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const getunsignedlabordertestbypatientid: any = createAsyncThunk(
  'getunsignedlabordertestbypatientid',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.getunsignedlabordertestbypatientid(
      data,
      'ApiVersion2Req'
    );
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const getdashboardconfigurations: any = createAsyncThunk(
  'getdashboardconfigurations',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.getdashboardconfigurations(
      data,
      'ApiVersion2Req'
    );
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const saveDashboardConfiguration: any = createAsyncThunk(
  'saveDashboardConfiguration',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.saveDashboardConfiguration(
      data,
      'ApiVersion2Req'
    );
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const getAllDocumentTypes: any = createAsyncThunk(
  'getAllDocumentTypes',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.getAllDocumentTypes(data, 'ApiVersion2Req');
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const getAllSelectedDocuments: any = createAsyncThunk(
  'getAllSelectedDocuments',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.getAllSelectedDocuments(
      data,
      'ApiVersion2Req'
    );
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const getPatientDocumentInfo: any = createAsyncThunk(
  'getPatientDocumentInfo',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.getPatientDocumentInfo(
      data,
      'ApiVersion2Req'
    );
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const getDownloadPatientDocument: any = createAsyncThunk(
  'getDownloadPatientDocument',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.getDownloadPatientDocument(
      data,
      'ApiVersion2Req'
    );
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const generateResetPasswordOtp: any = createAsyncThunk(
  'generateResetPasswordOtp',
  async (data, thunkAPI) => {
    try {
      const res = await apiServicesV2.generateResetPasswordOtp(
        data,
        'ApiVersion2Req'
      );
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      } else {
        return res.data;
      }
    } catch (error: any) {
      const errorData = error?.response?.data || error?.data;
      const errorMessage =
        errorData?.responseException?.exceptionMessage ||
        errorData?.message ||
        'Something went wrong';

      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);
export const generateCodeResetPassword: any = createAsyncThunk(
  'generateCodeResetPassword',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.generateCodeResetPassword(
      data,
      'ApiVersion2Req'
    );
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data;
      }
    } catch (error) {
      const err: any = thunkAPI.rejectWithValue(error);
      if (err?.payload?.status !== 200) {
        SnackbarUtils.error(err?.payload?.data?.message, false);
      }
    }
  }
);

export const resetPatientPassword: any = createAsyncThunk(
  'resetPatientPassword',
  async (data, thunkAPI) => {
    try {
      const res = await apiServicesV2.resetPatientPassword(
        data,
        'ApiVersion2Req'
      );
      if (res?.data != null && res?.data?.result === true) {
        return res?.data;
      }

      const errorMessage =
        res?.data?.responseException?.exceptionMessage?.message ??
        res?.data?.message ??
        'Error occurred. Please try again.';

      return thunkAPI.rejectWithValue({ message: errorMessage });
    } catch (error: any) {
      const errorMessage =
        error?.data?.responseException?.exceptionMessage?.message ??
        error?.data?.message ??
        'Error occurred. Please try again.';

      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

export const resetAuth0PatientPassword: any = createAsyncThunk(
  'resetAuth0PatientPassword',
  async (data, thunkAPI) => {
    try {
      const res = await apiServicesV2.resetAuth0PatientPassword(
        data,
        'ApiVersion2Req'
      );

      if (res?.data != null && res?.data?.result === true) {
        return res?.data;
      }

      const errorMessage =
        res?.data?.responseException?.exceptionMessage?.message ??
        res?.data?.message ??
        'Error occurred. Please try again.';

      return thunkAPI.rejectWithValue({ message: errorMessage });
    } catch (error: any) {
      const errorMessage =
        error?.data?.responseException?.exceptionMessage?.message ??
        error?.data?.message ??
        'Error occurred. Please try again.';

      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

const patientProfileSlice = createSlice({
  name: 'Patient Profile Slice',
  initialState: initialState,
  reducers: {
    setEncounterId: (state: any, { payload }) => {
      state.EncounterId = payload;
    }
  },
  extraReducers: {
    [GetPatientByEmail.pending]: (state: any) => {
      state.PatientByEmailDataLoader = true;
    },
    [GetPatientByEmail.fulfilled]: (state: any, { payload, meta }: any) => {
      state.PatientByEmailData = payload;
      state.PatientByEmailDataLoader = false;
      state.patientEmail = meta?.arg ?? null;
    },
    [GetPatientByEmail.rejected]: (state: any) => {
      state.PatientByEmailDataLoader = false;
    },

    [GetPatientDetailsById.pending]: (state: any) => {
      state.PatientDetailsByIdLoader = true;
    },
    [GetPatientDetailsById.fulfilled]: (state: any, { payload }: any) => {
      state.PatientDetailsById = payload;
      state.PatientDetailsByIdLoader = false;
    },
    [GetPatientDetailsById.rejected]: (state: any) => {
      state.PatientDetailsByIdLoader = false;
    },

    [GetPatientEncounterDetails.pending]: (state: any) => {
      state.PatientEncounterLoader = true;
    },
    [GetPatientEncounterDetails.fulfilled]: (state: any, { payload }: any) => {
      state.PatientEncounterData = [];
      state.PatientEncounterData = payload;
      state.PatientEncounterLoader = false;
    },
    [GetPatientEncounterDetails.rejected]: (state: any) => {
      state.PatientEncounterLoader = false;
    },

    [GetPatientCCDADetail.pending]: (state: any) => {
      state.PatientCCDADetailLoader = true;
    },
    [GetPatientCCDADetail.fulfilled]: (state: any, { payload }: any) => {
      state.PatientCCDADetail = payload;
      state.PatientCCDADetailLoader = false;
    },
    [GetPatientCCDADetail.rejected]: (state: any) => {
      state.PatientCCDADetailLoader = false;
    },

    [GetPatientCCDADetailCCDF.pending]: (state: any) => {
      state.PatientCCDADetailCCDFLoader = true;
    },
    [GetPatientCCDADetailCCDF.fulfilled]: (state: any, { payload }: any) => {
      state.PatientCCDADetailXMLF = payload;
      state.PatientCCDADetailCCDFLoader = false;
    },
    [GetPatientCCDADetailCCDF.rejected]: (state: any) => {
      state.PatientCCDADetailCCDFLoader = false;
    },

    [GetPatientCCDAActivityLog.pending]: (state: any) => {
      state.PatientCCDAActivityLogLoader = true;
    },
    [GetPatientCCDAActivityLog.fulfilled]: (state: any, { payload }: any) => {
      state.PatientCCDAActivityLog = payload;
      state.PatientCCDAActivityLogLoader = false;
    },
    [GetPatientCCDAActivityLog.rejected]: (state: any) => {
      state.PatientCCDAActivityLogLoader = false;
    },

    [InsertActivityLog.pending]: (state: any) => {
      state.InsertActivityLogLoader = true;
    },
    [InsertActivityLog.fulfilled]: (state: any, { payload }: any) => {
      state.InsertActivityLogData = payload;
      state.InsertActivityLogLoader = false;
    },
    [InsertActivityLog.rejected]: (state: any) => {
      state.InsertActivityLogLoader = false;
    },

    [CreateAuthorizedUser.pending]: (state: any) => {
      state.CreateAuthorizedUserLoader = true;
    },
    [CreateAuthorizedUser.fulfilled]: (state: any, { payload }: any) => {
      state.CreateAuthorizedUserData = payload;
      state.CreateAuthorizedUserLoader = false;
    },
    [CreateAuthorizedUser.rejected]: (state: any) => {
      state.CreateAuthorizedUserLoader = false;
    },

    [ShareDocument.pending]: (state: any) => {
      state.ShareDocumentLoader = true;
    },
    [ShareDocument.fulfilled]: (state: any, { payload }: any) => {
      state.ShareDocumentData = null;
      state.ShareDocumentData = payload;
      state.ShareDocumentLoader = false;
    },
    [ShareDocument.rejected]: (state: any) => {
      state.ShareDocumentLoader = false;
    },

    [GetPatientAuthorizedUser.pending]: (state: any) => {
      state.GetPatientAuthorizedUserLoader = true;
    },
    [GetPatientAuthorizedUser.fulfilled]: (state: any, { payload }: any) => {
      state.GetPatientAuthorizedUserData = payload;
      state.GetPatientAuthorizedUserLoader = false;
    },
    [GetPatientAuthorizedUser.rejected]: (state: any) => {
      state.GetPatientAuthorizedUserLoader = false;
    },

    // GetServerTime Request Handling
    [GetServerTime.pending]: (state: any) => {
      state.getServerTimeData = null;
    },
    [GetServerTime.fulfilled]: (state: any, { payload }: any) => {
      state.getServerTimeData = payload;
    },
    [GetServerTime.rejected]: (state: any) => {
      state.getServerTimeData = null;
    },

    [GetPatientUserRequestByCode.pending]: (state: any) => {
      state.GetPatientUserRequestByCodeLoader = true;
    },
    [GetPatientUserRequestByCode.fulfilled]: (state: any, { payload }: any) => {
      state.GetPatientUserRequestByCodeData = payload;
      state.GetPatientUserRequestByCodeLoader = false;
    },
    [GetPatientUserRequestByCode.rejected]: (state: any) => {
      state.GetPatientUserRequestByCodeLoader = false;
    },

    [GenerateOtp.pending]: (state: any) => {
      state.GenerateOtpLoader = true;
    },
    [GenerateOtp.fulfilled]: (state: any, { payload }: any) => {
      state.GenerateOtpData = payload;
      state.GenerateOtpLoader = false;
    },
    [GenerateOtp.rejected]: (state: any) => {
      state.GenerateOtpLoader = false;
    },

    [GetToken.pending]: (state: any) => {
      state.GetTokenLoader = true;
    },
    [GetToken.fulfilled]: (state: any, { payload }: any) => {
      state.GetTokenData = payload;
      state.GetTokenLoader = false;
    },
    [GetToken.rejected]: (state: any) => {
      state.GetTokenLoader = false;
    },

    [GetSharingModulesData.pending]: (state: any) => {
      state.GetSharingModulesDataLoader = true;
    },
    [GetSharingModulesData.fulfilled]: (state: any, { payload }: any) => {
      state.GetSharingModulesDataList = payload;
      state.GetSharingModulesDataLoader = false;
    },
    [GetSharingModulesData.rejected]: (state: any) => {
      state.GetSharingModulesDataLoader = false;
    },

    [GetConsentFormData.pending]: (state: any) => {
      state.GetConsentFormDataLoader = true;
    },
    [GetConsentFormData.fulfilled]: (state: any, { payload }: any) => {
      state.GetConsentFormDataList = payload;
      state.GetConsentFormDataLoader = false;
    },
    [GetConsentFormData.rejected]: (state: any) => {
      state.GetConsentFormDataLoader = false;
    },

    [ClearCahceNLogout.pending]: (state: any) => {
      state.clearcache = true;
    },
    [ClearCahceNLogout.fulfilled]: (state: any, { payload }: any) => {
      state.clearcache = false;
    },
    [ClearCahceNLogout.rejected]: (state: any) => {
      state.clearcache = false;
    }
  }
});

export const patientProfileReducer = patientProfileSlice.reducer;
export const { setEncounterId } = patientProfileSlice.actions;
