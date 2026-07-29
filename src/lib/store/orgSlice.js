import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../apiClient';

export const fetchOrgConfig = createAsyncThunk('org/fetchOrgConfig', async (_, { rejectWithValue }) => {
  try {
    const data = await apiClient.getOrganizationConfig();
    if (data.success) {
      return data.organization;
    }
    throw new Error(data.error || 'Failed to fetch organization config');
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateOrgConfig = createAsyncThunk('org/updateOrgConfig', async (payload, { rejectWithValue }) => {
  try {
    const body = Array.isArray(payload) ? { dynamicFields: payload } : payload;
    const data = await apiClient.updateOrganizationConfig(body);
    if (data.success) {
      return data;
    }
    throw new Error(data.error || 'Failed to update organization configuration');
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const DEFAULT_ENABLED_FIELDS = {
  allocatedHours: true,
  billedHours: true,
  actualHours: true,
  project: true,
  clickupId: true
};

export const BUILTIN_FIELD_LABELS = {
  actualHours: 'Actual Hours',
  allocatedHours: 'Allocated Hours',
  billedHours: 'Billed Hours',
  project: 'Project',
  clickupId: 'ClickUp Link'
};

const initialState = {
  organization: null,
  dynamicFields: [],
  enabledFields: DEFAULT_ENABLED_FIELDS,
  loading: false,
  error: null
};

const orgSlice = createSlice({
  name: 'org',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchOrgConfig
      .addCase(fetchOrgConfig.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrgConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.organization = action.payload;
        state.dynamicFields = action.payload?.dynamicFields || [];
        state.enabledFields = action.payload?.enabledFields || DEFAULT_ENABLED_FIELDS;
      })
      .addCase(fetchOrgConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateOrgConfig
      .addCase(updateOrgConfig.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrgConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.dynamicFields = action.payload.dynamicFields || [];
        state.enabledFields = action.payload.enabledFields || DEFAULT_ENABLED_FIELDS;
        if (state.organization) {
          state.organization.dynamicFields = action.payload.dynamicFields || [];
          state.organization.enabledFields = action.payload.enabledFields || DEFAULT_ENABLED_FIELDS;
        }
      })
      .addCase(updateOrgConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default orgSlice.reducer;
