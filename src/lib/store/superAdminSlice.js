import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchSuperOrganizations = createAsyncThunk('superAdmin/fetchSuperOrganizations', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/super/organizations');
    const data = await res.json();
    if (data.success) {
      return data.organizations || [];
    }
    throw new Error(data.error || 'Failed to fetch organizations');
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const createSuperOrganization = createAsyncThunk('superAdmin/createSuperOrganization', async (orgData, { dispatch, rejectWithValue }) => {
  try {
    const res = await fetch('/api/super/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orgData)
    });
    const data = await res.json();
    if (data.success) {
      dispatch(fetchSuperOrganizations());
      return data.organization;
    }
    throw new Error(data.error || 'Failed to create organization');
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  organizations: [],
  loading: false,
  error: null
};

const superAdminSlice = createSlice({
  name: 'superAdmin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuperOrganizations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSuperOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload;
      })
      .addCase(fetchSuperOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default superAdminSlice.reducer;
