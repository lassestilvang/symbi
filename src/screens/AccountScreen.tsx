/**
 * Account Management Screen
 * 
 * Provides UI for account creation, login, and cloud sync management.
 * Requirements: 9.5, 11.4, 11.5
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { AuthService, AuthUser } from '../services/AuthService';
import { CloudSyncService, SyncStatus } from '../services/CloudSyncService';
import { StorageService } from '../services/StorageService';

interface AccountScreenProps {
  onClose?: () => void;
}

type ScreenMode = 'status' | 'signin' | 'signup';

export const AccountScreen: React.FC<AccountScreenProps> = ({ onClose }) => {
  const [mode, setMode] = useState<ScreenMode>('status');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    pendingChanges: false,
    error: null,
  });

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserAndStatus();

    // Subscribe to sync status changes
    const unsubscribe = CloudSyncService.addSyncListener(setSyncStatus);

    return () => {
      unsubscribe();
    };
  }, []);

  const loadUserAndStatus = async () => {
    const user = await AuthService.getCurrentUser();
    setCurrentUser(user);

    if (user) {
      const status = await CloudSyncService.getSyncStatus();
      setSyncStatus(status);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    const result = await AuthService.signUp(email, password);
    setIsLoading(false);

    if (result.success && result.user) {
      setCurrentUser(result.user);
      setMode('status');
      Alert.alert('Success', 'Account created successfully!');
      
      // Perform initial sync
      handleSync();
    } else {
      Alert.alert('Error', result.error || 'Failed to create account');
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsLoading(true);
    const result = await AuthService.signIn(email, password);
    setIsLoading(false);

    if (result.success && result.user) {
      setCurrentUser(result.user);
      setMode('status');
      Alert.alert('Success', 'Signed in successfully!');
      
      // Download cloud data
      handleDownloadData();
    } else {
      Alert.alert('Error', result.error || 'Failed to sign in');
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your data will remain on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: async () => {
            const success = await AuthService.signOut();
            if (success) {
              setCurrentUser(null);
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }
          },
        },
      ]
    );
  };

  const handleSync = async () => {
    setIsLoading(true);
    const success = await CloudSyncService.sync();
    setIsLoading(false);

    if (success) {
      Alert.alert('Success', 'Data synced successfully!');
      const status = await CloudSyncService.getSyncStatus();
      setSyncStatus(status);
    } else {
      Alert.alert('Error', 'Failed to sync data. Please try again.');
    }
  };

  const handleDownloadData = async () => {
    Alert.alert(
      'Download Cloud Data',
      'This will download your data from the cloud and merge it with local data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: async () => {
            setIsLoading(true);
            const success = await CloudSyncService.downloadFromCloud();
            setIsLoading(false);

            if (success) {
              Alert.alert('Success', 'Data downloaded successfully!');
            } else {
              Alert.alert('Error', 'Failed to download data');
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    Alert.alert(
      'Export Data',
      'This will export all your data as a JSON file.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            const jsonData = await StorageService.exportAllData();
            if (jsonData) {
              // In production, save to file system or share
              console.log('Exported data:', jsonData);
              Alert.alert('Success', 'Data exported successfully!');
            } else {
              Alert.alert('Error', 'Failed to export data');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all cloud data. Local data will be removed after 7 days. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            const success = await AuthService.deleteAccount();
            setIsLoading(false);

            if (success) {
              setCurrentUser(null);
              Alert.alert('Account Deleted', 'Your account has been deleted.');
            } else {
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  const renderSignInForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Sign In</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#6b7280"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#6b7280"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => setMode('signup')}
        disabled={isLoading}
      >
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => setMode('status')}
        disabled={isLoading}
      >
        <Text style={styles.linkText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSignUpForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Create Account</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#6b7280"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password (min 8 characters)"
        placeholderTextColor="#6b7280"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#6b7280"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => setMode('signin')}
        disabled={isLoading}
      >
        <Text style={styles.linkText}>Already have an account? Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => setMode('status')}
        disabled={isLoading}
      >
        <Text style={styles.linkText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAccountStatus = () => (
    <ScrollView style={styles.statusContainer}>
      <Text style={styles.title}>Cloud Sync</Text>

      {currentUser ? (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{currentUser.email}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sync Status</Text>
            
            {syncStatus.lastSyncTime && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Last Sync:</Text>
                <Text style={styles.value}>
                  {new Date(syncStatus.lastSyncTime).toLocaleString()}
                </Text>
              </View>
            )}

            {syncStatus.pendingChanges && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>⚠️ You have pending changes to sync</Text>
              </View>
            )}

            {syncStatus.error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>Error: {syncStatus.error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, (isLoading || syncStatus.isSyncing) && styles.buttonDisabled]}
              onPress={handleSync}
              disabled={isLoading || syncStatus.isSyncing}
            >
              {isLoading || syncStatus.isSyncing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>🔄 Sync Now</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleDownloadData}
              disabled={isLoading || syncStatus.isSyncing}
            >
              <Text style={styles.secondaryButtonText}>⬇️ Download Cloud Data</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleExportData}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>📦 Export Data (JSON)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleSignOut}
              disabled={isLoading}
            >
              <Text style={styles.dangerButtonText}>Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleDeleteAccount}
              disabled={isLoading}
            >
              <Text style={styles.dangerButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.section}>
          <Text style={styles.description}>
            Sign in to sync your data across devices and back up your Symbi's evolution history.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setMode('signin')}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setMode('signup')}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleExportData}
          >
            <Text style={styles.linkText}>Export Data (No Account Required)</Text>
          </TouchableOpacity>
        </View>
      )}

      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.linkText}>← Back to Settings</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {mode === 'status' && renderAccountStatus()}
      {mode === 'signin' && renderSignInForm()}
      {mode === 'signup' && renderSignUpForm()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  statusContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#9333ea',
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    color: '#d8b4fe',
    marginBottom: 24,
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#a78bfa',
    marginBottom: 16,
  },
  infoRow: {
    backgroundColor: '#2d2d44',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#d8b4fe',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#2d2d44',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4a4a5e',
  },
  button: {
    backgroundColor: '#9333ea',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#2d2d44',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#9333ea',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9333ea',
  },
  dangerButton: {
    backgroundColor: '#2d2d44',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  linkButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  linkText: {
    fontSize: 16,
    color: '#a78bfa',
  },
  closeButton: {
    paddingVertical: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  warningBox: {
    backgroundColor: '#78350f',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  warningText: {
    color: '#fbbf24',
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: '#7f1d1d',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
  },
});
