import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../apiClient';

export const fetchAdminData = createAsyncThunk('admin/fetchAdminData', async (_, { rejectWithValue }) => {
  try {
    const data = await apiClient.getAdminData();
    if (data.success) {
      return data;
    }
    throw new Error(data.error || 'Failed to fetch admin data');
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateStatuses = createAsyncThunk('admin/updateStatuses', async (statuses, { rejectWithValue }) => {
  try {
    const data = await apiClient.updateStatuses(statuses);
    if (data.success) {
      return data.statuses;
    }
    throw new Error(data.error || 'Failed to update statuses');
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchOrgUsers = createAsyncThunk('admin/fetchOrgUsers', async (_, { rejectWithValue }) => {
  try {
    const data = await apiClient.getOrganizationUsers();
    if (data.success) {
      return data.users || [];
    }
    throw new Error(data.error || 'Failed to fetch team users');
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const createOrgUser = createAsyncThunk('admin/createOrgUser', async (userData, { dispatch, rejectWithValue }) => {
  try {
    const data = await apiClient.createOrganizationUser(userData);
    if (data.success) {
      dispatch(fetchOrgUsers());
      return data.user;
    }
    throw new Error(data.error || 'Failed to create team user');
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  adminData: null,
  statuses: [],
  orgUsers: [],
  loading: false,
  error: null
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchAdminData
      .addCase(fetchAdminData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminData.fulfilled, (state, action) => {
        state.loading = false;
        state.adminData = action.payload;
        state.statuses = action.payload.statuses || [];
      })
      .addCase(fetchAdminData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateStatuses
      .addCase(updateStatuses.fulfilled, (state, action) => {
        state.statuses = action.payload;
      })
      // fetchOrgUsers
      .addCase(fetchOrgUsers.fulfilled, (state, action) => {
        state.orgUsers = action.payload;
      });
  }
});

export default adminSlice.reducer;
