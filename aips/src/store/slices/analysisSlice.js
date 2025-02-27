import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  results: null,
  loading: false,
  error: null,
};

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    startAnalysis: (state) => {
      state.loading = true;
      state.error = null;
    },
    analysisSuccess: (state, action) => {
      state.loading = false;
      state.results = action.payload;
    },
    analysisFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { startAnalysis, analysisSuccess, analysisFailure } = analysisSlice.actions;
export default analysisSlice.reducer; 