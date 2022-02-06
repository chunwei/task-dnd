export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0,
  },
  reducers: {
    increment: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      /* 你只能在 Redux Toolkit 的 createSlice 和 createReducer 中编写 “mutation” 逻辑，
         因为它们在内部使用 Immer！
         如果你在没有 Immer 的 reducer 中编写 mutation 逻辑，它将改变状态并导致错误！ */
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
      //在 Redux 中，永远 不允许在 reducer 中更改 state 的原始对象！
      // ❌ 非法 - 默认情况下，这将更改 state！
      /* state.value = 123 */
      // ✅ 这样操作是安全的，因为创建了副本
      /*
        return {
          ...state,
          value: 123
        } 
      */
    },
  },
});

/* handwritten复杂示例
  function handwrittenReducer(state, action) {
    return {
      ...state,
      first: {
        ...state.first,
        second: {
          ...state.first.second,
          [action.someId]: {
            ...state.first.second[action.someId],
            fourth: action.someValue
          }
        }
      }
    }
  }
*/
/** with Immer
  function reducerWithImmer(state, action) {
    state.first.second[action.someId].fourth = action.someValue
  }
*/

//用 Thunk 编写异步逻辑
// The function below is called a thunk and allows us to perform async logic.
// It can be dispatched like a regular action: `dispatch(incrementAsync(10))`.
// This will call the thunk with the `dispatch` function as the first argument.
// Async code can then be executed and other actions can be dispatched
export const incrementAsync = amount => dispatch => {
  setTimeout(() => {
    dispatch(incrementByAmount(amount))
  }, 1000)
}
//store.dispatch(incrementAsync(5))

// 外部的 thunk creator 函数
const fetchUserById = userId => {
  // 内部的 thunk 函数
  return async (dispatch, getState) => {
    try {
      // thunk 内发起异步数据请求
      const user = await userAPI.fetchById(userId)
      // 但数据响应完成后 dispatch 一个 action
      dispatch(userLoaded(user))
    } catch (err) {
      // 如果过程出错，在这里处理
    }
  }
}