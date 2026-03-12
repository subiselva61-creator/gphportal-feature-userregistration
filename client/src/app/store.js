import { configureStore } from '@reduxjs/toolkit'
import authReducer from "./slices/auth";
import messageReducer from "./slices/message";
import apiReducer from '../app/services/slice';

const reducer = {
  auth: authReducer,
  message: messageReducer,
  api: apiReducer,
}

export const store = configureStore({
  reducer: reducer,
  devTools: true,
});
