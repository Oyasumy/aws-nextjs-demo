import { combineReducers } from "redux";
import { counterSlice } from "./counter";
import { postSlice } from "./post";

export default combineReducers({
    counter: counterSlice.reducer,
    poster: postSlice.reducer
  });