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
    const res = await apiServicesV2.AddPatientUser(data);
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
        setToken(
          res?.data?.result?.access_token,
          res?.data?.result?.Email,
          res?.data?.result?.FirstName,
          res?.data?.result?.LastName,
          res?.data?.result?.UserAccessType,
          res?.data?.result?.PracticeName
        );
        if (res?.data?.result?.access_token) {
          Router.push('/patientportal/dashboard');
          return res?.data.result;
        }
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
    [GetPatientByEmail.fulfilled]: (state: any, { payload }) => {
      state.PatientByEmailData = payload;
      state.PatientByEmailDataLoader = false;
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
