import { createSlice } from "@reduxjs/toolkit";


export const stepSlice=createSlice({
  name:'step',
  initialState:{},
  reducers:{
    get(state,action){
    }
  },
})

export const {get}=stepSlice.actions
export default stepSlice.reducer