import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Memoize fetch functions to prevent unnecessary re-fetching
const fetchData = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

export const fetchLocations = createAsyncThunk(
  'location/fetchLocations',
  async () => fetchData('http://10.207.200.150:3000/locations')
);

export const fetchOutputStations = createAsyncThunk(
  'location/fetchOutputStations',
  async () => fetchData('http://10.207.200.150:3000/output-stations')
);

const locationSlice = createSlice({
  name: 'location',
  initialState: {
    stations: [],
    outputStations: [],
    intervals: [], // Initialize intervals as an empty array
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
      })
      .addCase(fetchOutputStations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOutputStations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.outputStations = action.payload;

        // Ensure outputStations payload is an array
        if (Array.isArray(action.payload)) {
          // Find the origin and destination steps
          const originStep = action.payload.find(step => step.step_order === 0);
          const destinationStep = action.payload.find(step => step.step_order === action.payload.length - 1);

          // Ensure originStep and destinationStep are found
          if (originStep && destinationStep) {
            // Extract intervals between origin and destination
            const originIndex = action.payload.indexOf(originStep);
            const destinationIndex = action.payload.indexOf(destinationStep);
            state.intervals = action.payload.slice(originIndex + 1, destinationIndex);
          }
        }
      })
      .addCase(fetchOutputStations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default locationSlice.reducer;
