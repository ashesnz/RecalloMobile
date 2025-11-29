# Authentication Setup Guide

## Backend API Requirements

Your .NET backend needs to implement the following authentication endpoints:

### 1. Login Endpoint
**POST** `/api/auth/login`

Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### 2. Register Endpoint
**POST** `/api/auth/register`

Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

Response:
```json
{
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### 3. Get User Profile Endpoint
**GET** `/api/auth/profile`

Headers:
```
Authorization: Bearer JWT_TOKEN_HERE
```

Response:
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "John Doe"
}
```

### 4. Logout Endpoint (Optional)
**POST** `/api/auth/logout`

Headers:
```
Authorization: Bearer JWT_TOKEN_HERE
```

Response:
```json
{
  "message": "Logged out successfully"
}
```

## CORS Configuration

Make sure your .NET backend allows CORS for mobile development:

```csharp
// In Program.cs or Startup.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowMobileApp",
        builder =>
        {
            builder.WithOrigins("http://localhost:8081", "http://localhost:19000")
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});

// Use CORS
app.UseCors("AllowMobileApp");
```

## JWT Configuration

Your backend should use JWT tokens for authentication. Example configuration:

```csharp
// In appsettings.json
{
  "Jwt": {
    "Key": "your-secret-key-here-make-it-long-and-secure",
    "Issuer": "RecalloAPI",
    "Audience": "RecalloMobile",
    "ExpireMinutes": 60
  }
}
```

## Testing the API

You can test your endpoints using the Swagger UI at: `http://localhost:5298/swagger`

## Mobile App Configuration

The mobile app is configured to connect to `http://localhost:5298` by default. To change this:

1. Open `/constants/api.ts`
2. Update the `BASE_URL` value:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_IP_ADDRESS:5298', // Replace with your backend URL
  // ...
};
```

**Important for iOS Simulator**: Use `http://localhost:5298`  
**Important for Android Emulator**: Use `http://10.0.2.2:5298`  
**Important for Physical Devices**: Use your computer's local IP address (e.g., `http://192.168.1.100:5298`)

## Features Implemented

✅ Secure token storage using Expo SecureStore  
✅ Email/password validation  
✅ Login and registration screens  
✅ Automatic token refresh on app restart  
✅ Protected routes (requires authentication)  
✅ Logout functionality  
✅ Error handling and user feedback  
✅ Loading states  
✅ Responsive keyboard handling  
✅ Password visibility toggle  

## How It Works

1. **First Launch**: User sees the login screen
2. **Login/Register**: User authenticates with your backend
3. **Token Storage**: JWT token is securely stored on device
4. **Authenticated**: User gains access to the main app
5. **Auto-Login**: On app restart, token is automatically retrieved and validated
6. **Logout**: Token is removed, user returns to login screen

## Security Best Practices

- ✅ Passwords are never stored locally
- ✅ JWT tokens stored in encrypted storage (SecureStore)
- ✅ HTTPS should be used in production
- ✅ Tokens expire and require re-authentication
- ✅ Input validation on both client and server

