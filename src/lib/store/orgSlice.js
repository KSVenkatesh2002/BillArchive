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

export const updateOrgConfig = createAsyncThunk('org/updateOrgConfig', async (dynamicFields, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/organization/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dynamicFields })
    });
    const data = await res.json();
    if (data.success) {
      return data.dynamicFields;
    }
    throw new Error(data.error || 'Failed to update organization configuration');
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  organization: null,
  dynamicFields: [],
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
        state.dynamicFields = action.payload;
        if (state.organization) {
          state.organization.dynamicFields = action.payload;
        }
      })
      .addCase(updateOrgConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default orgSlice.reducer;
