import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';

interface PrivacyPolicyScreenProps {
  onClose?: () => void;
}

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onClose }) => {
  const handleContactSupport = () => {
    Linking.openURL('mailto:privacy@symbi.app?subject=Privacy%20Policy%20Inquiry');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.lastUpdated}>Last Updated: November 7, 2025</Text>

        <Section title="Introduction">
          <Text style={styles.text}>
            Welcome to Symbi! Your privacy is important to us. This Privacy Policy explains how we
            collect, use, store, and protect your personal information when you use the Symbi mobile
            application.
          </Text>
          <Text style={styles.text}>
            Symbi is a health and wellness application that uses your biometric data to create a
            personalized digital companion. We are committed to transparency and protecting your
            sensitive health information.
          </Text>
        </Section>

        <Section title="Information We Collect">
          <Subsection title="Health Data">
            <Text style={styles.text}>
              Symbi collects the following health metrics to power your digital companion:
            </Text>
            <BulletPoint>
              Step Count: Daily step count from Apple Health (iOS) or Google Fit (Android)
            </BulletPoint>
            <BulletPoint>Sleep Duration: Hours of sleep per night (Phase 2+)</BulletPoint>
            <BulletPoint>Heart Rate Variability (HRV): HRV measurements (Phase 2+)</BulletPoint>
            <BulletPoint>
              Mindful Minutes: Duration of wellness activities you complete within the app (Phase
              3+)
            </BulletPoint>

            <HighlightBox>
              <Text style={styles.highlightText}>
                You have full control over what data we access. You can grant or deny permissions at
                any time, use manual entry mode, or delete all collected data.
              </Text>
            </HighlightBox>
          </Subsection>

          <Subsection title="User Preferences">
            <Text style={styles.text}>We store your app preferences locally on your device:</Text>
            <BulletPoint>Emotional state thresholds (customizable step count goals)</BulletPoint>
            <BulletPoint>Notification, haptic feedback, and sound preferences</BulletPoint>
            <BulletPoint>Data source selection (automatic vs. manual entry)</BulletPoint>
          </Subsection>
        </Section>

        <Section title="How We Use Your Information">
          <HighlightBox type="success">
            <Text style={styles.highlightText}>
              All health data processing happens locally on your device. We do not send your raw
              health data to external servers except as described below.
            </Text>
          </HighlightBox>

          <Text style={styles.text}>Your health data is used to:</Text>
          <BulletPoint>Calculate your Symbi's emotional state</BulletPoint>
          <BulletPoint>Display your daily activity progress</BulletPoint>
          <BulletPoint>Track evolution eligibility</BulletPoint>
          <BulletPoint>Provide personalized wellness recommendations</BulletPoint>
        </Section>

        <Section title="Data Retention">
          <Subsection title="Local Storage">
            <BulletPoint>
              Health Data Cache: 30-day rolling window (older data is automatically deleted)
            </BulletPoint>
            <BulletPoint>Emotional State History: 90 days</BulletPoint>
            <BulletPoint>Evolution Records: Stored permanently until you delete them</BulletPoint>
            <BulletPoint>
              User Preferences: Stored until you delete the app or clear data
            </BulletPoint>
          </Subsection>

          <Subsection title="Cloud Storage (if enabled)">
            <BulletPoint>User Preferences: Stored until account deletion</BulletPoint>
            <BulletPoint>Evolution History: Stored until account deletion</BulletPoint>
            <BulletPoint>
              Deleted Data: Permanently removed within 7 days of account deletion
            </BulletPoint>
          </Subsection>
        </Section>

        <Section title="Data Security">
          <Text style={styles.text}>
            We implement multiple layers of security to protect your sensitive health information:
          </Text>

          <Subsection title="Encryption at Rest">
            <BulletPoint>
              All local data is encrypted using your device's secure storage
            </BulletPoint>
            <BulletPoint>Health data cache uses AES-256 encryption</BulletPoint>
            <BulletPoint>Evolution images are stored in encrypted storage</BulletPoint>
          </Subsection>

          <Subsection title="Encryption in Transit">
            <BulletPoint>All API communications use TLS 1.3 or higher</BulletPoint>
            <BulletPoint>Certificate pinning for Gemini API endpoints</BulletPoint>
            <BulletPoint>No unencrypted transmission of health data</BulletPoint>
          </Subsection>
        </Section>

        <Section title="Your Rights and Choices">
          <Text style={styles.text}>You have complete control over your data:</Text>
          <BulletPoint>View Your Data: See all collected health data in the app</BulletPoint>
          <BulletPoint>
            Export Your Data: Download all your data in JSON format at any time
          </BulletPoint>
          <BulletPoint>
            Delete Your Data: Permanently delete all local data with one tap
          </BulletPoint>
          <BulletPoint>
            Revoke Permissions: Disable health data access through device settings
          </BulletPoint>
          <BulletPoint>
            Switch to Manual Entry: Use the app without granting health data permissions
          </BulletPoint>
        </Section>

        <Section title="Third-Party Services">
          <Subsection title="Health Data Providers">
            <BulletPoint>Apple HealthKit (iOS): Subject to Apple's privacy policy</BulletPoint>
            <BulletPoint>Google Fit (Android): Subject to Google's privacy policy</BulletPoint>
          </Subsection>

          <Subsection title="AI Services (Phase 2+)">
            <BulletPoint>
              Google Gemini API: Used for emotional state analysis and evolution image generation
            </BulletPoint>
            <BulletPoint>Data sent: Aggregated daily health metrics (no PII)</BulletPoint>
            <BulletPoint>Subject to Google's privacy policy and terms of service</BulletPoint>
          </Subsection>
        </Section>

        <Section title="Contact Us">
          <Text style={styles.text}>
            If you have questions, concerns, or requests regarding this Privacy Policy or your data:
          </Text>
          <TouchableOpacity onPress={handleContactSupport} style={styles.contactButton}>
            <Text style={styles.contactButtonText}>📧 Contact Privacy Team</Text>
          </TouchableOpacity>
          <Text style={styles.smallText}>We will respond to all requests within 30 days.</Text>
        </Section>

        <HighlightBox type="info">
          <Text style={styles.highlightText}>
            Summary: Symbi respects your privacy. Your health data stays on your device, is
            encrypted, and is never sold. You have complete control to view, export, or delete your
            data at any time.
          </Text>
        </HighlightBox>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Symbi Privacy Policy v1.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

// Helper Components
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Subsection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <View style={styles.subsection}>
    <Text style={styles.subsectionTitle}>{title}</Text>
    {children}
  </View>
);

const BulletPoint: React.FC<{ children: string }> = ({ children }) => (
  <View style={styles.bulletPoint}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

const HighlightBox: React.FC<{ children: React.ReactNode; type?: 'info' | 'success' }> = ({
  children,
  type = 'info',
}) => (
  <View style={[styles.highlightBox, type === 'success' && styles.highlightBoxSuccess]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#9333ea',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#a78bfa',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#a78bfa',
    marginBottom: 12,
  },
  subsection: {
    marginTop: 16,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#c4b5fd',
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 15,
    color: '#9333ea',
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 22,
  },
  highlightBox: {
    backgroundColor: '#2d2d44',
    borderLeftWidth: 4,
    borderLeftColor: '#9333ea',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  highlightBoxSuccess: {
    borderLeftColor: '#10b981',
  },
  highlightText: {
    fontSize: 14,
    color: '#e5e7eb',
    lineHeight: 22,
    fontWeight: '500',
  },
  contactButton: {
    backgroundColor: '#9333ea',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  smallText: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#2d2d44',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
