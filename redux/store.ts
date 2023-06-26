// import { configureStore } from "@reduxjs/toolkit";
// import counterReducer from "./counter/counterSlice";

// const store = configureStore({
//   reducer: {
//     counter: counterReducer,
//   },
//   middleware: [],
// });

// export default store;

import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './reducers';

export const store = createStore(
    rootReducer,
    applyMiddleware(
        thunkMiddleware
    )
);