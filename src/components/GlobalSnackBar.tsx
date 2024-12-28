'use client'

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Snackbar, Alert } from '@mui/material'
import { RootState } from '@/state/store'
import { hideSnackbar } from '@/state/slices/snackbarSlice'

const GlobalSnackbar: React.FC = () => {
  const dispatch = useDispatch()
  const { isOpen, message, type } = useSelector((state: RootState) => state.snackbar)

  const handleClose = () => {
    dispatch(hideSnackbar())
  }

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity={type} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  )
}

export default GlobalSnackbar
