import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../apiClient';

export const fetchReport = createAsyncThunk(
  'reports/fetchReport',
  async ({ timeframe = 'all', project = null }, { rejectWithValue }) => {
    try {
      const data = await apiClient.getReport(timeframe, project);
      if (data.success) {
        return data.report;
      }
      throw new Error(data.error || 'Failed to fetch report');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  activeReport: null,
  reportModalOpen: false,
  reportModalTimeframe: 'all',
  reportModalProject: 'all',
  loading: false,
  error: null
};

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    openReportModal: (state, action) => {
      const { timeframe = 'all', project = 'all' } = action.payload || {};
      state.reportModalTimeframe = timeframe;
      state.reportModalProject = project;
      state.reportModalOpen = true;
    },
    closeReportModal: (state) => {
      state.reportModalOpen = false;
      state.activeReport = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.loading = false;
        state.activeReport = action.payload;
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { openReportModal, closeReportModal } = reportSlice.actions;
export default reportSlice.reducer;
