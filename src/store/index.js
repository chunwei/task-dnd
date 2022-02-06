import { configureStore } from "@reduxjs/toolkit"
import flowReducer from './flow'
import blockReducer from './block'

const reducer=(state,action)=>{
  switch(action.type){
    case '':
      default:
        return state
  }
}
const store= configureStore({
  reducer:{
    flow:flowReducer,
    block:blockReducer
  }
})
export default store