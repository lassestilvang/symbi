# Final QA and Testing Checklist

This comprehensive checklist ensures Symbi is ready for App Store and Google Play Store submission.

## Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Functional Testing](#functional-testing)
3. [Platform-Specific Testing](#platform-specific-testing)
4. [Performance Testing](#performance-testing)
5. [Security & Privacy Testing](#security--privacy-testing)
6. [Edge Cases & Error Handling](#edge-cases--error-handling)
7. [Requirements Verification](#requirements-verification)
8. [Final Submission Checklist](#final-submission-checklist)

---

## Pre-Testing Setup

### Test Devices

**iOS Devices (Minimum)**
- [ ] iPhone 12 or newer (iOS 14+)
- [ ] iPhone SE (smaller screen)
- [ ] iPad (if supporting tablets)
- [ ] Various iOS versions: 14.0, 15.0, 16.0, 17.0, 18.0

**Android Devices (Minimum)**
- [ ] Google Pixel (stock Android)
- [ ] Samsung Galaxy (One UI)
- [ ] Various Android versions: 8.0, 10.0, 12.0, 13.0, 14.0

### Test Accounts

- [ ] Fresh test account (never used app before)
- [ ] Test account with health data
- [ ] Test account without health permissions
- [ ] Test account with manual entry mode

### Test Data

- [ ] Sample health data in HealthKit/Google Fit
- [ ] Various step counts (0, 1000, 5000, 10000, 20000)
- [ ] Sleep data (Phase 2)
- [ ] HRV data (Phase 2)

---

## Functional Testing

### 1. Installation & First Launch

- [ ] App installs successfully from TestFlight/Internal Testing
- [ ] App icon displays correctly on home screen
- [ ] App launches without crashes
- [ ] Splash screen displays correctly
- [ ] No console errors on launch

### 2. Onboarding Flow

**Welcome Screen**
- [ ] Welcome screen displays correctly
- [ ] Text is readable and properly formatted
- [ ] Images/animations load correctly
- [ ] "Get Started" button works
- [ ] "Skip" button works (if applicable)

**Health Data Explanation**
- [ ] Explanation screen displays correctly
- [ ] Information is clear and accurate
- [ ] Navigation buttons work
- [ ] Progress indicator updates correctly

**Permission Request**
- [ ] Permission screen displays correctly
- [ ] Explanation text is clear
- [ ] "Allow" button triggers system permission dialog
- [ ] "Use Manual Entry" option works
- [ ] "Maybe Later" option works (if applicable)

**iOS HealthKit Permission**
- [ ] System permission dialog appears
- [ ] All requested data types are listed
- [ ] Granting permission works
- [ ] Denying permission works
- [ ] Partial permission works (some data types granted)

**Android Google Fit/Health Connect Permission**
- [ ] System permission dialog appears
- [ ] All requested data types are listed
- [ ] Granting permission works
- [ ] Denying permission works
- [ ] Health Connect detected on Android 14+

**Onboarding Completion**
- [ ] Completion screen displays (if applicable)
- [ ] User is navigated to main screen
- [ ] Onboarding state is saved (doesn't repeat on restart)

### 3. Main Screen

**Initial State**
- [ ] Main screen loads successfully
- [ ] Symbi animation displays correctly
- [ ] Step count displays (or "Waiting for data")
- [ ] Emotional state label displays
- [ ] UI is responsive and smooth

**Symbi Animation**
- [ ] Animation plays smoothly (60 FPS)
- [ ] Animation loops correctly
- [ ] Animation matches emotional state
- [ ] No animation glitches or artifacts
- [ ] Animation performs well on low-end devices

**Step Count Display**
- [ ] Step count fetches from health data
- [ ] Step count updates when data changes
- [ ] Step count displays with proper formatting (e.g., "8,543 steps")
- [ ] Progress bar updates correctly
- [ ] Manual entry shows entered value

**Emotional State**
- [ ] Correct state calculated based on steps
- [ ] State label displays correctly (Sad, Resting, Active)
- [ ] State transitions smoothly when data changes
- [ ] State persists across app restarts

### 4. Health Data Integration

**iOS HealthKit**
- [ ] Step count reads correctly
- [ ] Sleep data reads correctly (Phase 2)
- [ ] HRV data reads correctly (Phase 2)
- [ ] Background fetch works
- [ ] Data updates within 5 minutes of change
- [ ] No crashes when health data unavailable

**Android Google Fit**
- [ ] Step count reads correctly
- [ ] Sleep data reads correctly (Phase 2)
- [ ] HRV data reads correctly (Phase 2)
- [ ] Background sync works
- [ ] Data updates within 5 minutes of change
- [ ] No crashes when health data unavailable

**Android Health Connect (Android 14+)**
- [ ] Health Connect is detected
- [ ] Permissions request works
- [ ] Data reads correctly
- [ ] Background sync works

### 5. Manual Entry Mode

**Activation**
- [ ] Manual entry mode can be enabled in settings
- [ ] Manual entry mode can be enabled during onboarding
- [ ] Mode switch persists across restarts

**Data Entry**
- [ ] Manual entry screen displays correctly
- [ ] Step count input field works
- [ ] Input validation works (0-100000 range)
- [ ] Error messages display for invalid input
- [ ] Submit button saves data
- [ ] Symbi updates after manual entry
- [ ] Manual data persists across restarts

### 6. Threshold Configuration

**Configuration Screen**
- [ ] Threshold config screen opens from settings
- [ ] Current thresholds display correctly
- [ ] Input fields are editable
- [ ] Sliders work (if using sliders)
- [ ] Default values are correct (2000, 8000)

**Validation**
- [ ] Lower threshold < higher threshold validation works
- [ ] Error message displays for invalid values
- [ ] Negative values are rejected
- [ ] Extremely high values are handled
- [ ] Save button works
- [ ] Cancel button works

**Application**
- [ ] New thresholds apply immediately
- [ ] Symbi state updates based on new thresholds
- [ ] Thresholds persist across restarts
- [ ] Reset to defaults button works (if applicable)

### 7. Settings Screen

**Display**
- [ ] Settings screen opens correctly
- [ ] All settings options display
- [ ] Current values display correctly
- [ ] Navigation works

**Options**
- [ ] Data source toggle works (auto/manual)
- [ ] Notifications toggle works
- [ ] Haptic feedback toggle works
- [ ] Sound toggle works
- [ ] Theme toggle works (if applicable)

**Links**
- [ ] Privacy policy link opens
- [ ] Support link works
- [ ] About screen opens
- [ ] Replay tutorial button works

**Data Management**
- [ ] Export data button works
- [ ] Export generates valid JSON file
- [ ] Delete data button works
- [ ] Confirmation dialog displays
- [ ] Data is actually deleted after confirmation

### 8. Phase 2 Features (If Implemented)

**Multi-Metric Analysis**
- [ ] Sleep data displays correctly
- [ ] HRV data displays correctly
- [ ] Multiple metrics shown on main screen
- [ ] AI analysis triggers daily
- [ ] AI analysis completes within 10 seconds
- [ ] Fallback to rule-based logic works

**Additional Emotional States**
- [ ] Vibrant state displays correctly
- [ ] Calm state displays correctly
- [ ] Tired state displays correctly
- [ ] Stressed state displays correctly
- [ ] Anxious state displays correctly
- [ ] Rested state displays correctly
- [ ] All animations load and play correctly

### 9. Phase 3 Features (If Implemented)

**Interactive Sessions**
- [ ] "Calm your Symbi" button appears when stressed/anxious
- [ ] Breathing exercise launches correctly
- [ ] Exercise UI displays correctly
- [ ] Timer counts down correctly
- [ ] Pause button works
- [ ] Cancel button works
- [ ] Completion updates emotional state
- [ ] Mindful minutes written to health data

**Evolution System**
- [ ] Daily state tracking works
- [ ] Progress indicator displays correctly
- [ ] Evolution eligibility calculated correctly
- [ ] Evolution trigger works at 30 days
- [ ] Image generation completes
- [ ] Evolution celebration displays
- [ ] New appearance persists
- [ ] Evolution gallery displays all forms

**Cloud Sync**
- [ ] Account creation works
- [ ] Login works
- [ ] Data syncs to cloud
- [ ] Data syncs from cloud on new device
- [ ] Sync conflicts handled correctly
- [ ] Offline queue works
- [ ] Account deletion works

---

## Platform-Specific Testing

### iOS Specific

**System Integration**
- [ ] App appears in Settings app
- [ ] HealthKit permissions manageable in Settings
- [ ] Background fetch works
- [ ] App badge works (if applicable)
- [ ] Notifications work (if applicable)
- [ ] Handoff works (if applicable)
- [ ] Siri shortcuts work (if applicable)

**UI/UX**
- [ ] Safe area insets respected
- [ ] Navigation bar displays correctly
- [ ] Tab bar displays correctly (if applicable)
- [ ] Modals display correctly
- [ ] Alerts display correctly
- [ ] Action sheets display correctly

**Device Compatibility**
- [ ] Works on iPhone 12, 13, 14, 15
- [ ] Works on iPhone SE (small screen)
- [ ] Works on iPad (if supported)
- [ ] Landscape orientation works (if supported)
- [ ] Dark mode works (if supported)

### Android Specific

**System Integration**
- [ ] App appears in Settings
- [ ] Google Fit permissions manageable
- [ ] Health Connect permissions manageable (Android 14+)
- [ ] Background sync works
- [ ] Notifications work (if applicable)
- [ ] Widgets work (if applicable)

**UI/UX**
- [ ] Material Design guidelines followed
- [ ] Navigation drawer works (if applicable)
- [ ] Bottom navigation works (if applicable)
- [ ] Floating action button works (if applicable)
- [ ] Snackbars display correctly
- [ ] Dialogs display correctly

**Device Compatibility**
- [ ] Works on Google Pixel
- [ ] Works on Samsung Galaxy
- [ ] Works on various screen sizes
- [ ] Works on tablets (if supported)
- [ ] Landscape orientation works (if supported)
- [ ] Dark mode works (if supported)

---

## Performance Testing

### App Performance

**Launch Time**
- [ ] Cold start < 3 seconds
- [ ] Warm start < 1 second
- [ ] No splash screen delays

**Animation Performance**
- [ ] Symbi animation runs at 60 FPS
- [ ] State transitions are smooth
- [ ] No frame drops during animations
- [ ] Animations perform well on low-end devices

**Memory Usage**
- [ ] Memory usage < 100MB during normal use
- [ ] No memory leaks during extended use
- [ ] Memory usage stable over time
- [ ] App doesn't crash due to memory issues

**Battery Usage**
- [ ] Battery drain < 5% over 24 hours
- [ ] Background fetch doesn't drain battery excessively
- [ ] No excessive wake-ups
- [ ] Low power mode respected

**Network Performance**
- [ ] API calls complete within 5 seconds
- [ ] Timeout handling works (10 seconds)
- [ ] Retry logic works
- [ ] Offline mode works
- [ ] No excessive network requests

### Load Testing

**Data Volume**
- [ ] Handles 30 days of health data
- [ ] Handles 90 days of emotional state history
- [ ] Handles multiple evolution records
- [ ] Large datasets don't cause slowdowns

**Concurrent Operations**
- [ ] Multiple API calls handled correctly
- [ ] Background sync doesn't interfere with UI
- [ ] Animation continues during data fetch

---

## Security & Privacy Testing

### Data Encryption

- [ ] Health data encrypted at rest
- [ ] API calls use TLS 1.3
- [ ] No health data in logs
- [ ] No health data in crash reports
- [ ] Sensitive data sanitized in error reports

### Permissions

- [ ] App requests only necessary permissions
- [ ] Permission explanations are clear
- [ ] App works with denied permissions
- [ ] Permission changes handled correctly
- [ ] No unauthorized data access

### Privacy Policy

- [ ] Privacy policy accessible in app
- [ ] Privacy policy accessible during onboarding
- [ ] Privacy policy URL works
- [ ] Privacy policy is up to date
- [ ] Privacy policy covers all data collection

### Data Management

- [ ] User can export all data
- [ ] User can delete all data
- [ ] Data deletion is permanent
- [ ] No data sent to third parties (except Gemini API)
- [ ] Analytics opt-out works

---

## Edge Cases & Error Handling

### No Health Data

- [ ] App handles no health data gracefully
- [ ] Appropriate message displayed
- [ ] Manual entry mode offered
- [ ] No crashes

### Permission Denied

- [ ] App handles denied permissions gracefully
- [ ] Explanation provided
- [ ] Manual entry mode offered
- [ ] Settings link provided
- [ ] No crashes

### No Internet Connection

- [ ] App works offline
- [ ] Cached data displayed
- [ ] Offline indicator shown
- [ ] API calls queued for later
- [ ] No crashes

### API Failures

- [ ] Timeout handled correctly (10 seconds)
- [ ] Fallback to rule-based logic works
- [ ] Error message displayed (if appropriate)
- [ ] Retry logic works
- [ ] No crashes

### Invalid Data

- [ ] Negative step counts handled
- [ ] Extremely high step counts handled
- [ ] Missing data handled
- [ ] Corrupted data handled
- [ ] No crashes

### Low Storage

- [ ] App handles low storage gracefully
- [ ] Appropriate message displayed
- [ ] Old data cleaned up if needed
- [ ] No crashes

### Low Battery

- [ ] Low power mode detected
- [ ] Background fetch paused
- [ ] Animation frame rate reduced
- [ ] No excessive battery drain

### App Backgrounding

- [ ] App state saved when backgrounded
- [ ] App resumes correctly when foregrounded
- [ ] Background fetch works
- [ ] No data loss

### App Termination

- [ ] App state saved when terminated
- [ ] App restores state on relaunch
- [ ] No data loss
- [ ] No crashes on relaunch

---

## Requirements Verification

### Requirement 1: Health Data Integration

- [ ] 1.1: Onboarding explains permissions ✓
- [ ] 1.2: HealthKit integration works ✓
- [ ] 1.3: Google Fit integration works ✓
- [ ] 1.4: Manual entry mode works ✓
- [ ] 1.5: Background updates work within 5 minutes ✓

### Requirement 2: Manual Data Entry

- [ ] 2.1: Manual entry form displays ✓
- [ ] 2.2: Valid input (0-100000) accepted ✓
- [ ] 2.3: Invalid input rejected with error ✓
- [ ] 2.4: Mode switching works ✓

### Requirement 3: Configurable State Thresholds

- [ ] 3.1: Default thresholds (2000, 8000) set ✓
- [ ] 3.2: Threshold config screen accessible ✓
- [ ] 3.3: Modified thresholds apply ✓
- [ ] 3.4: Validation prevents invalid thresholds ✓
- [ ] 3.5: Thresholds persist ✓

### Requirement 4: Phase 1 MVP

- [ ] 4.1: Sad state displays correctly ✓
- [ ] 4.2: Resting state displays correctly ✓
- [ ] 4.3: Active state displays correctly ✓
- [ ] 4.4: Symbi has purple/Halloween aesthetic ✓
- [ ] 4.5: State transitions smooth (1-3 seconds) ✓

### Requirement 5-8: Phase 2 & 3 (If Implemented)

- [ ] Verify all Phase 2 requirements ✓
- [ ] Verify all Phase 3 requirements ✓

### Requirement 9: Cross-Platform Compatibility

- [ ] 9.1: React Native used ✓
- [ ] 9.2: iOS 14+ supported ✓
- [ ] 9.3: Android 8+ supported ✓
- [ ] 9.4: Animations identical on both platforms ✓
- [ ] 9.5: Cloud sync works (Phase 3) ✓

### Requirement 10: Battery Efficiency

- [ ] 10.1: Background fetch used (no polling) ✓
- [ ] 10.2: AI requests limited to 1/day ✓
- [ ] 10.3: Animation frame rate reduced when backgrounded ✓
- [ ] 10.4: Battery usage < 5% over 24 hours ✓
- [ ] 10.5: Low power mode respected ✓

### Requirement 11: Privacy and Data Security

- [ ] 11.1: Privacy policy displayed ✓
- [ ] 11.2: TLS 1.3 used for API calls ✓
- [ ] 11.3: Health data not stored on servers > 24 hours ✓
- [ ] 11.4: Account deletion works within 7 days ✓
- [ ] 11.5: Data export works ✓

### Requirement 12: Visual Design

- [ ] 12.1: Symbi is ghost-based on Kiro design ✓
- [ ] 12.2: Purple color palette used ✓
- [ ] 12.3: Halloween elements present ✓
- [ ] 12.4: Cute aesthetic maintained ✓
- [ ] 12.5: Darker tones in negative states ✓

### Requirement 13: Onboarding Experience

- [ ] 13.1: 3-5 onboarding screens present ✓
- [ ] 13.2: Health data connection explained ✓
- [ ] 13.3: Permission explanations specific ✓
- [ ] 13.4: Skip option available ✓
- [ ] 13.5: Replay tutorial accessible ✓

### Requirement 14: Error Handling & Offline Support

- [ ] 14.1: Cached state displayed when offline ✓
- [ ] 14.2: Error messages with troubleshooting ✓
- [ ] 14.3: 30 days of data cached ✓
- [ ] 14.4: Offline data syncs when online ✓
- [ ] 14.5: Evolution queued when offline ✓

---

## Final Submission Checklist

### Code Quality

- [ ] No console errors or warnings
- [ ] No TODO comments in production code
- [ ] Code is properly formatted
- [ ] No unused imports or variables
- [ ] TypeScript types are correct
- [ ] ESLint passes with no errors
- [ ] Tests pass (if applicable)

### Assets

- [ ] All images optimized
- [ ] All animations load correctly
- [ ] App icon present and correct
- [ ] Splash screen present and correct
- [ ] All required sizes generated

### Configuration

- [ ] App version correct (1.0.0)
- [ ] Bundle ID correct (com.symbi.app)
- [ ] Build number correct
- [ ] Environment variables set
- [ ] API keys configured
- [ ] Sentry DSN configured

### Documentation

- [ ] README updated
- [ ] Privacy policy finalized
- [ ] Release notes written
- [ ] App Store metadata prepared
- [ ] Play Store metadata prepared

### Store Submission

**iOS**
- [ ] HealthKit entitlement added
- [ ] Info.plist usage descriptions correct
- [ ] Screenshots prepared (all sizes)
- [ ] App description written
- [ ] Keywords selected
- [ ] Privacy policy URL added
- [ ] Support URL added
- [ ] Age rating set (4+)
- [ ] Build uploaded to App Store Connect
- [ ] App review notes prepared

**Android**
- [ ] Health Connect permissions declared
- [ ] Google Fit permissions configured
- [ ] Screenshots prepared
- [ ] Feature graphic created
- [ ] App description written
- [ ] Data Safety section completed
- [ ] Privacy policy URL added
- [ ] Age rating set (Everyone)
- [ ] APK/AAB uploaded to Play Console
- [ ] Pre-launch report reviewed

### Final Checks

- [ ] All team members reviewed
- [ ] Legal review completed (if required)
- [ ] Privacy review completed
- [ ] Security review completed
- [ ] All critical bugs fixed
- [ ] All requirements met
- [ ] Ready for submission

---

## Testing Report Template

```markdown
# Symbi QA Testing Report

**Date**: [Date]
**Tester**: [Name]
**Build Version**: [Version]
**Platform**: [iOS/Android]
**Device**: [Device Model]
**OS Version**: [OS Version]

## Summary

- Total Tests: [Number]
- Passed: [Number]
- Failed: [Number]
- Blocked: [Number]

## Critical Issues

1. [Issue description]
   - Severity: Critical/High/Medium/Low
   - Steps to reproduce:
   - Expected result:
   - Actual result:
   - Screenshots/Videos:

## Recommendations

- [Recommendation 1]
- [Recommendation 2]

## Sign-off

- [ ] Ready for submission
- [ ] Needs fixes before submission

**Tester Signature**: _______________
**Date**: _______________
```

---

## Notes

- Test on actual devices, not just simulators/emulators
- Test with real health data, not just mock data
- Test in various network conditions (WiFi, cellular, offline)
- Test with different user behaviors (power users, casual users)
- Document all issues found, even minor ones
- Prioritize critical bugs that block submission
- Retest after fixes are applied
- Get sign-off from all stakeholders before submission

## Timeline

**Estimated Testing Time:**
- Functional Testing: 8-12 hours
- Platform-Specific Testing: 4-6 hours
- Performance Testing: 2-4 hours
- Security Testing: 2-3 hours
- Edge Cases: 2-4 hours
- Requirements Verification: 2-3 hours
- **Total: 20-32 hours**

**Recommended Schedule:**
- Week 1: Functional testing
- Week 2: Platform-specific and performance testing
- Week 3: Security and edge case testing
- Week 4: Requirements verification and final checks
