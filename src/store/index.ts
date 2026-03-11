import {
  useDispatch as useReduxDispatch,
  useSelector as useReduxSelector
} from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { ThunkAction } from 'redux-thunk';
import { configureStore } from '@reduxjs/toolkit';
import type { Action } from '@reduxjs/toolkit';
import { persistedReducer } from './rootReducer';
import { persistStore } from 'redux-persist';

const isDev: string = process.env.NEXT_PUBLIC_NODE_ENV;
export const store = configureStore({
  reducer: persistedReducer,
  devTools: isDev === 'DEVELOPMENT',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false
    })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type AppThunk = ThunkAction<void, RootState, null, Action<string>>;

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export const useDispatch = () => useReduxDispatch<AppDispatch>();

export type TStore = ReturnType<typeof store.getState>;
