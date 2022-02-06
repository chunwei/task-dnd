import { createSlice } from "@reduxjs/toolkit";


export const blockSlice=createSlice({
  name:'block',
  initialState:{},
  reducers:{
    get(state,action){
    }
  },
})

export const {get}=blockSlice.actions
export default blockSlice.reducer