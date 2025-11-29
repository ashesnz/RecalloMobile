import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore, type AnyAction } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import authReducer from './auth/authSlice';

const CURRENT_VERSION = 1;

const persistConfig = {
  key: 'Root',
  version: CURRENT_VERSION,
  storage: AsyncStorage,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  migrate: async (state: any) => {
    // If the stored version is older or doesn't exist, return initial state
    if (!state?._persist?.version || state._persist.version < CURRENT_VERSION) {
      return {
        auth: authReducer(undefined, { type: 'INIT' }),
      };
    }
    return state;
  },
};

// Combined reducer
const appReducer = (state: any, action: AnyAction) => {
  return {
    auth: authReducer(state?.auth, action),
  };
};

// Root reducer that handles logout
const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: AnyAction) => {
  if (action.type === 'auth/logout') {
    // Clear everything on logout (like Chatwoot does)
    return appReducer(undefined, { type: 'INIT' });
  }
  return appReducer(state, action);
};

// @ts-ignore
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

