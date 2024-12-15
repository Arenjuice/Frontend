import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: localStorage.getItem('accessToken') || '', // Inicializuojame iš localStorage
};

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    setter: (state, action) => {
      state.value = action.payload;
    },
    clear: (state) => {
      state.value = ''; // Išvalome token
    },
  },
});

export const { setter, clear } = tokenSlice.actions;
export default tokenSlice.reducer;
