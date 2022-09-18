import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user;
    },
    removeUser(state) {
      state.user = null;
    }
  }
})

export const authActions = authSlice.actions;

export default authSlice;