// src/redux/shipmentsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { auth } from '../firebase';

// ✅ Fetch shipments from server
export const fetchShipments = createAsyncThunk(
  'shipments/fetchShipments',
  async (_, { rejectWithValue }) => {
    try {
      const token = await auth.currentUser.getIdToken(true);
      const res = await axios.get(
        'https://jio-yatri-user.onrender.com/api/shipments/my-shipments',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch shipments'
      );
    }
  }
);

const shipmentsSlice = createSlice({
  name: 'shipments',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearShipments(state) {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShipments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearShipments } = shipmentsSlice.actions;
export default shipmentsSlice.reducer;
