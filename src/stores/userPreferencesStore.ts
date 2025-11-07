import { create } from 'zustand';
import { UserProfile, UserPreferences, StepThresholds, HealthGoals } from '../types';
import { StorageService } from '../services/StorageService';

/**
 * User Preferences Store
 * 
 * Manages user profile, preferences, thresholds, and goals with persistence.
 * Automatically syncs changes to AsyncStorage.
 */

interface UserPreferencesState {
  // User data
  profile: UserProfile | null;
  isInitialized: boolean;
  
  // Actions
  initializeProfile: () => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  updateThresholds: (thresholds: Partial<StepThresholds>) => Promise<void>;
  updateGoals: (goals: Partial<HealthGoals>) => Promise<void>;
  setDataSource: (source: 'healthkit' | 'googlefit' | 'manual') => Promise<void>;
  incrementTotalDaysActive: () => Promise<void>;
  reset: () => Promise<void>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  dataSource: 'manual',
  notificationsEnabled: true,
  hapticFeedbackEnabled: true,
  soundEnabled: true,
  theme: 'auto',
  analyticsEnabled: true,
};

const DEFAULT_THRESHOLDS: StepThresholds = {
  sadThreshold: 2000,
  activeThreshold: 8000,
};

const DEFAULT_GOALS: HealthGoals = {
  targetSteps: 10000,
  targetSleepHours: 8,
  targetHRV: 60,
};

const createDefaultProfile = (): UserProfile => ({
  id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  createdAt: new Date(),
  preferences: DEFAULT_PREFERENCES,
  thresholds: DEFAULT_THRESHOLDS,
  goals: DEFAULT_GOALS,
  evolutionLevel: 0,
  totalDaysActive: 0,
});

export const useUserPreferencesStore = create<UserPreferencesState>((set, get) => ({
  profile: null,
  isInitialized: false,

  initializeProfile: async () => {
    try {
      let profile = await StorageService.getUserProfile();
      
      if (!profile) {
        // Create new profile for first-time user
        profile = createDefaultProfile();
        await StorageService.setUserProfile(profile);
      }
      
      set({ profile, isInitialized: true });
    } catch (error) {
      console.error('Error initializing profile:', error);
      // Create default profile even on error
      const profile = createDefaultProfile();
      set({ profile, isInitialized: true });
    }
  },

  updatePreferences: async (preferences: Partial<UserPreferences>) => {
    const { profile } = get();
    if (!profile) return;

    const updatedProfile: UserProfile = {
      ...profile,
      preferences: {
        ...profile.preferences,
        ...preferences,
      },
    };

    await StorageService.setUserProfile(updatedProfile);
    set({ profile: updatedProfile });
  },

  updateThresholds: async (thresholds: Partial<StepThresholds>) => {
    const { profile } = get();
    if (!profile) return;

    const updatedProfile: UserProfile = {
      ...profile,
      thresholds: {
        ...profile.thresholds,
        ...thresholds,
      },
    };

    await StorageService.setUserProfile(updatedProfile);
    set({ profile: updatedProfile });
  },

  updateGoals: async (goals: Partial<HealthGoals>) => {
    const { profile } = get();
    if (!profile) return;

    const updatedProfile: UserProfile = {
      ...profile,
      goals: {
        ...profile.goals,
        ...goals,
      },
    };

    await StorageService.setUserProfile(updatedProfile);
    set({ profile: updatedProfile });
  },

  setDataSource: async (source: 'healthkit' | 'googlefit' | 'manual') => {
    const { profile } = get();
    if (!profile) return;

    const updatedProfile: UserProfile = {
      ...profile,
      preferences: {
        ...profile.preferences,
        dataSource: source,
      },
    };

    await StorageService.setUserProfile(updatedProfile);
    set({ profile: updatedProfile });
  },

  incrementTotalDaysActive: async () => {
    const { profile } = get();
    if (!profile) return;

    const updatedProfile: UserProfile = {
      ...profile,
      totalDaysActive: profile.totalDaysActive + 1,
    };

    await StorageService.setUserProfile(updatedProfile);
    set({ profile: updatedProfile });
  },

  reset: async () => {
    await StorageService.removeUserProfile();
    set({ profile: null, isInitialized: false });
  },
}));
