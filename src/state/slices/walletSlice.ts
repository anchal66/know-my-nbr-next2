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

// Thunk to fetch wallet balance
export const fetchWalletBalance = createAsyncThunk('wallet/fetchBalance', async () => {
  const response = await api.get('/api/v1/wallet/balance')
  // response.data is { balance: number } according to WalletResponse
  return response.data.balance
})

// Thunk to add funds
export const addFunds = createAsyncThunk<
  // Return type of the fulfilled action
  number,
  // Payload (amount to add) for the thunk
  { amount: number; paymentGateway: string; token: string },
  { rejectValue: string }
>(
  'wallet/addFunds',
  async ({ amount, paymentGateway }, { rejectWithValue }) => {
    try {
      const payload = {
        amount,
        paymentGateway,
        paymentDetails: {
          token: 'DummyOrInstamojoToken',
        },
      }

      const { data } = await api.post('/api/v1/wallet/add-funds', payload)
      // data is AddFundsResponse { transactionId, status, gatewayOrderId }
      // For now, we'll assume we eventually re-fetch the balance after success
      return amount
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add funds')
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
      // Optionally, just re-fetch the balance, or do:
      state.balance += payload // If the transaction is guaranteed success
      state.loading = false
    })
    builder.addCase(addFunds.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  },
})

export default walletSlice.reducer
