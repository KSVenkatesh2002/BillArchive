import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchOrgConfig = createAsyncThunk('org/fetchOrgConfig', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/organization/config');
    const data = await res.json();
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
    const res = await fetch('/api/organization/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      return data;
    }
    throw new Error(data.error || 'Failed to update organization configuration');
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const DEFAULT_ENABLED_FIELDS = {
  allocatedHours: true,
  billedHours: true,
  actualHours: true,
  source: true,
  typeOfWork: true,
  project: true,
  clickupId: true
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
