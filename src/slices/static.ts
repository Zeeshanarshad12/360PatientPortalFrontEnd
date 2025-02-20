/*eslint-disable*/
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiServices2 from '@/services/requestHandler';
import SnackbarUtils from '../content/snackbar';

const initialState = {
  GeneralLookupData: null,
  GeneralLookupDataLoader: false,
  clearcache: false
};

export const ClearCahceNLogout: any = createAsyncThunk(
  'ClearCahceNLogout',
  async (_data: any, _thunkAPI) => {
    const res = await apiServices2.ClearCahce();
    try {
      if (res?.status === 200 || res?.status === 201) {
        return res?.data?.result;
      }
    } catch (error) {}
  }
);

export const GetGeneralLookup: any = createAsyncThunk(
  'GetGeneralLookup',
  async (data, thunkAPI) => {
    const res = await apiServices2.GetGeneralLookup(data);
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

const staticSlice = createSlice({
  name: 'Static Slice',
  initialState: initialState,
  reducers: {},
  extraReducers: {
    [GetGeneralLookup.pending]: (state: any) => {
      state.GeneralLookupDataLoader = true;
    },
    [GetGeneralLookup.fulfilled]: (state: any, { payload }) => {
      state.GeneralLookupData = payload;
      state.GeneralLookupDataLoader = false;
    },
    [GetGeneralLookup.rejected]: (state: any) => {
      state.GeneralLookupDataLoader = false;
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

export const staticReducer = staticSlice.reducer;
