# Rojagar Setu Mobile App

Expo React Native app for the Rojagar Setu job platform.

## Auth Flow

- Mobile number login
- OTP verification with resend timer
- Role selection after OTP when needed
- Employer registration form
- Worker registration form
- Persistent session restore with AsyncStorage

## Commands

```bash
cd mobile
npm install
npm start
```

Then:

- Press `w` for web on PC
- Press `a` for Android emulator
- Scan the QR code with Expo Go on a phone

## Environment

Create `mobile/.env`:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api
EXPO_PUBLIC_APP_NAME=Rojagar Setu
```

For a physical phone, set `EXPO_PUBLIC_API_BASE_URL` to your PC LAN IP instead of `localhost`.

## Structure

- `app/_layout.tsx` - Root provider and navigator
- `screens/auth/` - Login, OTP, role selection, and registration screens
- `components/auth/` - Shared auth forms
- `components/common/` - Button, Input, Select, error, header
- `modules/auth/` - OTP API/service/storage helpers
- `context/AuthContext.tsx` - Auth state and session restore
- `services/apiClient.ts` - Axios client with token injection
- `types/index.ts` - Shared backend-aligned types

## API Endpoints

- `POST /auth/send-otp`
- `POST /auth/resend-otp`
- `POST /auth/verify-otp`

## Notes

- The web starter screens in `app/(tabs)` are still present but the app shell now uses the custom auth navigator.
- If you change the backend host or test on a device, update `.env` accordingly.
