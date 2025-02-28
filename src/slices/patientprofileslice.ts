/*eslint-disable*/
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiServicesV2 from '@/services/requestHandler';
import SnackbarUtils from '../content/snackbar';

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
  EncounterId:null,
  ShareDocumentData: null,
  ShareDocumentLoader: false,
  CreateAuthorizedUserData: null,
  CreateAuthorizedUserLoader: false,
};

export const ClearCahceNLogout: any = createAsyncThunk(
  'ClearCahceNLogout',
  async (_data: any, _thunkAPI) => {
    const res = await apiServicesV2.ClearCahce();
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data?.result;
      }
    } catch (error) { }
  }
);
export const GetPatientByEmail: any = createAsyncThunk(
  'GetPatientByEmail',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.GetPatientByEmail(data, 'ApiVersion2Req');
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
export const GetPatientDetailsById: any = createAsyncThunk(
  'GetPatientDetailsById',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.GetPatientDetailsById(data, 'ApiVersion2Req');
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
    const res = await apiServicesV2.GetPatientEncounterDetails(data, 'ApiVersion2Req');
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
    const res = await apiServicesV2.GetPatientCCDAActivityLog(data, 'ApiVersion2Req');
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
) ;
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
export const CreateAuthorizedUser: any = createAsyncThunk(
  'CreateAuthorizedUser',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.CreateAuthorizedUser(data, 'ApiVersion2Req'); 
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
export const ShareDocument: any = createAsyncThunk(
  'ShareDocument',
  async (data, thunkAPI) => {
    const res = await apiServicesV2.ShareDocument(data);
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
  reducers: {setEncounterId: (state: any, { payload }) => {
    state.EncounterId = payload;
  },},
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
      state.ShareDocumentData = payload;
      state.ShareDocumentLoader = false;
    },
    [ShareDocument.rejected]: (state: any) => {
      state.ShareDocumentLoader = false;
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
