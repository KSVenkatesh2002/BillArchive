import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import orgReducer from './orgSlice';
import taskReducer from './taskSlice';
import billReducer from './billSlice';
import reportReducer from './reportSlice';
import adminReducer from './adminSlice';
import superAdminReducer from './superAdminSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    org: orgReducer,
    tasks: taskReducer,
    bills: billReducer,
    reports: reportReducer,
    admin: adminReducer,
    superAdmin: superAdminReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});
