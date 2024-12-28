// src/state/store.ts
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import walletReducer from './slices/walletSlice'
import snackbarReducer from '@/state/slices/snackbarSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    snackbar: snackbarReducer,
    wallet: walletReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

