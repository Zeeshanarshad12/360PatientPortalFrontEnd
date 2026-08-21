import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiServicesV2 from '@/services/requestHandler';
import SnackbarUtils from '../content/snackbar';

const initialState = {
  appointmentReasons: [],
  appointmentReasonsLoading: false,
  appointmentReasonsError: null,
  providers: [],
  providersLoading: false,
  providersError: null,
  locations: [],
  locationsLoading: false,
  locationsError: null,
  selectedLocation: null,
  providerScheduleInfo: null,
  providerScheduleInfoLoading: false,
  providerScheduleInfoError: null,
  createAppointmentLoading: false,
  createAppointmentError: null,
  createdAppointment: null,
  updateAppointmentLoading: false,
  updateAppointmentError: null,
  updatedAppointment: null,
  filteredAppointments: [],
  filteredAppointmentsLoading: false,
  filteredAppointmentsError: null,
  appointmentTypes: [],
  appointmentTypesLoading: false,
  appointmentTypesError: null,
  deleteAppointmentLoading: false,
  deleteAppointmentError: null
};

export const Searchappointmentreason: any = createAsyncThunk(
  'schedule/searchAppointmentReason',
  async (
    data: {
      searchTerm: string;
      practiceId?: string | number;
      patientOnly?: boolean;
    },
    thunkAPI
  ) => {
    try {
      const res = await apiServicesV2.Searchappointmentreason(
        { ...data, patientOnly: data.patientOnly ?? true },
        'ApiVersion2Req'
      );
      if (res?.status === 200) {
        return res?.data?.result;
      } else {
        return thunkAPI.rejectWithValue(
          res?.data?.message || 'Failed to fetch reasons'
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'An error occurred';
      SnackbarUtils.error(errorMessage, false);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const GetProvidersbyPracticeID: any = createAsyncThunk(
  'schedule/getProvidersbyPracticeID',
  async (data: { practiceId?: string | number }, thunkAPI) => {
    try {
      const res = await apiServicesV2.GetProvidersbyPracticeID(
        data,
        'ApiVersion2Req'
      );
      if (res?.status === 200) {
        return res?.data?.result;
      } else {
        return thunkAPI.rejectWithValue(
          res?.data?.message || 'Failed to fetch providers'
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'An error occurred';
      SnackbarUtils.error(errorMessage, false);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const GetPracticeLocationForPatient: any = createAsyncThunk(
  'schedule/getPracticeLocationForPatient',
  async (data: { practiceId?: string | number }, thunkAPI) => {
    try {
      const res = await apiServicesV2.GetPracticeLocationForPatient(
        data,
        'ApiVersion2Req'
      );
      if (res?.status === 200) {
        return res?.data?.result;
      } else {
        return thunkAPI.rejectWithValue(
          res?.data?.message || 'Failed to fetch practice locations'
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'An error occurred';
      SnackbarUtils.error(errorMessage, false);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const GetProviderLocationScheduleInfo: any = createAsyncThunk(
  'schedule/getProviderLocationScheduleInfo',
  async (
    data: { providerIds: Array<string | number>; locationId?: string | number;PracticeId?: string | number },
    thunkAPI
  ) => {
    try {
      const res = await apiServicesV2.GetProviderLocationScheduleInfo(
        data,
        'ApiVersion2Req'
      );
      if (res?.status === 200) {
        return res?.data?.result;
      } else {
        return thunkAPI.rejectWithValue(
          res?.data?.message || 'Failed to fetch provider schedule'
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'An error occurred';
      SnackbarUtils.error(errorMessage, false);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const CreatePatientAppointment: any = createAsyncThunk(
  'schedule/createPatientAppointment',
  async (data: Record<string, any>, thunkAPI) => {
    try {
      const res = await apiServicesV2.CreatePatientAppointment(
        data,
        'ApiVersion2Req'
      );
      if (res?.status === 200) {
        return res?.data?.result;
      } else {
        return thunkAPI.rejectWithValue(
          res?.data?.message || 'Failed to create appointment'
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'An error occurred';
      SnackbarUtils.error(errorMessage, false);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const UpdatePatientAppointment: any = createAsyncThunk(
  'schedule/updatePatientAppointment',
  async (data: Record<string, any>, thunkAPI) => {
    try {
      debugger;
      const res = await apiServicesV2.UpdatePatientAppointment(
        data,
        'ApiVersion2Req'
      );
      if (res?.status === 200) {
        return res?.data?.result;
      } else {
        return thunkAPI.rejectWithValue(
          res?.data?.message || 'Failed to reschedule appointment'
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'An error occurred';
      SnackbarUtils.error(errorMessage, false);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const FilterAppointments: any = createAsyncThunk(
  'schedule/filterAppointments',
  async (data: Record<string, any>, thunkAPI) => {
    try {
      const res = await apiServicesV2.FilterAppointments(data, 'ApiVersion2Req');
      if (res?.status === 200) {
        return res?.data?.result?.appointmentScreenResults || [];
      } else {
        return thunkAPI.rejectWithValue(
          res?.data?.message || 'Failed to fetch appointments'
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'An error occurred';
      SnackbarUtils.error(errorMessage, false);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const GetAllAppointmentType: any = createAsyncThunk(
  'schedule/getAllAppointmentType',
  async (data: { PracticeId?: string | number }, thunkAPI) => {
    try {
      const res = await apiServicesV2.GetAllAppointmentType(
        {
          PracticeId: data.PracticeId,
          orderColumn: 'text',
          orderDirection: 'asc',
          pageNum: 1,
          pageSize: 1000
        },
        'ApiVersion2Req'
      );
      if (res?.status === 200) {
        const result = res?.data?.result;
        return Array.isArray(result)
          ? result
          : result?.appointmentTypes ||
              result?.items ||
              result?.data ||
              result?.list ||
              [];
      } else {
        return thunkAPI.rejectWithValue(
          res?.data?.message || 'Failed to fetch appointment types'
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'An error occurred';
      SnackbarUtils.error(errorMessage, false);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const DeleteAppointmentById: any = createAsyncThunk(
  'schedule/deleteAppointmentById',
  async (
    data: { appointmentId: string | number; series?: boolean },
    thunkAPI
  ) => {
    try {
      const res = await apiServicesV2.DeleteAppointmentById(
        { appointmentId: data.appointmentId, series: data.series ?? false },
        'ApiVersion2Req'
      );
      if (res?.status === 200) {
        return res?.data?.result;
      } else {
        return thunkAPI.rejectWithValue(
          res?.data?.message || 'Failed to cancel appointment'
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'An error occurred';
      SnackbarUtils.error(errorMessage, false);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    clearAppointmentReasons: (state) => {
      state.appointmentReasons = [];
      state.appointmentReasonsError = null;
    },
    resetAppointmentReasonsError: (state) => {
      state.appointmentReasonsError = null;
    },
    resetDeleteAppointmentError: (state) => {
      state.deleteAppointmentError = null;
    },
    setSelectedLocation: (state, action) => {
      state.selectedLocation = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(Searchappointmentreason.pending, (state) => {
        state.appointmentReasonsLoading = true;
        state.appointmentReasonsError = null;
      })
      .addCase(Searchappointmentreason.fulfilled, (state, action) => {
        state.appointmentReasonsLoading = false;
        state.appointmentReasons = action.payload || [];
      })
      .addCase(Searchappointmentreason.rejected, (state, action) => {
        state.appointmentReasonsLoading = false;
        state.appointmentReasonsError = action.payload as string;
      })
      .addCase(GetProvidersbyPracticeID.pending, (state) => {
        state.providersLoading = true;
        state.providersError = null;
      })
      .addCase(GetProvidersbyPracticeID.fulfilled, (state, action) => {
        state.providersLoading = false;
        state.providers = action.payload || [];
      })
      .addCase(GetProvidersbyPracticeID.rejected, (state, action) => {
        state.providersLoading = false;
        state.providersError = action.payload as string;
      })
      .addCase(GetPracticeLocationForPatient.pending, (state) => {
        state.locationsLoading = true;
        state.locationsError = null;
      })
      .addCase(GetPracticeLocationForPatient.fulfilled, (state, action) => {
        state.locationsLoading = false;
        state.locations = action.payload || [];
      })
      .addCase(GetPracticeLocationForPatient.rejected, (state, action) => {
        state.locationsLoading = false;
        state.locationsError = action.payload as string;
      })
      .addCase(GetProviderLocationScheduleInfo.pending, (state) => {
        state.providerScheduleInfoLoading = true;
        state.providerScheduleInfoError = null;
      })
      .addCase(GetProviderLocationScheduleInfo.fulfilled, (state, action) => {
        state.providerScheduleInfoLoading = false;
        state.providerScheduleInfo = action.payload || null;
      })
      .addCase(GetProviderLocationScheduleInfo.rejected, (state, action) => {
        state.providerScheduleInfoLoading = false;
        state.providerScheduleInfoError = action.payload as string;
      })
      .addCase(CreatePatientAppointment.pending, (state) => {
        state.createAppointmentLoading = true;
        state.createAppointmentError = null;
        state.createdAppointment = null;
      })
      .addCase(CreatePatientAppointment.fulfilled, (state, action) => {
        state.createAppointmentLoading = false;
        state.createdAppointment = action.payload || null;
      })
      .addCase(CreatePatientAppointment.rejected, (state, action) => {
        state.createAppointmentLoading = false;
        state.createAppointmentError = action.payload as string;
      })
      .addCase(UpdatePatientAppointment.pending, (state) => {
        state.updateAppointmentLoading = true;
        state.updateAppointmentError = null;
        state.updatedAppointment = null;
      })
      .addCase(UpdatePatientAppointment.fulfilled, (state, action) => {
        state.updateAppointmentLoading = false;
        state.updatedAppointment = action.payload || null;
      })
      .addCase(UpdatePatientAppointment.rejected, (state, action) => {
        state.updateAppointmentLoading = false;
        state.updateAppointmentError = action.payload as string;
      })
      .addCase(FilterAppointments.pending, (state) => {
        state.filteredAppointmentsLoading = true;
        state.filteredAppointmentsError = null;
      })
      .addCase(FilterAppointments.fulfilled, (state, action) => {
        state.filteredAppointmentsLoading = false;
        state.filteredAppointments = action.payload || [];
      })
      .addCase(FilterAppointments.rejected, (state, action) => {
        state.filteredAppointmentsLoading = false;
        state.filteredAppointmentsError = action.payload as string;
      })
      .addCase(GetAllAppointmentType.pending, (state) => {
        state.appointmentTypesLoading = true;
        state.appointmentTypesError = null;
      })
      .addCase(GetAllAppointmentType.fulfilled, (state, action) => {
        state.appointmentTypesLoading = false;
        state.appointmentTypes = action.payload || [];
      })
      .addCase(GetAllAppointmentType.rejected, (state, action) => {
        state.appointmentTypesLoading = false;
        state.appointmentTypesError = action.payload as string;
      })
      .addCase(DeleteAppointmentById.pending, (state) => {
        state.deleteAppointmentLoading = true;
        state.deleteAppointmentError = null;
      })
      .addCase(DeleteAppointmentById.fulfilled, (state) => {
        state.deleteAppointmentLoading = false;
      })
      .addCase(DeleteAppointmentById.rejected, (state, action) => {
        state.deleteAppointmentLoading = false;
        state.deleteAppointmentError = action.payload as string;
      });
  }
});

export const {
  clearAppointmentReasons,
  resetAppointmentReasonsError,
  resetDeleteAppointmentError,
  setSelectedLocation
} = scheduleSlice.actions;
export default scheduleSlice.reducer;
