import { createSlice } from "@reduxjs/toolkit";


export const projectSlice=createSlice({
  name:'project',
  initialState:{},
  reducers:{
    get(state,action){
    }
  },
})

export const {get}=projectSlice.actions
export default projectSlice.reducer