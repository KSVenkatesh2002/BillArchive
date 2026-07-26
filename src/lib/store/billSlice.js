import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../apiClient';

export const fetchBills = createAsyncThunk('bills/fetchBills', async (_, { rejectWithValue }) => {
  try {
    const data = await apiClient.getBills();
    if (data.success) {
      return data.bills || [];
    }
    throw new Error(data.error || 'Failed to fetch bills');
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const createBill = createAsyncThunk('bills/createBill', async (billData, { dispatch, rejectWithValue }) => {
  try {
    const data = await apiClient.createBill(billData);
    if (data.success) {
      dispatch(fetchBills());
      return data;
    }
    throw new Error(data.error || 'Failed to create bill');
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  bills: [],
  loading: false,
  error: null
};

const billSlice = createSlice({
  name: 'bills',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBills.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = action.payload;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default billSlice.reducer;
