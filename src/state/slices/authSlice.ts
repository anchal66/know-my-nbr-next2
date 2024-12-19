// src/state/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  token: string | null
  username: string | null
  role: string | null
  onBoardingStatus: string | null
}

const initialState: AuthState = {
  token: null,
  username: null,
  role: null,
  onBoardingStatus: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{
      token: string,
      username: string,
      role: string,
      onBoardingStatus: string
    }>) => {
      state.token = action.payload.token
      state.username = action.payload.username
      state.role = action.payload.role
      state.onBoardingStatus = action.payload.onBoardingStatus
    },
    logout: (state) => {
      state.token = null
      state.username = null
      state.role = null
      state.onBoardingStatus = null
    }
  }
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
