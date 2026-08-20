import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiServicesV2 from '@/services/requestHandler';
import SnackbarUtils from '../content/snackbar';

const initialState = {
  appointmentReasons: [],
  appointmentReasonsLoading: false,
  appointmentReasonsError: null,
  providers: [],
  providersLoading: false,
  providersError: null
};

export const Searchappointmentreason: any = createAsyncThunk(
  'schedule/searchAppointmentReason',
  async (
    data: { searchTerm: string; practiceId?: string | number },
    thunkAPI
  ) => {
    try {
      const res = await apiServicesV2.Searchappointmentreason(
        data,
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
      });
  }
});

export const { clearAppointmentReasons, resetAppointmentReasonsError } =
  scheduleSlice.actions;
export default scheduleSlice.reducer;
