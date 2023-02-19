import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  roomId: "",
};

export const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRoomId: (state, action) => {
      state.roomId = action.payload.data;
    },
  },
});

export const { setRoomId } = roomSlice.actions;

export default roomSlice;
