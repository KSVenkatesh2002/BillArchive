import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUserPreferences = createAsyncThunk('ui/fetchUserPreferences', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/user/preferences');
    const data = await res.json();
    if (data.success) {
      return data.preferences?.fieldDefaults || {};
    }
    throw new Error(data.error || 'Failed to fetch user preferences');
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const saveUserPreferences = createAsyncThunk('ui/saveUserPreferences', async (fieldDefaults, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/user/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fieldDefaults })
    });
    const data = await res.json();
    if (data.success) {
      return data.preferences.fieldDefaults;
    }
    throw new Error(data.error || 'Failed to save preferences');
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  viewMode: 'table',
  toastMessage: '',
  showTaskModal: false,
  editingTask: null,
  userPrefs: {},
  loading: false
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setToastMessage: (state, action) => {
      state.toastMessage = action.payload;
    },
    clearToast: (state) => {
      state.toastMessage = '';
    },
    openTaskModal: (state, action) => {
      state.editingTask = action.payload || null;
      state.showTaskModal = true;
    },
    closeTaskModal: (state) => {
      state.showTaskModal = false;
      state.editingTask = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPreferences.fulfilled, (state, action) => {
        state.userPrefs = action.payload;
      })
      .addCase(saveUserPreferences.fulfilled, (state, action) => {
        state.userPrefs = action.payload;
      });
  }
});

export const {
  setViewMode,
  setToastMessage,
  clearToast,
  openTaskModal,
  closeTaskModal
} = uiSlice.actions;

export default uiSlice.reducer;
