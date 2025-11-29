# Auth Implementation - Chatwoot Pattern

This authentication implementation follows the architectural patterns from Chatwoot mobile app.

## Architecture

The auth system is organized with clean separation of concerns:

```
stores/auth/
├── auth-types.ts       # Type definitions
├── auth-utils.ts       # Error handling utilities
├── auth-service.ts     # API service layer
├── auth-actions.ts     # Business logic and state mutations
├── auth-selectors.ts   # State selectors
└── index.ts           # Public API and hooks
```

## Key Features

1. **Separation of Concerns**: Each file has a single responsibility
2. **UI Flags**: Separate loading states for different operations (login, register, loadUser)
3. **Error Handling**: Centralized error handling with user-friendly messages
4. **Selector Pattern**: Optimized hooks for accessing specific state slices
5. **Type Safety**: Full TypeScript support

## Usage Examples

### Basic Usage in Components

```typescript
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    isLoggingIn, 
    login, 
    logout 
  } = useAuth();
  
  // Use auth state and actions
}
```

### Optimized Selector Hooks

For better performance, use individual selector hooks:

```typescript
import { 
  useUser, 
  useIsAuthenticated, 
  useLogin 
} from '@/stores/auth-store';

function UserProfile() {
  const user = useUser();
  const login = useLogin();
  
  // Component only re-renders when user changes
}
```

### Login Example

```typescript
const { login, isLoggingIn, error } = useAuth();

const handleLogin = async () => {
  const result = await login({ 
    email: 'user@example.com', 
    password: 'password' 
  });
  
  if (result.success) {
    // Login successful
  } else {
    // Handle error - error message is in result.error
    console.error(result.error);
  }
};
```

### Register Example

```typescript
const { register, isRegistering } = useAuth();

const handleRegister = async () => {
  const result = await register({ 
    email: 'user@example.com', 
    password: 'password',
    name: 'John Doe'
  });
  
  if (result.success) {
    // Registration successful
  }
};
```

### Logout Example

```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // User is logged out, state cleared
};
```

## Available Hooks

### State Selectors
- `useUser()` - Current user object
- `useToken()` - Auth token
- `useIsAuthenticated()` - Boolean authentication status
- `useIsLoggingIn()` - Login loading state
- `useIsRegistering()` - Register loading state
- `useIsLoadingUser()` - User load loading state
- `useIsLoading()` - Any loading state
- `useAuthError()` - Current error message
- `useUserId()` - Current user ID
- `useUserEmail()` - Current user email
- `useUserName()` - Current user name

### Actions
- `useLogin()` - Login function
- `useRegister()` - Register function
- `useLogout()` - Logout function
- `useLoadUser()` - Load user from storage
- `useClearError()` - Clear error message
- `useResetAuth()` - Reset auth state

## UI Flags

The auth store maintains separate UI flags for different operations:

- `isLoggingIn`: Set during login operation
- `isRegistering`: Set during registration
- `isLoadingUser`: Set during user profile load

This allows for precise UI feedback for each operation.

## Error Handling

Errors are handled consistently:
- Network errors get user-friendly messages
- API errors are extracted and displayed
- All errors are stored in the `error` state
- Use `clearError()` to clear error messages

## Integration

The auth system integrates with:
- `AuthInitializer` component for loading user on app start
- `useAuth` hook for easy component access
- API service for all backend calls
- Secure storage for token persistence

