// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import shipmentsReducer from './shipmentsSlice';
import ordersReducer from './ordersSlice';
// import shopsReducer from "./shopsSlice";
// import shopDetailsReducer from "./shopDetailsSlice";
const store = configureStore({
  reducer: {
    shipments: shipmentsReducer,
    orders: ordersReducer,
    // shops: shopsReducer,
    // shopDetails: shopDetailsReducer,
  },
});

export default store;
