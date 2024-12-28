import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SnackbarState {
  isOpen: boolean
  message: string | null
  type: 'error' | 'success' | 'info' | 'warning'
  errorData: string | null
}

const initialState: SnackbarState = {
  isOpen: false,
  message: null,
  type: 'info',
  errorData: null
}

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    showSnackbar: (
      state,
      action: PayloadAction<{ message: string; type?: 'error' | 'success' | 'info' | 'warning'; errorData?: string }>
    ) => {
      state.isOpen = true
      state.message = action.payload.message
      state.type = action.payload.type ?? 'info'
    },
    hideSnackbar: (state) => {
      state.isOpen = false
      state.message = null
      state.type = 'info'
    },
  },
})

export const { showSnackbar, hideSnackbar } = snackbarSlice.actions
export default snackbarSlice.reducer
