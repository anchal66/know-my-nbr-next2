import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserDetailResponse } from '@/lib/user'

interface UserState {
  detail: UserDetailResponse | null
}

const initialState: UserState = {
  detail: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserDetail: (state, action: PayloadAction<UserDetailResponse>) => {
      state.detail = action.payload
    },
    clearUserDetail: (state) => {
      state.detail = null
    }
  }
})

export const { setUserDetail, clearUserDetail } = userSlice.actions
export default userSlice.reducer
