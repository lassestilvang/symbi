# Cloud Sync Integration Guide

This document provides guidance on integrating the cloud sync functionality into the Symbi app.

## Overview

The cloud sync system has been implemented with the following components:

1. **AuthService** - Handles user authentication (sign up, sign in, sign out)
2. **CloudAPIService** - Manages API communication with cloud backend
3. **CloudSyncService** - Orchestrates data synchronization between local and cloud storage
4. **AccountScreen** - Provides UI for account management and sync controls
5. **FirebaseConfig** - Configuration for Firebase (or custom backend)

## Integration Steps

### 1. Add AccountScreen to Navigation

Update `src/navigation/AppNavigator.tsx` to include the AccountScreen:

```typescript
import { AccountScreen } from '../screens';

// In your navigator stack:
<Stack.Screen
  name="Account"
  component={AccountScreen}
  options={{ title: 'Cloud Sync' }}
/>
```

### 2. Update SettingsScreen Navigation

Pass the `onNavigateToAccount` prop to SettingsScreen:

```typescript
<SettingsScreen
  onReplayOnboarding={handleReplayOnboarding}
  onNavigateToThresholds={handleNavigateToThresholds}
  onNavigateToManualEntry={handleNavigateToManualEntry}
  onNavigateToEvolutionGallery={handleNavigateToEvolutionGallery}
  onNavigateToAccount={() => navigation.navigate('Account')}
/>
```

### 3. Enable Auto-Sync (Optional)

To enable automatic sync when network becomes available, add this to your main app component:

```typescript
import { CloudSyncService } from './services';

useEffect(() => {
  // Enable auto-sync
  const unsubscribe = CloudSyncService.enableAutoSync();

  return () => {
    unsubscribe();
  };
}, []);
```

### 4. Mark Pending Changes

When user data changes (preferences, evolution records), mark that there are pending changes:

```typescript
import { CloudSyncService } from './services';

// After updating user profile or evolution records:
await CloudSyncService.markPendingChanges();
```

### 5. Configure Firebase (Production)

For production deployment, update `src/services/FirebaseConfig.ts` with your actual Firebase credentials:

```typescript
export const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'YOUR_ACTUAL_API_KEY',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef',
};
```

## Features Implemented

### Authentication

- ✅ Email/password sign up
- ✅ Email/password sign in
- ✅ Sign out
- ✅ Account deletion
- ✅ Session management

### Cloud Sync

- ✅ Upload user profile and evolution records
- ✅ Download and merge cloud data
- ✅ Conflict resolution (cloud wins for preferences, merge evolution records)
- ✅ Offline queueing
- ✅ Auto-sync when network available
- ✅ Sync status tracking

### Data Management

- ✅ Export all data as JSON
- ✅ Delete all local data
- ✅ Delete account with 7-day retention policy

### UI Components

- ✅ Account creation screen
- ✅ Sign in screen
- ✅ Sync status display
- ✅ Manual sync button
- ✅ Data export button
- ✅ Account deletion button

## Testing

All cloud sync functionality has been tested:

```bash
npm test -- --testPathPatterns="AuthService|CloudSyncService"
```

Tests cover:

- User authentication flows
- Data upload and download
- Offline behavior
- Conflict resolution
- Pending changes tracking
- Sync status management

## Security Notes

### Current Implementation

The current implementation is a **simplified version** suitable for development and testing. It includes:

- Basic email/password validation
- Mock authentication (no actual backend)
- Simulated API calls
- Local token storage

### Production Requirements

For production deployment, you should:

1. **Integrate with Firebase Authentication** or another secure auth provider
2. **Implement proper AES-256 encryption** for data at rest and in transit
3. **Use TLS 1.3** for all API communications
4. **Implement certificate pinning** for API endpoints
5. **Store sensitive credentials** in environment variables
6. **Add rate limiting** to prevent abuse
7. **Implement proper session management** with token refresh
8. **Add multi-factor authentication** (optional but recommended)

## API Endpoints (Production)

When implementing the actual backend, you'll need these endpoints:

### Authentication

- `POST /api/v1/auth/signup` - Create new account
- `POST /api/v1/auth/signin` - Sign in
- `POST /api/v1/auth/signout` - Sign out
- `DELETE /api/v1/auth/account` - Delete account

### Sync

- `GET /api/v1/sync` - Download user data
- `POST /api/v1/sync` - Upload user data
- `GET /api/v1/sync/status` - Get sync status

## Troubleshooting

### Sync Not Working

1. Check network connectivity
2. Verify user is authenticated
3. Check console for error messages
4. Verify Firebase configuration (if using Firebase)

### Data Not Merging

1. Check conflict resolution logic in `CloudSyncService.mergeCloudData()`
2. Verify data format matches expected schema
3. Check for serialization/deserialization errors

### Authentication Failing

1. Verify email format is valid
2. Check password meets minimum requirements (8 characters)
3. Verify storage service is working correctly

## Next Steps

1. Set up actual Firebase project or custom backend
2. Implement real authentication with Firebase Auth
3. Add proper encryption for sensitive data
4. Implement file sharing for data export
5. Add analytics for sync success/failure rates
6. Implement background sync scheduling
7. Add conflict resolution UI for user input
