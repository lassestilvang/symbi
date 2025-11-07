# Symbi Privacy Policy

**Last Updated:** November 7, 2025

## Introduction

Welcome to Symbi! Your privacy is important to us. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use the Symbi mobile application ("App").

Symbi is a health and wellness application that uses your biometric data to create a personalized digital companion. We are committed to transparency and protecting your sensitive health information.

## Information We Collect

### Health Data

Symbi collects the following health metrics to power your digital companion:

- **Step Count**: Daily step count from Apple Health (iOS) or Google Fit (Android)
- **Sleep Duration**: Hours of sleep per night (Phase 2+)
- **Heart Rate Variability (HRV)**: HRV measurements (Phase 2+)
- **Mindful Minutes**: Duration of wellness activities you complete within the app (Phase 3+)

**Important**: You have full control over what data we access. You can:
- Grant or deny permissions at any time through your device settings
- Use manual entry mode instead of automatic health data integration
- Delete all collected data at any time

### User Preferences

We store your app preferences locally on your device:
- Emotional state thresholds (customizable step count goals)
- Notification, haptic feedback, and sound preferences
- Data source selection (automatic vs. manual entry)
- Theme preferences

### Evolution History

We store records of your Symbi's evolution events:
- Evolution level and timestamp
- Generated appearance images
- Days in positive emotional states

### Account Information (Optional - Phase 3+)

If you choose to enable cloud sync:
- Email address (for account creation)
- Anonymous user ID (generated automatically)
- Encrypted authentication token

## How We Use Your Information

### Local Processing

**All health data processing happens locally on your device.** We do not send your raw health data to external servers except as described below.

Your health data is used to:
1. Calculate your Symbi's emotional state
2. Display your daily activity progress
3. Track evolution eligibility
4. Provide personalized wellness recommendations

### AI Analysis (Phase 2+)

When AI-powered emotional state analysis is enabled:
- We send **aggregated daily metrics** (steps, sleep, HRV) to Google's Gemini API
- Data is transmitted over encrypted connections (TLS 1.3)
- **No personally identifiable information** is included in API requests
- API responses are cached locally for 24 hours
- Google's Gemini API processes data according to their privacy policy

### Evolution Image Generation (Phase 3+)

When you trigger an evolution event:
- We send a text prompt to Google's Gemini Image API describing your Symbi's evolution
- **No health data or personal information** is included in the prompt
- Generated images are stored locally on your device
- Images may optionally be synced to cloud storage if you enable that feature

### Cloud Sync (Optional - Phase 3+)

If you create an account and enable cloud sync:
- Your preferences and evolution history are encrypted and stored in the cloud
- **Health data cache is NOT synced to the cloud** - it stays on your device
- Cloud data is used only to restore your Symbi on new devices
- You can disable cloud sync at any time

## Data Retention

### Local Storage

- **Health Data Cache**: 30-day rolling window (older data is automatically deleted)
- **Emotional State History**: 90 days
- **Evolution Records**: Stored permanently until you delete them
- **User Preferences**: Stored until you delete the app or clear data

### Cloud Storage (if enabled)

- **User Preferences**: Stored until account deletion
- **Evolution History**: Stored until account deletion
- **Deleted Data**: Permanently removed within 7 days of account deletion

### API Processing

- **Gemini API**: Data is processed in real-time and not stored by Google beyond their standard processing requirements (see Google's privacy policy)

## Data Security

We implement multiple layers of security to protect your sensitive health information:

### Encryption at Rest

- All local data is encrypted using your device's secure storage (iOS Keychain / Android Keystore)
- Health data cache uses AES-256 encryption
- Evolution images are stored in encrypted storage

### Encryption in Transit

- All API communications use TLS 1.3 or higher
- Certificate pinning for Gemini API endpoints
- No unencrypted transmission of health data

### Access Controls

- Health data is only accessible to the Symbi app
- No third-party analytics or advertising SDKs have access to your health data
- Cloud sync data is encrypted end-to-end

### Minimal Data Collection

We follow the principle of data minimization:
- We only collect data necessary for app functionality
- We don't collect location data, contacts, or other sensitive device information
- We use anonymous device IDs instead of personal identifiers

## Your Rights and Choices

### Access and Control

You have complete control over your data:

- **View Your Data**: See all collected health data in the app
- **Export Your Data**: Download all your data in JSON format at any time
- **Delete Your Data**: Permanently delete all local data with one tap
- **Revoke Permissions**: Disable health data access through device settings
- **Switch to Manual Entry**: Use the app without granting health data permissions

### Account Management (if using cloud sync)

- **Delete Account**: Permanently delete your account and all cloud data
- **Disable Sync**: Stop syncing data to the cloud while keeping local data
- **Export Before Deletion**: Download your data before deleting your account

### Opt-Out Options

- **AI Analysis**: Use rule-based emotional state calculation instead of AI
- **Analytics**: Opt out of anonymous usage analytics in settings
- **Notifications**: Disable all app notifications

## Third-Party Services

Symbi integrates with the following third-party services:

### Health Data Providers

- **Apple HealthKit** (iOS): Subject to Apple's privacy policy
- **Google Fit** (Android): Subject to Google's privacy policy

We only read data you explicitly grant permission for. We write mindful minutes data only when you complete wellness activities.

### AI Services (Phase 2+)

- **Google Gemini API**: Used for emotional state analysis and evolution image generation
- Data sent: Aggregated daily health metrics (no PII)
- Subject to Google's privacy policy and terms of service

### Cloud Storage (Optional - Phase 3+)

- **Firebase** (or similar): Used for account authentication and data sync
- Data stored: Encrypted preferences and evolution history
- Subject to the cloud provider's privacy policy

## Children's Privacy

Symbi is designed for users aged 13 and older. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us with personal information, please contact us immediately.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any material changes by:
- Displaying a notice in the app
- Updating the "Last Updated" date at the top of this policy

Your continued use of Symbi after changes indicates acceptance of the updated policy.

## Data Breach Notification

In the unlikely event of a data breach affecting your personal information, we will:
- Notify you within 72 hours of discovering the breach
- Provide details about what data was affected
- Explain steps we're taking to address the breach
- Offer guidance on protecting your information

## International Users

Symbi is designed to work globally. Your data is stored locally on your device and, if you enable cloud sync, in data centers that may be located in different countries. We ensure all data transfers comply with applicable privacy laws.

## Contact Us

If you have questions, concerns, or requests regarding this Privacy Policy or your data:

- **Email**: [privacy@symbi.app]
- **In-App**: Use the "Contact Support" option in Settings

We will respond to all requests within 30 days.

## Your California Privacy Rights (CCPA)

If you are a California resident, you have additional rights under the California Consumer Privacy Act:

- **Right to Know**: Request details about data we collect and how we use it
- **Right to Delete**: Request deletion of your personal information
- **Right to Opt-Out**: Opt out of data "sales" (Note: We do not sell your data)
- **Right to Non-Discrimination**: We will not discriminate against you for exercising your rights

To exercise these rights, contact us using the information above.

## Your European Privacy Rights (GDPR)

If you are in the European Economic Area, you have rights under the General Data Protection Regulation:

- **Right of Access**: Obtain confirmation of data processing and access to your data
- **Right to Rectification**: Correct inaccurate personal data
- **Right to Erasure**: Request deletion of your personal data
- **Right to Restrict Processing**: Limit how we process your data
- **Right to Data Portability**: Receive your data in a machine-readable format
- **Right to Object**: Object to processing of your personal data
- **Right to Withdraw Consent**: Withdraw consent at any time

To exercise these rights, contact us using the information above.

## Legal Basis for Processing (GDPR)

We process your personal data based on:
- **Consent**: You explicitly consent to health data collection
- **Legitimate Interest**: We have a legitimate interest in providing app functionality
- **Contract**: Processing is necessary to provide services you requested

## Data Protection Officer

For privacy-related inquiries, you can contact our Data Protection Officer at:
- **Email**: [dpo@symbi.app]

---

**Summary**: Symbi respects your privacy. Your health data stays on your device, is encrypted, and is never sold. You have complete control to view, export, or delete your data at any time.
