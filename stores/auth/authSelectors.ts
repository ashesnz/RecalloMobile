import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export const selectAuth = (state: RootState) => state.auth;

export const selectUser = createSelector(selectAuth, (auth) => auth.user);

export const selectToken = createSelector(selectAuth, (auth) => auth.token);

export const selectIsLoggingIn = createSelector(selectAuth, (auth) => auth.uiFlags.isLoggingIn);

export const selectIsRegistering = createSelector(selectAuth, (auth) => auth.uiFlags.isRegistering);

export const selectIsLoadingUser = createSelector(selectAuth, (auth) => auth.uiFlags.isLoadingUser);

export const selectAuthError = createSelector(selectAuth, (auth) => auth.error);

export const selectIsAuthenticated = createSelector(
  selectAuth,
  (auth) => auth.user !== null && auth.token !== null
);

export const selectUserId = createSelector(selectAuth, (auth) => auth.user?.id);

export const selectUserEmail = createSelector(selectAuth, (auth) => auth.user?.email);

export const selectUserName = createSelector(selectAuth, (auth) => auth.user?.name);

export const selectIsLoading = createSelector(
  selectAuth,
  (auth) =>
    auth.uiFlags.isLoggingIn ||
    auth.uiFlags.isRegistering ||
    auth.uiFlags.isLoadingUser
);

