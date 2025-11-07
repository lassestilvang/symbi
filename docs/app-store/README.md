# App Store Submission Documentation

This directory contains all documentation and resources needed for submitting Symbi to the Apple App Store and Google Play Store.

## Directory Contents

### Core Documentation

- **[submission-guide.md](./submission-guide.md)** - Step-by-step guide for submitting to both app stores
- **[ios-metadata.md](./ios-metadata.md)** - Complete iOS App Store metadata and configuration
- **[android-metadata.md](./android-metadata.md)** - Complete Google Play Store metadata and configuration
- **[preview-materials-guide.md](./preview-materials-guide.md)** - Guide for creating screenshots, videos, and graphics
- **[app-icon-design-spec.md](./app-icon-design-spec.md)** - Detailed app icon design specifications

### Supporting Documentation

- **[../qa-testing-checklist.md](../qa-testing-checklist.md)** - Comprehensive QA testing checklist
- **[../test-plan.md](../test-plan.md)** - Complete test plan and strategy
- **[../crash-reporting-setup.md](../crash-reporting-setup.md)** - Sentry crash reporting setup guide
- **[../privacy-policy.md](../privacy-policy.md)** - Privacy policy (must be hosted)

## Quick Start

### 1. Pre-Submission Preparation

Before starting the submission process:

```bash
# Run pre-submission tests
npm run pre-submit

# Review QA checklist
open docs/qa-testing-checklist.md

# Verify all requirements met
open docs/test-plan.md
```

### 2. Prepare Assets

Create all required visual assets:

- [ ] App icon (1024x1024 for iOS, 512x512 for Android)
- [ ] Adaptive icon (432x432 for Android)
- [ ] Screenshots (5-8 per platform, multiple sizes)
- [ ] Feature graphic (1024x500 for Android)
- [ ] Preview video (optional but recommended)

See [preview-materials-guide.md](./preview-materials-guide.md) for detailed specifications.

### 3. iOS Submission

Follow the iOS submission guide:

```bash
# Build for iOS
eas build --platform ios --profile production

# Or using Xcode
# Product > Archive > Distribute App
```

Complete checklist:
- [ ] Build uploaded to App Store Connect
- [ ] Metadata completed (see [ios-metadata.md](./ios-metadata.md))
- [ ] Screenshots uploaded
- [ ] Privacy questionnaire completed
- [ ] Submitted for review

### 4. Android Submission

Follow the Android submission guide:

```bash
# Build for Android
eas build --platform android --profile production

# Or using Gradle
cd android && ./gradlew bundleRelease
```

Complete checklist:
- [ ] AAB uploaded to Play Console
- [ ] Store listing completed (see [android-metadata.md](./android-metadata.md))
- [ ] Data Safety section completed
- [ ] Screenshots uploaded
- [ ] Submitted for review

## Key Resources

### App Store Connect
- URL: https://appstoreconnect.apple.com
- Documentation: [ios-metadata.md](./ios-metadata.md)
- Review Guidelines: https://developer.apple.com/app-store/review/guidelines/

### Google Play Console
- URL: https://play.google.com/console
- Documentation: [android-metadata.md](./android-metadata.md)
- Policy Guidelines: https://play.google.com/about/developer-content-policy/

### Privacy Policy
- Location: [../privacy-policy.md](../privacy-policy.md)
- Must be hosted at: https://symbi.app/privacy-policy
- Required for both app stores

## Metadata Summary

### App Name
**Symbi - Your Health Companion**

### Short Description
Transform your health data into a living, Halloween-themed digital pet

### Categories
- **Primary**: Health & Fitness
- **Secondary**: Lifestyle

### Age Rating
- **iOS**: 4+
- **Android**: Everyone

### Price
Free (no in-app purchases, no ads)

### Keywords
symbi, health, fitness, tamagotchi, digital pet, step counter, sleep tracker, wellness, health companion, activity tracker, halloween, ghost, cute, motivation, gamification

## Screenshots Required

### iOS
- **6.7" Display** (iPhone 14 Pro Max, 15 Pro Max): 1290 x 2796 px - Required
- **6.5" Display** (iPhone 11 Pro Max, XS Max): 1242 x 2688 px - Required
- **5.5" Display** (iPhone 8 Plus): 1242 x 2208 px - Optional

### Android
- **Phone**: 1080 x 1920 px (minimum 2 screenshots)
- **Tablet**: 1200 x 1920 px (optional)

See [preview-materials-guide.md](./preview-materials-guide.md) for content suggestions.

## Privacy & Permissions

### iOS HealthKit Permissions
- **Read**: Step Count, Sleep Analysis, Heart Rate Variability
- **Write**: Mindful Minutes
- **Usage Description**: See [ios-metadata.md](./ios-metadata.md)

### Android Permissions
- **Google Fit** (Android 8-13): Activity Recognition, Fitness Activity
- **Health Connect** (Android 14+): Steps, Sleep, HRV, Exercise
- **Permissions**: See [android-metadata.md](./android-metadata.md)

## Data Safety (Google Play)

### Data Collected
- Health & Fitness: Steps, Sleep, HRV (optional)
- App Activity: Usage analytics (optional, opt-out available)
- Device ID: Anonymous identifier

### Data Security
- ✅ Encrypted in transit (TLS 1.3)
- ✅ Encrypted at rest (AES-256)
- ✅ User can request deletion
- ✅ Not shared with third parties
- ✅ Not sold

## Review Timeline

### Expected Review Times
- **iOS**: 24-48 hours (typically)
- **Android**: 1-3 days (can be up to 7 days)

### Total Time to Launch
- **iOS**: 3-4 days from submission
- **Android**: 4-8 days from submission

## Common Rejection Reasons

### iOS
1. **HealthKit Usage Not Clear**: Ensure usage descriptions are specific
2. **Missing Privacy Policy**: Must be accessible during onboarding
3. **Metadata Issues**: Screenshots must show actual app content
4. **Performance Issues**: App must not crash or freeze

### Android
1. **Data Safety Incomplete**: Complete all sections thoroughly
2. **Policy Violations**: Review Play Store policies carefully
3. **Permissions Not Justified**: Explain why each permission is needed
4. **Health Connect Issues**: Ensure proper integration on Android 14+

## Post-Submission Monitoring

### Day 1
- [ ] Verify app is live in stores
- [ ] Test download and installation
- [ ] Monitor crash reports (Sentry)
- [ ] Set up analytics dashboards

### Week 1
- [ ] Monitor user reviews daily
- [ ] Respond to user feedback
- [ ] Track key metrics (downloads, DAU, retention)
- [ ] Fix critical bugs immediately

### Month 1
- [ ] Analyze user behavior
- [ ] Identify pain points
- [ ] Plan first update
- [ ] Implement high-priority fixes

## Support Contacts

### Internal
- **QA Team**: For testing questions
- **Development Team**: For technical issues
- **Product Owner**: For feature/requirement questions

### External
- **Apple Developer Support**: https://developer.apple.com/support/
- **Google Play Support**: https://support.google.com/googleplay/android-developer

## Useful Commands

```bash
# Run pre-submission tests
npm run pre-submit

# Build for iOS (EAS)
eas build --platform ios --profile production

# Build for Android (EAS)
eas build --platform android --profile production

# Run linter
npm run lint

# Run tests
npm test

# Check TypeScript
npx tsc --noEmit
```

## Checklist Before Submission

### Development
- [ ] All features implemented
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance targets met
- [ ] Security review completed

### Assets
- [ ] App icon created
- [ ] Screenshots created (all sizes)
- [ ] Feature graphic created (Android)
- [ ] Preview video created (optional)

### Documentation
- [ ] Privacy policy hosted
- [ ] App descriptions written
- [ ] Release notes written
- [ ] Review notes prepared

### Configuration
- [ ] Version numbers updated
- [ ] Bundle IDs correct
- [ ] Permissions configured
- [ ] Entitlements added (iOS)
- [ ] Signing configured

### Testing
- [ ] QA testing completed
- [ ] All critical bugs fixed
- [ ] Tested on multiple devices
- [ ] Tested on multiple OS versions

### Submission
- [ ] Builds uploaded
- [ ] Metadata completed
- [ ] Screenshots uploaded
- [ ] Privacy questionnaires completed
- [ ] Submitted for review

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-07 | Initial release |

## Notes

- Keep all documentation up to date
- Save all correspondence with app store reviewers
- Document any issues encountered during submission
- Update this README for future releases
- Share learnings with the team

## Next Steps

After successful submission:

1. **Monitor**: Watch crash reports and user feedback
2. **Respond**: Reply to user reviews promptly
3. **Analyze**: Track metrics and user behavior
4. **Iterate**: Plan updates based on feedback
5. **Market**: Promote the app through various channels

Good luck with your submission! 🚀👻💜
