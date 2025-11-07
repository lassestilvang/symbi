# App Store Submission Quick Reference

A one-page reference for submitting Symbi to app stores.

## Pre-Flight Check ✈️

```bash
npm run pre-submit  # Run automated checks
```

- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance targets met (battery < 5%, memory < 100MB)
- [ ] Privacy policy hosted at https://symbi.app/privacy-policy

## iOS Submission 🍎

### Build & Upload
```bash
eas build --platform ios --profile production
# Or: Xcode > Product > Archive > Distribute App
```

### App Store Connect Checklist
- [ ] App name: "Symbi - Your Health Companion"
- [ ] Category: Health & Fitness
- [ ] Age rating: 4+
- [ ] Screenshots uploaded (6.7" and 6.5" required)
- [ ] Description and keywords added
- [ ] Privacy policy URL: https://symbi.app/privacy-policy
- [ ] HealthKit entitlement enabled
- [ ] Build selected
- [ ] App review notes added
- [ ] Submit for review

### Key Info
- **Bundle ID**: com.symbi.app
- **Version**: 1.0.0
- **Build**: 1
- **Review time**: 24-48 hours

## Android Submission 🤖

### Build & Upload
```bash
eas build --platform android --profile production
# Or: cd android && ./gradlew bundleRelease
```

### Play Console Checklist
- [ ] App name: "Symbi - Your Health Companion"
- [ ] Category: Health & Fitness
- [ ] Age rating: Everyone
- [ ] Screenshots uploaded (minimum 2)
- [ ] Feature graphic uploaded (1024x500)
- [ ] Description added
- [ ] Privacy policy URL: https://symbi.app/privacy-policy
- [ ] Data Safety section completed
- [ ] Content rating completed
- [ ] AAB uploaded
- [ ] Submit for review

### Key Info
- **Package**: com.symbi.app
- **Version**: 1.0.0
- **Version code**: 1
- **Review time**: 1-3 days (up to 7)

## Required Assets 📸

### App Icons
- iOS: 1024x1024 (no transparency)
- Android: 512x512 (with transparency)
- Adaptive: 432x432 (foreground + background)

### Screenshots
- iOS 6.7": 1290 x 2796 (5-8 screenshots)
- iOS 6.5": 1242 x 2688 (5-8 screenshots)
- Android: 1080 x 1920 (4-8 screenshots)

### Other
- Feature graphic (Android): 1024 x 500
- Preview video (optional): 30 seconds

## Screenshot Content 📱

1. **Main Screen**: Symbi with step count
2. **Emotional States**: Multiple states shown
3. **Health Integration**: Permission/data sync
4. **Customization**: Threshold configuration
5. **Evolution**: Evolution celebration/gallery

## Privacy & Permissions 🔒

### iOS HealthKit
- Read: Steps, Sleep, HRV
- Write: Mindful Minutes
- Usage: "Symbi uses your step count, sleep data, and heart rate variability to reflect your activity in your digital pet's mood and appearance."

### Android
- Google Fit (8-13): Activity Recognition
- Health Connect (14+): Steps, Sleep, HRV, Exercise

### Data Safety
- Health data: Collected (optional), not shared
- Analytics: Collected (optional, opt-out), not shared
- Encrypted: In transit (TLS 1.3) and at rest (AES-256)

## App Description (Short) 📝

**iOS Subtitle (30 chars):**
Transform your health data

**Android Short (80 chars):**
Transform your health data into a living, Halloween-themed digital pet

## Keywords 🔑

symbi, health, fitness, tamagotchi, digital pet, step counter, sleep tracker, wellness, health companion, activity tracker, halloween, ghost, cute, motivation, gamification

## Release Notes 📋

```
🎉 Welcome to Symbi!

Meet your new health companion—a Halloween-themed digital pet that brings your wellness data to life.

✨ Features:
• Connect to Apple Health/Google Fit for automatic tracking
• Watch your Symbi react to your daily activity
• Customize activity thresholds to match your goals
• Beautiful animations with multiple emotional states
• Privacy-first design—your data stays on your device
• Manual entry mode for complete privacy control

🎃 Coming Soon:
• AI-powered multi-metric analysis
• Sleep and HRV tracking
• Interactive breathing exercises
• Generative evolution system

Start your journey with Symbi today! 👻💜
```

## Review Notes 📝

```
Thank you for reviewing Symbi!

TESTING:
1. Grant HealthKit/Google Fit permissions during onboarding
2. App reads step count from health data
3. Manual entry mode available if permissions denied
4. Symbi displays different states based on activity:
   - Below 2000 steps: Sad
   - 2000-8000 steps: Resting
   - Above 8000 steps: Active
5. Thresholds customizable in settings

PRIVACY:
- All health data processed locally
- No data sent to external servers (Phase 1)
- Users can opt for manual entry without permissions
- Complete privacy policy available

HEALTHKIT/HEALTH CONNECT:
- Read: Steps, Sleep, HRV
- Write: Mindful Minutes (only when user completes activities)
- All permissions clearly explained during onboarding
```

## Common Issues & Fixes 🔧

### iOS
- **Build processing failed**: Check entitlements and Info.plist
- **HealthKit rejected**: Make usage descriptions more specific
- **Metadata rejected**: Ensure screenshots show actual app

### Android
- **Upload failed**: Check signing configuration
- **Data Safety incomplete**: Complete all sections
- **Policy violation**: Review Play Store policies

## Post-Submission 📊

### Day 1
- Verify app is live
- Monitor crash reports (Sentry)
- Set up analytics

### Week 1
- Respond to reviews
- Track metrics (downloads, DAU)
- Fix critical bugs

### Month 1
- Analyze user behavior
- Plan first update
- Implement fixes

## Support 🆘

- **iOS**: https://developer.apple.com/support/
- **Android**: https://support.google.com/googleplay/android-developer
- **Docs**: See `docs/app-store/` directory

## Quick Links 🔗

- [Full Submission Guide](./submission-guide.md)
- [iOS Metadata](./ios-metadata.md)
- [Android Metadata](./android-metadata.md)
- [QA Checklist](../qa-testing-checklist.md)
- [Privacy Policy](../privacy-policy.md)

---

**Version**: 1.0.0  
**Last Updated**: November 7, 2025  
**Status**: Ready for Submission ✅
