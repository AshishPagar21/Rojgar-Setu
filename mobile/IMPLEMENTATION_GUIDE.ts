// Authentication Flow Diagram and Implementation Guide

/*
┌─────────────────────────────────────────────────────────┐
│           ROJAGAR SETU MOBILE AUTH FLOW                 │
└─────────────────────────────────────────────────────────┘

1. APP LAUNCH
   ↓
2. RootNavigator checks isLoading state
   ├─ TRUE: Show splash screen (ActivityIndicator)
   └─ FALSE: Continue
3. AuthContext restoreToken() runs
   ├─ Token found in AsyncStorage
   │  ├─ Set apiClient auth header
   │  ├─ Set isSignedIn = true
   │  └─ Show MainNavigator (Dashboard)
   └─ No token found
      ├─ Set isSignedIn = false
      └─ Show AuthNavigator (Login/Signup)

4. LOGIN SCREEN
   ├─ User enters email & password
   ├─ Form validation (email format, password length)
   ├─ POST /auth/login to backend
   ├─ Success: Save token + user to AsyncStorage
   │  └─ Navigate to MainNavigator
   └─ Error: Show Alert with error message

5. SIGNUP SCREEN
   ├─ User selects role (Worker/Employer)
   ├─ User enters: name, email, phone, password
   ├─ Form validation for all fields
   ├─ Password confirmation check
   ├─ POST /auth/signup to backend
   ├─ Success: Save token + user to AsyncStorage
   │  └─ Auto-login & navigate to MainNavigator
   └─ Error: Show Alert with error message

6. LOGOUT
   ├─ POST /auth/logout
   ├─ Clear AsyncStorage (token, user)
   ├─ Clear apiClient auth header
   └─ Return to LoginScreen

7. TOKEN REFRESH (Auto-handled)
   ├─ User makes API request
   ├─ Request interceptor adds Bearer token
   ├─ Response interceptor checks for 401
   ├─ If 401: POST /auth/refresh
   ├─ Save new token
   └─ Retry original request

*/

export const AUTH_FLOW_DESCRIPTION = `
PERSISTENT LOGIN IMPLEMENTATION:

When user is logged in:
✓ JWT token stored in AsyncStorage
✓ User data stored in AsyncStorage
✓ Token set in API client header
✓ isSignedIn = true

When app is reopened:
✓ AuthContext.restoreToken() checks AsyncStorage
✓ If token exists & not expired:
  → Auto-login without re-entering credentials
✓ If token expired:
  → Auto-refresh with refresh token
  → Or redirect to login if refresh fails

KEY ADVANTAGES FOR LESS EDUCATED USERS:
✓ No repeated login
✓ Seamless experience
✓ Simple form with clear fields
✓ Real-time validation feedback
✓ Clear error messages
✓ Large, touchable buttons
`;

export const VALIDATION_RULES = {
  email: {
    required: true,
    format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: "Please enter a valid email",
  },
  phone: {
    required: true,
    digits: 10,
    errorMessage: "Phone must be 10 digits",
  },
  password: {
    required: true,
    minLength: 8,
    confirmMatch: true,
    errorMessage: "Password must be at least 8 characters",
  },
  name: {
    required: true,
    errorMessage: "Full name is required",
  },
  role: {
    required: true,
    options: ["WORKER", "EMPLOYER"],
    errorMessage: "Please select a role",
  },
};

export const API_ERROR_MAPPING = {
  400: "Invalid input. Please check your data.",
  401: "Invalid email or password.",
  403: "Access denied.",
  404: "User not found.",
  409: "Email already registered.",
  500: "Server error. Please try again later.",
  NETWORK: "Network error. Please check your connection.",
};
