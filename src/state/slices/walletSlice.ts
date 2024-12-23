// src/state/slices/walletSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'

interface WalletState {
  balance: number
  loading: boolean
  error: string | null
}

const initialState: WalletState = {
  balance: 0,
  loading: false,
  error: null,
}

interface AddFundsResponse {
  transactionId: string
  status: string
  gatewayOrderId: string
}

interface VerifyPaymentResponse {
  message: string
}

// 1) Thunk to fetch wallet balance
export const fetchWalletBalance = createAsyncThunk(
  'wallet/fetchBalance',
  async () => {
    const response = await api.get('/api/v1/wallet/balance')
    // example: { balance: number }
    return response.data.balance
  }
)

// 2) Thunk to add funds => returns transaction + gateway info
export const addFunds = createAsyncThunk<
  // Fulfilled action's `payload` type
  AddFundsResponse,
  // The argument we pass to the thunk
  { amount: number; paymentGateway: string; token: string },
  // Rejected action's payload type
  { rejectValue: string }
>(
  'wallet/addFunds',
  async ({ amount, paymentGateway }, { rejectWithValue }) => {
    try {
      const payload = {
        amount,
        paymentDetails: {
          token: 'randomToken', // or pass in from arg
        },
        paymentGateway, // e.g., "MojoJo" in your example
      }

      // e.g. POST /api/v1/wallet/add-funds
      // returns { transactionId, status, gatewayOrderId }
      const { data } = await api.post('/api/v1/wallet/add-funds', payload)
      return data // matches AddFundsResponse
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add funds')
    }
  }
)

// 3) Thunk to verify payment => finalize the fund addition
export const verifyPayment = createAsyncThunk<
  VerifyPaymentResponse,
  { gatewayOrderId: string; signature: string; transactionId: string },
  { rejectValue: string }
>(
  'wallet/verifyPayment',
  async ({ gatewayOrderId, signature, transactionId }, { rejectWithValue }) => {
    try {
      // POST /api/v1/wallet/verify-payment
      // body: { gatewayOrderId, signature, transactionId }
      const payload = { gatewayOrderId, signature, transactionId }
      const { data } = await api.post('/api/v1/wallet/verify-payment', payload)
      return data // e.g. { message: 'Payment verified successfully.' }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify payment')
    }
  }
)

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetchWalletBalance
    builder.addCase(fetchWalletBalance.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchWalletBalance.fulfilled, (state, { payload }) => {
      state.balance = payload
      state.loading = false
    })
    builder.addCase(fetchWalletBalance.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Failed to fetch wallet balance'
    })

    // addFunds
    builder.addCase(addFunds.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(addFunds.fulfilled, (state, { payload }) => {
      // We do NOT increment the balance yet because payment is not fully verified
      // state.balance += <some amount> // but let's wait for verify
      state.loading = false
    })
    builder.addCase(addFunds.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // verifyPayment
    builder.addCase(verifyPayment.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(verifyPayment.fulfilled, (state, { payload }) => {
      // Payment verified successfully => now we can re-fetch or do next step
      // We'll let the caller do fetchWalletBalance() if needed
      state.loading = false
    })
    builder.addCase(verifyPayment.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  },
})

export default walletSlice.reducer
