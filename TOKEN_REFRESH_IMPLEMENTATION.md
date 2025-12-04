# JWT Token Refresh Implementation

## Overview
This document outlines the robust JWT token refresh strategy implemented for the React Native mobile application. The implementation follows industry best practices for mobile applications and ensures seamless token management with WebSocket connections.

## Backend Token Configuration
- **Access Token Expiry**: 1 hour (3600 seconds)
- **Refresh Token Expiry**: 7 days (604800 seconds)
- **Token Rotation**: Refresh tokens are rotated on each refresh (old token revoked, new token issued)

## Frontend Implementation

### Key Features

#### 1. Proactive Token Refresh
- Tokens are refreshed **5 minutes before expiration** (300 seconds buffer)
- Automatic scheduling of token refresh using timers
- Prevents token expiration during active sessions

#### 2. Single-Flight Refresh Pattern
- Only one refresh request at a time (prevents race conditions)
- Concurrent requests wait for the ongoing refresh to complete
- Thread-safe implementation using promise chaining

#### 3. Request Interceptor Logic
```typescript
Request Flow:
1. Check if token exists
2. If token expires in < 5 minutes → refresh proactively
3. Add Authorization header with latest token
4. Proceed with request
```

#### 4. Response Interceptor Logic
```typescript
401 Response Flow:
1. Check if request was already retried
2. If not retried → attempt token refresh
3. If refresh succeeds → retry original request with new token
4. If refresh fails → clear auth and redirect to login
```

#### 5. WebSocket Token Management
- WebSocket automatically reconnects when token is refreshed
- Validates token via REST endpoint before WS handshake
- Prevents 401 errors on WebSocket upgrade
- Maintains persistent connection with fresh tokens

#### 6. Automatic Token Refresh Scheduling
```typescript
Schedule Flow:
1. On app initialization → schedule based on stored token expiry
2. On login/register → schedule based on new token expiry
3. On token refresh → reschedule based on new expiry
4. On logout → clear scheduled refresh
```

### Implementation Files

#### `/services/api.ts`
Main implementation file containing:
- `refreshTokenIfNeeded()` - Core refresh logic with single-flight pattern
- `scheduleTokenRefresh()` - Automatic scheduling mechanism
- `initializeTokenRefresh()` - Initialize on app start
- `isTokenExpiringSoon()` - Token expiration checker (5 min threshold)
- Request/Response interceptors with refresh logic
- WebSocket reconnection on token refresh

#### `/stores/auth/authService.ts`
Auth service wrapper providing:
- `login()` - Login with credentials
- `register()` - Register new user
- `getProfile()` - Fetch user profile
- `logout()` - Logout and revoke tokens
- `getToken()` - Get current access token
- `clearToken()` - Clear auth tokens

#### `/hooks/use-auth.ts`
React hook for auth operations:
- Login/Register/Logout actions
- Auth state selectors
- Error handling

## Token Refresh Flow

### Successful Refresh Flow
```
1. Token expires in < 5 minutes
2. refreshTokenIfNeeded() called
3. POST /api/auth/refresh with refreshToken
4. Backend validates refresh token
5. Backend revokes old refresh token
6. Backend creates new access + refresh tokens
7. Frontend saves new tokens to SecureStore
8. Frontend schedules next refresh
9. Frontend reconnects WebSocket with new token
10. Request proceeds with new access token
```

### Failed Refresh Flow
```
1. Token refresh attempted
2. Backend returns 400/401 (invalid/expired refresh token)
3. Frontend clears all auth state
4. Frontend clears SecureStore
5. Frontend stops WebSocket
6. Frontend cancels scheduled refresh
7. User redirected to login screen
```

## Security Best Practices Implemented

### 1. Secure Storage
- **iOS/Android**: Uses SecureStore (Keychain/Keystore)
- **Web**: Uses localStorage (acceptable for web apps)
- Tokens never stored in Redux state (only in secure storage)

### 2. Token Expiration Handling
- 5-minute buffer prevents edge cases
- Proactive refresh before expiration
- Reactive refresh on 401 responses

### 3. Single-Flight Pattern
- Prevents multiple simultaneous refresh requests
- Reduces server load
- Prevents race conditions

### 4. Token Rotation
- Backend rotates refresh tokens on each use
- Old refresh tokens are revoked
- Prevents token replay attacks

### 5. Automatic Cleanup
- Tokens cleared on logout
- Scheduled refreshes cancelled on logout
- WebSocket closed on logout

## Mobile-Specific Considerations

### App Lifecycle Management
- Token refresh scheduled on app initialization
- Tokens validated before WebSocket connection
- Handles app backgrounding/foregrounding seamlessly

### Network Resilience
- Retry logic on 401 responses
- Graceful degradation on refresh failure
- WebSocket reconnection with backoff

### Performance Optimization
- Minimal token validation overhead
- Cached token expiration checks
- Efficient timer-based scheduling

## Testing Scenarios

### 1. Normal Operation
- User logs in → token expires in 1 hour
- At 55 minutes → token auto-refreshes
- At 1 hour 55 minutes → token auto-refreshes again
- User continues seamlessly

### 2. Background/Foreground
- User backgrounds app for 30 minutes
- User foregrounds app
- Next request triggers proactive refresh
- User continues seamlessly

### 3. Token Expiration
- User leaves app idle for > 1 hour
- Token expires
- Next request gets 401
- Interceptor attempts refresh with refresh token
- If refresh token valid → new tokens obtained
- If refresh token expired → redirect to login

### 4. WebSocket Connection
- WebSocket connected with valid token
- Token refreshed → WebSocket reconnects automatically
- Continuous real-time updates maintained

## Configuration

### Customizable Parameters
```typescript
// Token expiration threshold (default: 5 minutes)
isTokenExpiringSoon(expiresAt, thresholdSeconds = 300)

// Backend endpoints
API_CONFIG.ENDPOINTS.REFRESH_TOKEN = '/api/auth/refresh'

// Token storage key
TOKEN_KEY = 'auth_tokens'
```

## Monitoring & Debugging

### Console Logs
All token operations log to console:
- `[API] Attempting token refresh`
- `[API] Token refresh succeeded`
- `[API] Scheduling token refresh in Xs`
- `[API] Reconnecting WebSocket with new token`

### Error Handling
Comprehensive error handling at each stage:
- Network errors during refresh
- Invalid refresh response
- Expired refresh tokens
- Storage errors

## Comparison with Industry Standards

This implementation aligns with:
- **OAuth 2.0 Best Practices**: Token rotation, secure storage
- **React Native Security Guidelines**: SecureStore usage
- **Mobile App Patterns**: Proactive refresh, background handling
- **WebSocket Authentication**: Token validation, automatic reconnection

## Future Enhancements (Optional)

1. **Biometric Re-authentication**: After long idle periods
2. **Token Refresh Analytics**: Track refresh success/failure rates
3. **Adaptive Refresh Timing**: Adjust buffer based on network conditions
4. **Multi-Device Token Management**: Sync across user's devices

## Conclusion

This implementation provides a production-ready, secure, and user-friendly token refresh strategy for the React Native mobile application. It handles all common scenarios including network issues, app lifecycle events, and WebSocket connections while maintaining security best practices.

