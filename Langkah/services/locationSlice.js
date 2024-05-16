import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchLocations = createAsyncThunk(
  'location/fetchLocations',
  async () => {
    const response = await fetch('http://10.207.154.227:3000/locations');
    const data = await response.json();
    return data;
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState: {
    stations: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stations = action.payload;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default locationSlice.reducer;
