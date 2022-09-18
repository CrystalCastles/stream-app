import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authSlice from "./auth-slice";

import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

const rootReducer = combineReducers({
  auth: authSlice.reducer
})

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer
})

export const persistor = persistStore(store);

// import { configureStore } from "@reduxjs/toolkit";
// import authSlice from "./auth-slice";

// const store = configureStore({
//   reducer: { auth: authSlice.reducer }
// })

// export default store;