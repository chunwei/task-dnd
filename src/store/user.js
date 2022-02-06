import { createSlice } from "@reduxjs/toolkit";


export const userSlice=createSlice({
  name:'user',
  initialState:{},
  reducers:{
    get(state,action){
    }
  },
})

export const {get}=userSlice.actions
export default userSlice.reducer