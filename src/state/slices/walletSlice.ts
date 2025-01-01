// src/state/slices/walletSlice.ts
'use client'

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '@/lib/api'

// -------------- Interfaces ---------------- //

// Transaction details from the backend
export interface Transaction {
  id?: number
  createdAt?: string
  description?: string
  amount?: number
}

// Optional interface if your API returns paginated transactions
export interface TransactionList {
  content: Transaction[]
  pageable: {
    pageNumber: number
    pageSize: number
    // you can add other fields if needed
  }
  last: boolean
  totalElements: number
  totalPages: number
  first: boolean
  size: number
  number: number
  numberOfElements: number
  empty: boolean
}

interface WalletState {
  balance: number
  loading: boolean
  error: string | null
  transactions: TransactionList | null
}

// For addFunds
interface AddFundsResponse {
  transactionId: string
  status: string
  gatewayOrderId: string
}

// For verifyPayment
interface VerifyPaymentResponse {
  message: string
}

// For sendFunds
interface SendFundsResponse {
  status: string // e.g. "SUCCESS"
}

// -------------- Initial State ---------------- //

const initialState: WalletState = {
  balance: 0,
  loading: false,
  error: null,
  transactions: null,
}

// -------------- Thunks ---------------- //

// 1) Thunk to fetch wallet balance
export const fetchWalletBalance = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>('wallet/fetchWalletBalance', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/api/v1/wallet/balance')
    // example: { balance: number }
    return response.data.balance
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet balance')
  }
})

// 2) Thunk to add funds => returns transaction + gateway info
export const addFunds = createAsyncThunk<
  AddFundsResponse,
  { amount: number; paymentGateway: string; token: string },
  { rejectValue: string }
>('wallet/addFunds', async ({ amount, paymentGateway }, { rejectWithValue }) => {
  try {
    const payload = {
      amount,
      paymentDetails: {
        token: 'randomToken', // or pass the real token from arg if needed
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
})

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

// 4) Thunk to fetch wallet transactions => returns paginated data
export const fetchWalletTransactions = createAsyncThunk<
  TransactionList,
  { page?: number; size?: number },
  { rejectValue: string }
>(
  'wallet/fetchWalletTransactions',
  async ({ page = 0, size = 20 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/wallet/transactions?page=${page}&size=${size}`)
      return response.data as TransactionList
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions')
    }
  }
)

// 5) Thunk to send funds to a friend
export const sendFunds = createAsyncThunk<
  SendFundsResponse,
  { username: string; amount: number; message: string },
  { rejectValue: string }
>('wallet/sendFunds', async ({ username, amount, message }, { rejectWithValue }) => {
  try {
    const response = await api.post('/api/v1/wallet/send-funds', {
      username,
      amount,
      message,
    })
    return response.data // e.g. { status: 'SUCCESS' }
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to send funds')
  }
})

// -------------- Slice ---------------- //

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetchWalletBalance
    builder
      .addCase(fetchWalletBalance.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action: PayloadAction<number>) => {
        state.balance = action.payload
        state.loading = false
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // addFunds
    builder
      .addCase(addFunds.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addFunds.fulfilled, (state) => {
        // We do NOT increment the balance yet because payment is not verified.
        state.loading = false
      })
      .addCase(addFunds.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // verifyPayment
    builder
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyPayment.fulfilled, (state) => {
        // Payment verified => we can re-fetch the balance if needed.
        state.loading = false
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // fetchWalletTransactions
    builder
      .addCase(fetchWalletTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWalletTransactions.fulfilled, (state, action: PayloadAction<TransactionList>) => {
        state.transactions = action.payload
        state.loading = false
      })
      .addCase(fetchWalletTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // sendFunds
    builder
      .addCase(sendFunds.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendFunds.fulfilled, (state) => {
        // Optionally re-fetch balance or transactions here if needed
        state.loading = false
      })
      .addCase(sendFunds.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default walletSlice.reducer
