# Google Play Store Metadata

## App Information

### App Name

**Symbi - Your Health Companion**

### Short Description (80 characters max)

Transform your health data into a living, Halloween-themed digital pet

### Package Name

`com.symbi.app`

### Version

1.0.0 (Version Code: 1)

### Content Rating

Everyone

## Full Description (4000 characters max)

**Transform Your Health Journey Into a Living Companion**

Symbi is more than just a health tracker—it's your personal digital pet that grows and evolves with your wellness journey. Watch as your adorable Halloween-themed ghost companion reflects your daily activity, sleep, and overall wellbeing through expressive animations and emotional states.

**🎃 Your Health, Visualized**
• Connect to Google Fit or Health Connect to automatically sync your activity
• See your Symbi react in real-time to your activity levels
• Watch your pet transition between emotional states based on your wellness
• Beautiful purple ghost design with smooth animations

**👻 Cute Yet Spooky Aesthetic**
• Halloween-themed ghost character with personality
• Multiple emotional states: Active, Resting, Calm, Vibrant, and more
• Smooth Lottie animations that bring your Symbi to life
• Evolve your Symbi into unique forms as you maintain healthy habits

**🔒 Privacy-First Design**
• All health data processing happens locally on your device
• You control what data is shared—use automatic sync or manual entry
• No selling of your personal information, ever
• Optional AI-powered insights using secure, encrypted connections
• Export or delete your data at any time

**✨ Key Features**

_Core Experience_
• Automatic step tracking via Google Fit or Health Connect
• Three basic emotional states (Sad, Resting, Active)
• Customizable activity thresholds to match your fitness level
• Manual data entry mode for privacy-conscious users
• Beautiful onboarding experience

_AI-Powered Insights_
• Multi-metric health analysis (steps, sleep, HRV)
• AI-driven emotional state detection with 6 additional states
• Personalized wellness insights
• Fallback to local processing if you prefer

_Interactive & Evolving_
• Guided breathing exercises to calm your Symbi
• Mindful minutes tracking
• Generative evolution system—watch your Symbi transform
• Evolution gallery to view your pet's journey
• Optional cloud sync to keep your progress across devices

**🎯 Perfect For**
• Anyone looking to make health tracking more engaging
• Users who want a visual representation of their wellness
• People who love digital pets and gamification
• Health-conscious individuals seeking motivation
• Fans of cute Halloween aesthetics

**💪 Motivation Through Connection**
Your Symbi isn't just tracking numbers—it's experiencing your health journey with you. When you're active, your Symbi is vibrant and energetic. When you need rest, your Symbi reflects that too. This emotional connection creates genuine motivation to maintain healthy habits.

**🔐 Your Data, Your Control**
We believe health data is deeply personal. That's why:
• Raw health data never leaves your device
• AI analysis uses only aggregated daily metrics
• You can use the app entirely offline
• Complete data export available anytime
• Transparent privacy policy

**📱 Requirements**
• Android 8.0 (Oreo) or later
• Optional: Google Fit or Health Connect for automatic tracking
• Internet connection for AI features (optional)

**🆓 Free to Use**
Symbi is completely free with no ads, no subscriptions, and no hidden costs. Your health journey shouldn't have a price tag.

Download Symbi today and start your journey with your new digital companion! 👻💜

## Privacy Policy URL

https://symbi.app/privacy-policy

## Categories

**Primary Category**: Health & Fitness
**Tags**: health, fitness, wellness, activity tracker, step counter, digital pet, tamagotchi, gamification

## Graphic Assets

### App Icon

- Size: 512x512 pixels
- Format: PNG (32-bit)
- Design: Symbi ghost character with purple gradient background

### Feature Graphic

- Size: 1024x500 pixels
- Format: PNG or JPEG
- Design: Symbi character with app name and tagline
- Text: "Your Health Companion" or "Transform Your Wellness Journey"

### Screenshots

**Phone Screenshots** (Required)

- Minimum: 2 screenshots
- Recommended: 4-8 screenshots
- Format: PNG or JPEG
- Dimensions: 16:9 or 9:16 aspect ratio

**Screenshot 1: Main Screen**

- Show Symbi in Active state with step count
- Caption: "Meet Your Health Companion"

**Screenshot 2: Emotional States**

- Show multiple emotional states
- Caption: "Your Symbi Reflects Your Wellness"

**Screenshot 3: Health Data Integration**

- Show Google Fit or Health Connect integration
- Caption: "Seamlessly Connects to Your Health Data"

**Screenshot 4: Customization**

- Show threshold configuration
- Caption: "Customize to Your Fitness Level"

**Screenshot 5: Evolution**

- Show evolution celebration or gallery
- Caption: "Watch Your Symbi Evolve"

**Screenshot 6: Privacy**

- Show privacy settings or manual entry mode
- Caption: "Your Data, Your Control"

**Tablet Screenshots** (Optional)

- 7-inch and 10-inch tablet layouts
- Same content as phone screenshots

### Promo Video (Optional but Recommended)

- Duration: 30 seconds to 2 minutes
- Format: YouTube URL
- Content: App walkthrough showing key features

## Data Safety Section

### Data Collection and Security

**Data Collected**:

1. **Health and Fitness**
   - Data types: Physical activity (steps), Sleep, Heart rate
   - Collection: Optional (user can choose manual entry)
   - Purpose: App functionality
   - Sharing: Not shared with third parties
   - Deletion: User can delete anytime

2. **App Activity**
   - Data types: App interactions, In-app search history
   - Collection: Optional (can opt-out)
   - Purpose: Analytics
   - Sharing: Not shared with third parties
   - Deletion: Automatically deleted after 90 days

3. **Device or Other IDs**
   - Data types: Device ID (anonymous)
   - Collection: Automatic
   - Purpose: App functionality, Analytics
   - Sharing: Not shared with third parties
   - Deletion: Deleted with app uninstall

**Data Security**:

- ✅ Data is encrypted in transit (TLS 1.3)
- ✅ Data is encrypted at rest (AES-256)
- ✅ You can request data deletion
- ✅ Data is not shared with third parties
- ✅ Data is not sold to third parties
- ✅ Data is not used for advertising

**Data Usage**:

- App functionality: Health data used to power Symbi's emotional states
- Analytics: Anonymous usage patterns (no health data included)
- Optional AI features: Aggregated daily metrics only

## Health Connect Integration (Android 14+)

### Permissions Required

**Read Permissions**:

- `STEPS` - Daily step count
- `SLEEP` - Sleep duration (Phase 2+)
- `HEART_RATE_VARIABILITY_RMSSD` - HRV measurements (Phase 2+)

**Write Permissions**:

- `EXERCISE` - Mindful minutes sessions (Phase 3+)

### Health Connect Declaration

Add to `AndroidManifest.xml`:

```xml
<!-- Health Connect Permissions -->
<uses-permission android:name="android.permission.health.READ_STEPS"/>
<uses-permission android:name="android.permission.health.READ_SLEEP"/>
<uses-permission android:name="android.permission.health.READ_HEART_RATE_VARIABILITY"/>
<uses-permission android:name="android.permission.health.WRITE_EXERCISE"/>

<!-- Health Connect Intent Filter -->
<intent-filter>
    <action android:name="androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" />
</intent-filter>
```

### Health Connect Privacy Policy Requirements

Must include in privacy policy:

- What health data is collected
- How health data is used
- How health data is stored
- How users can delete their data
- Third-party data sharing (if any)

## Google Fit Integration (Android 8.0-13)

### Permissions Required

Add to `AndroidManifest.xml`:

```xml
<!-- Google Fit Permissions -->
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
<uses-permission android:name="com.google.android.gms.permission.ACTIVITY_RECOGNITION" />
```

### OAuth 2.0 Scopes

Required scopes:

- `https://www.googleapis.com/auth/fitness.activity.read`
- `https://www.googleapis.com/auth/fitness.sleep.read`
- `https://www.googleapis.com/auth/fitness.heart_rate.read`
- `https://www.googleapis.com/auth/fitness.body.read`

## Store Listing

### What's New (Release Notes)

**Version 1.0.0**

🎉 Welcome to Symbi!

Meet your new health companion—a Halloween-themed digital pet that brings your wellness data to life.

✨ Features:
• Connect to Google Fit or Health Connect for automatic tracking
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

## Content Rating Questionnaire

**Violence**: None
**Sexual Content**: None
**Profanity**: None
**Controlled Substances**: None
**Gambling**: None
**User Interaction**: None (no social features in v1.0)
**Shares Location**: No
**Unrestricted Internet Access**: No (only for optional AI features)

**Result**: Everyone

## Pricing and Distribution

### Pricing

- **Price**: Free
- **In-app purchases**: None
- **Ads**: None

### Countries

- **Distribution**: All available countries
- **Exclude**: None

### Device Categories

- **Phone**: Yes
- **Tablet**: Yes
- **Wear OS**: No
- **Android TV**: No
- **Android Auto**: No

## App Access

**Special Access**: None required

**Permissions Explanation**:

- Activity Recognition: To read step count from Google Fit
- Internet: For optional AI-powered features
- Foreground Service: For background health data sync

## Target Audience and Content

### Target Age

- **Target Age Group**: 13+
- **Appeals to Children**: No

### Ads

- **Contains Ads**: No
- **Ad ID**: Not used

## Contact Details

**Email**: support@symbi.app
**Phone**: [Optional]
**Website**: https://symbi.app

**Privacy Policy**: https://symbi.app/privacy-policy

## Pre-Launch Report

Before publishing, complete:

- [ ] Run pre-launch report in Play Console
- [ ] Test on multiple device types
- [ ] Review crash reports
- [ ] Check accessibility
- [ ] Verify all permissions work correctly

## Submission Checklist

- [ ] App icon (512x512) prepared
- [ ] Feature graphic (1024x500) prepared
- [ ] Screenshots for phone (minimum 2) prepared
- [ ] Full description written and reviewed
- [ ] Short description written (80 chars max)
- [ ] Privacy policy hosted and URL added
- [ ] Data Safety section completed
- [ ] Health Connect permissions declared (Android 14+)
- [ ] Google Fit permissions configured (Android 8-13)
- [ ] Content rating questionnaire completed
- [ ] Release notes written
- [ ] Contact information added
- [ ] APK/AAB uploaded
- [ ] All store listing fields completed
- [ ] Pre-launch report reviewed
- [ ] Submit for review

## Post-Submission

**Review Timeline**: Typically 1-3 days (can be up to 7 days)
**Status Monitoring**: Check Play Console regularly

**If Rejected**:

1. Read rejection reason in Play Console
2. Address all policy violations
3. Update app or metadata as needed
4. Respond to reviewer with resolution details
5. Resubmit for review

## Play Store Optimization Tips

1. **Keywords**: Include in description naturally
   - health tracker, fitness app, digital pet, step counter
   - wellness companion, activity tracker, tamagotchi
   - halloween, ghost, cute, gamification

2. **Localization**: Consider translating to:
   - Spanish (es)
   - French (fr)
   - German (de)
   - Portuguese (pt-BR)
   - Japanese (ja)

3. **A/B Testing**: Use Play Console experiments for:
   - App icon variations
   - Feature graphic designs
   - Screenshot order

4. **Updates**: Regular updates improve ranking
   - Bug fixes
   - New features
   - Performance improvements

## Health Connect Migration Guide

For users upgrading from Google Fit to Health Connect:

1. Detect Android version (14+)
2. Check if Health Connect is available
3. Prompt user to migrate data
4. Request new Health Connect permissions
5. Migrate historical data if possible
6. Update app to use Health Connect APIs

**Code Reference**: See `src/services/HealthDataService.ts` for implementation
