# App Store Submission Guide

This guide provides step-by-step instructions for submitting Symbi to the Apple App Store and Google Play Store.

## Pre-Submission Checklist

Before starting the submission process, ensure you have completed:

- [ ] All features implemented and tested
- [ ] QA testing completed (see `docs/qa-testing-checklist.md`)
- [ ] All critical bugs fixed
- [ ] Performance targets met
- [ ] Security and privacy review completed
- [ ] App store metadata prepared
- [ ] Screenshots and preview materials created
- [ ] Privacy policy hosted and accessible
- [ ] Crash reporting configured (Sentry)
- [ ] Pre-submission tests passed (`scripts/pre-submission-tests.sh`)

## iOS App Store Submission

### Step 1: Prepare Your Build

1. **Update Version and Build Number**

   ```bash
   # In app.json
   "version": "1.0.0"
   "ios": {
     "buildNumber": "1"
   }
   ```

2. **Configure Signing**
   - Open Xcode
   - Select your project
   - Go to Signing & Capabilities
   - Select your team
   - Ensure automatic signing is enabled

3. **Add HealthKit Entitlement**
   - In Xcode, go to Signing & Capabilities
   - Click "+ Capability"
   - Add "HealthKit"
   - Verify entitlements are in app.json

4. **Build for Release**

   ```bash
   # Using Expo/EAS
   eas build --platform ios --profile production

   # Or using Xcode
   # Product > Archive
   ```

### Step 2: Upload to App Store Connect

1. **Using Xcode**
   - After archiving, click "Distribute App"
   - Select "App Store Connect"
   - Select "Upload"
   - Wait for upload to complete

2. **Using Transporter**
   - Export IPA from Xcode
   - Open Transporter app
   - Drag and drop IPA file
   - Click "Deliver"

3. **Verify Upload**
   - Go to App Store Connect
   - Navigate to your app
   - Check "TestFlight" tab
   - Wait for processing (10-30 minutes)

### Step 3: Complete App Store Connect Metadata

1. **App Information**
   - Go to App Store Connect
   - Select your app
   - Go to "App Information"
   - Fill in:
     - Name: "Symbi - Your Health Companion"
     - Subtitle: "Transform your health data into a living digital pet"
     - Category: Health & Fitness (Primary), Lifestyle (Secondary)
     - Privacy Policy URL: https://symbi.app/privacy-policy
     - Support URL: https://symbi.app/support

2. **Pricing and Availability**
   - Price: Free
   - Availability: All territories
   - Pre-order: No

3. **App Privacy**
   - Click "Get Started"
   - Data Collection:
     - Health & Fitness: Yes (steps, sleep, HRV)
     - Usage Data: Yes (optional analytics)
   - Data Usage:
     - App Functionality: Yes
     - Analytics: Yes (optional)
   - Data Linked to User: None (if not using cloud sync)
   - Complete questionnaire

4. **Version Information**
   - Go to "1.0 Prepare for Submission"
   - Add screenshots (all required sizes)
   - Add app description (see `docs/app-store/ios-metadata.md`)
   - Add keywords
   - Add promotional text (optional)
   - Add support URL
   - Add marketing URL (optional)

5. **Build**
   - Select the build you uploaded
   - Add export compliance information:
     - Uses encryption: No (or Yes if using HTTPS)
     - Exempt from regulations: Yes (standard HTTPS)

6. **App Review Information**
   - Contact information (your details)
   - Demo account: Not required
   - Notes for reviewer (see `docs/app-store/ios-metadata.md`)
   - Attachments: None required

7. **Version Release**
   - Automatic release: Recommended
   - Or: Manual release after approval

### Step 4: Submit for Review

1. Click "Add for Review"
2. Review all information
3. Click "Submit for Review"
4. Wait for review (typically 24-48 hours)

### Step 5: Monitor Review Status

1. Check App Store Connect regularly
2. Respond to any reviewer questions within 24 hours
3. If rejected:
   - Read rejection reason carefully
   - Fix issues
   - Update build if needed
   - Resubmit with resolution notes

### Step 6: Release

1. Once approved, app will be released automatically (or manually if selected)
2. Monitor crash reports and user feedback
3. Respond to user reviews
4. Plan first update based on feedback

---

## Google Play Store Submission

### Step 1: Prepare Your Build

1. **Update Version and Build Number**

   ```bash
   # In app.json
   "version": "1.0.0"
   "android": {
     "versionCode": 1
   }
   ```

2. **Generate Signing Key**

   ```bash
   # If you don't have a keystore
   keytool -genkeypair -v -storetype PKCS12 -keystore symbi-release.keystore \
     -alias symbi -keyalg RSA -keysize 2048 -validity 10000
   ```

3. **Configure Signing**
   - Create `android/gradle.properties`:
     ```
     SYMBI_UPLOAD_STORE_FILE=symbi-release.keystore
     SYMBI_UPLOAD_KEY_ALIAS=symbi
     SYMBI_UPLOAD_STORE_PASSWORD=your-password
     SYMBI_UPLOAD_KEY_PASSWORD=your-password
     ```

4. **Build Release APK/AAB**

   ```bash
   # Using Expo/EAS
   eas build --platform android --profile production

   # Or using Gradle
   cd android
   ./gradlew bundleRelease
   # Output: android/app/build/outputs/bundle/release/app-release.aab
   ```

### Step 2: Create App in Play Console

1. **Go to Play Console**
   - Visit https://play.google.com/console
   - Click "Create app"

2. **App Details**
   - App name: "Symbi - Your Health Companion"
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free
   - Declarations:
     - Developer Program Policies: Yes
     - US export laws: Yes

3. **Store Settings**
   - App category: Health & Fitness
   - Tags: health, fitness, wellness, activity tracker
   - Contact details: Your email
   - Privacy policy: https://symbi.app/privacy-policy

### Step 3: Complete Store Listing

1. **Main Store Listing**
   - Short description (80 chars): See `docs/app-store/android-metadata.md`
   - Full description (4000 chars): See `docs/app-store/android-metadata.md`
   - App icon (512x512): Upload from `assets/`
   - Feature graphic (1024x500): Upload prepared graphic
   - Phone screenshots: Upload 4-8 screenshots
   - Tablet screenshots: Optional

2. **Categorization**
   - App category: Health & Fitness
   - Tags: Add relevant tags

3. **Contact Details**
   - Email: support@symbi.app
   - Phone: Optional
   - Website: https://symbi.app

4. **Privacy Policy**
   - URL: https://symbi.app/privacy-policy

### Step 4: Complete Data Safety Section

1. **Go to Data Safety**
2. **Data Collection and Security**
   - Does your app collect or share user data? Yes
   - Is all data encrypted in transit? Yes
   - Do you provide a way for users to request data deletion? Yes

3. **Data Types**
   - Health and fitness:
     - Physical activity (steps)
     - Sleep
     - Heart rate
     - Collection: Optional
     - Sharing: No
     - Purpose: App functionality
   - App activity:
     - App interactions
     - Collection: Optional
     - Sharing: No
     - Purpose: Analytics
   - Device or other IDs:
     - Device ID
     - Collection: Yes
     - Sharing: No
     - Purpose: App functionality

4. **Save and Submit**

### Step 5: Set Up App Content

1. **App Access**
   - All functionality available without restrictions: Yes

2. **Ads**
   - Contains ads: No

3. **Content Rating**
   - Complete questionnaire
   - Expected rating: Everyone

4. **Target Audience**
   - Target age: 13+
   - Appeals to children: No

5. **News App**
   - Is this a news app? No

6. **COVID-19 Contact Tracing**
   - Is this a contact tracing app? No

7. **Data Safety**
   - Already completed above

8. **Government App**
   - Is this a government app? No

### Step 6: Select Countries and Regions

1. **Go to Production > Countries/Regions**
2. **Select Countries**
   - Add countries: All available
   - Or: Select specific countries

### Step 7: Create Release

1. **Go to Production > Releases**
2. **Create New Release**
   - Click "Create new release"

3. **Upload App Bundle**
   - Upload AAB file
   - Wait for processing

4. **Release Name**
   - Version: 1.0.0
   - Release notes: See `docs/app-store/android-metadata.md`

5. **Review Release**
   - Check for warnings or errors
   - Address any issues

### Step 8: Submit for Review

1. **Review Release**
   - Verify all information is correct
   - Check all sections are complete

2. **Submit for Review**
   - Click "Review release"
   - Click "Start rollout to Production"
   - Confirm submission

3. **Wait for Review**
   - Typical review time: 1-3 days (can be up to 7 days)
   - Monitor status in Play Console

### Step 9: Monitor and Respond

1. **Check Review Status**
   - Play Console > Dashboard
   - Email notifications

2. **If Rejected**
   - Read rejection reason in Play Console
   - Fix issues
   - Update app or metadata
   - Respond to reviewer
   - Resubmit

3. **If Approved**
   - App will be published automatically
   - Monitor crash reports
   - Respond to user reviews
   - Track metrics

---

## Post-Submission Tasks

### Immediate (Day 1)

- [ ] Verify app is live in stores
- [ ] Test download and installation
- [ ] Monitor crash reports (Sentry)
- [ ] Set up analytics dashboards
- [ ] Prepare social media announcements
- [ ] Notify beta testers

### First Week

- [ ] Monitor user reviews daily
- [ ] Respond to user feedback
- [ ] Track key metrics (downloads, DAU, retention)
- [ ] Monitor crash rate (should be < 1%)
- [ ] Fix any critical bugs immediately
- [ ] Gather feature requests

### First Month

- [ ] Analyze user behavior and metrics
- [ ] Identify most-used features
- [ ] Identify pain points
- [ ] Plan first update
- [ ] Implement high-priority bug fixes
- [ ] Consider A/B testing for screenshots

---

## Troubleshooting

### iOS Submission Issues

**Issue: Build Processing Failed**

- Solution: Check for missing entitlements, invalid Info.plist, or code signing issues

**Issue: Missing Compliance**

- Solution: Complete export compliance questionnaire in App Store Connect

**Issue: Metadata Rejected**

- Solution: Review App Store Review Guidelines, update metadata, resubmit

**Issue: HealthKit Permission Rejected**

- Solution: Ensure usage descriptions are clear and specific, show how health data is used

### Android Submission Issues

**Issue: APK/AAB Upload Failed**

- Solution: Check signing configuration, ensure version code is incremented

**Issue: Data Safety Incomplete**

- Solution: Complete all sections of Data Safety questionnaire

**Issue: Policy Violation**

- Solution: Review Play Store policies, update app or metadata, respond to reviewer

**Issue: Health Connect Not Detected**

- Solution: Ensure permissions are declared in AndroidManifest.xml

---

## Support Resources

### Apple

- [App Store Connect](https://appstoreconnect.apple.com)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)

### Google

- [Google Play Console](https://play.google.com/console)
- [Play Store Policies](https://play.google.com/about/developer-content-policy/)
- [Health Connect Documentation](https://developer.android.com/health-and-fitness/guides/health-connect)
- [Play Console Help](https://support.google.com/googleplay/android-developer)

### Internal

- QA Checklist: `docs/qa-testing-checklist.md`
- iOS Metadata: `docs/app-store/ios-metadata.md`
- Android Metadata: `docs/app-store/android-metadata.md`
- Preview Materials: `docs/app-store/preview-materials-guide.md`
- Test Plan: `docs/test-plan.md`

---

## Timeline

**Estimated Timeline from Submission to Launch:**

- iOS: 2-3 days (review) + 1 day (release) = 3-4 days
- Android: 3-7 days (review) + 1 day (release) = 4-8 days

**Recommended Schedule:**

- Week 1: Prepare builds and metadata
- Week 2: Submit to both stores
- Week 3: Monitor reviews, respond to feedback
- Week 4: Launch and post-launch monitoring

---

## Checklist

### Pre-Submission

- [ ] All features implemented
- [ ] QA testing completed
- [ ] All critical bugs fixed
- [ ] Performance targets met
- [ ] Security review passed
- [ ] Privacy policy hosted
- [ ] Metadata prepared
- [ ] Screenshots created
- [ ] Crash reporting configured

### iOS Submission

- [ ] Build uploaded to App Store Connect
- [ ] Metadata completed
- [ ] Screenshots uploaded
- [ ] Privacy questionnaire completed
- [ ] App review notes added
- [ ] Submitted for review

### Android Submission

- [ ] AAB uploaded to Play Console
- [ ] Store listing completed
- [ ] Data Safety completed
- [ ] Content rating completed
- [ ] Screenshots uploaded
- [ ] Submitted for review

### Post-Submission

- [ ] Monitoring crash reports
- [ ] Responding to reviews
- [ ] Tracking metrics
- [ ] Planning updates

---

## Notes

- Keep all signing keys and passwords secure
- Back up keystores and certificates
- Document any issues encountered during submission
- Save all correspondence with app store reviewers
- Plan for regular updates (monthly or quarterly)
- Monitor competitor apps for inspiration
- Engage with user community

Good luck with your submission! 🚀
