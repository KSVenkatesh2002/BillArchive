import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../apiClient';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ pageNum = 1, reset = false }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const {
        filterSource,
        filterType,
        filterProject,
        filterTimeframe,
        customFilters
      } = state.tasks;

      const params = {
        page: pageNum,
        limit: 15,
        timeframe: filterTimeframe,
        source: filterSource,
        typeOfWork: filterType,
        project: filterProject,
        ...customFilters
      };

      const data = await apiClient.getTasks(params);
      if (data.success) {
        return {
          tasks: data.tasks || [],
          hasMore: data.hasMore,
          isDemo: data.isDemo || false,
          metrics: data.metrics,
          reset,
          pageNum
        };
      }
      throw new Error(data.error || 'Failed to fetch tasks');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { dispatch, rejectWithValue }) => {
    try {
      const data = await apiClient.createTask(taskData);
      if (data.success) {
        dispatch(fetchTasks({ pageNum: 1, reset: true }));
        return data;
      }
      throw new Error(data.error || 'Failed to create task');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, updateData }, { dispatch, rejectWithValue }) => {
    try {
      const data = await apiClient.updateTask(taskId, updateData);
      if (data.success) {
        dispatch(fetchTasks({ pageNum: 1, reset: true }));
        return data;
      }
      throw new Error(data.error || 'Failed to update task');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTimeEntry = createAsyncThunk(
  'tasks/addTimeEntry',
  async ({ taskId, entry }, { dispatch, rejectWithValue }) => {
    try {
      const data = await apiClient.addTimeEntry(taskId, entry);
      if (data.success) {
        dispatch(fetchTasks({ pageNum: 1, reset: true }));
        return data;
      }
      throw new Error(data.error || 'Failed to add time entry');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { dispatch, rejectWithValue }) => {
    try {
      const data = await apiClient.deleteTask(taskId);
      if (data.success) {
        dispatch(fetchTasks({ pageNum: 1, reset: true }));
        return taskId;
      }
      throw new Error(data.error || 'Failed to delete task');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  tasks: [],
  loading: false,
  page: 1,
  hasMore: true,
  isDemo: false,
  metrics: {
    totalAllocated: 0,
    totalBilled: 0,
    totalActual: 0,
    completedCount: 0,
    variance: 0
  },
  filterSource: 'all',
  filterType: 'all',
  filterProject: 'all',
  filterTimeframe: 'all',
  customFilters: {},
  activeHistoryTask: null,
  error: null
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilterSource: (state, action) => {
      state.filterSource = action.payload;
    },
    setFilterType: (state, action) => {
      state.filterType = action.payload;
    },
    setFilterProject: (state, action) => {
      state.filterProject = action.payload;
    },
    setFilterTimeframe: (state, action) => {
      state.filterTimeframe = action.payload;
    },
    setCustomFilters: (state, action) => {
      state.customFilters = action.payload;
    },
    updateCustomFilter: (state, action) => {
      const { key, value } = action.payload;
      state.customFilters[key] = value;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setActiveHistoryTask: (state, action) => {
      state.activeHistoryTask = action.payload;
    },
    resetFilters: (state) => {
      state.filterSource = 'all';
      state.filterType = 'all';
      state.filterProject = 'all';
      state.filterTimeframe = 'all';
      state.customFilters = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        const { tasks, hasMore, isDemo, metrics, reset, pageNum } = action.payload;
        if (reset) {
          state.tasks = tasks;
        } else {
          // Append unique tasks
          const existingIds = new Set(state.tasks.map((t) => t._id));
          const newUniqueTasks = tasks.filter((t) => !existingIds.has(t._id));
          state.tasks = [...state.tasks, ...newUniqueTasks];
        }
        state.hasMore = hasMore;
        state.isDemo = isDemo;
        state.page = pageNum;
        if (metrics) {
          state.metrics = metrics;
        }
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setFilterSource,
  setFilterType,
  setFilterProject,
  setFilterTimeframe,
  setCustomFilters,
  updateCustomFilter,
  setPage,
  setActiveHistoryTask,
  resetFilters
} = taskSlice.actions;

export default taskSlice.reducer;
