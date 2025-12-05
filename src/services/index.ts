// Health Data Services
export { HealthDataService, createHealthDataService } from './HealthDataService';
export type { HealthPermissions, InitResult } from './HealthDataService';
export { AuthStatus } from './HealthDataService';

export { HealthKitService } from './HealthKitService';
export { GoogleFitService } from './GoogleFitService';
export { ManualHealthDataService } from './ManualHealthDataService';

// Other Services
export { StorageService } from './StorageService';
export { EmotionalStateCalculator } from './EmotionalStateCalculator';
export { HealthDataUpdateService } from './HealthDataUpdateService';
export { BackgroundSyncService, getBackgroundSyncService } from './BackgroundSyncService';
export { PermissionService } from './PermissionService';
export type { PermissionResult } from './PermissionService';
export { AIBrainService } from './AIBrainService';
export type { AIAnalysisResult, EvolutionContext } from './AIBrainService';
export { DailyAIAnalysisService, getDailyAIAnalysisService } from './DailyAIAnalysisService';
export type { DailyAnalysisResult } from './DailyAIAnalysisService';
export { InteractiveSessionManager, SessionType } from './InteractiveSessionManager';
export type { SessionResult } from './InteractiveSessionManager';
export { EvolutionSystem } from './EvolutionSystem';
export type { EvolutionEligibility, EvolutionResult } from './EvolutionSystem';

// Cloud Sync Services
export { AuthService } from './AuthService';
export type { AuthUser, AuthResult } from './AuthService';
export { CloudSyncService } from './CloudSyncService';
export type { SyncStatus, SyncOptions } from './CloudSyncService';
export { CloudAPIService } from './CloudAPIService';
export type { CloudSyncData, SyncResult } from './CloudAPIService';
export { firebaseConfig, isFirebaseConfigured } from './FirebaseConfig';
export type { FirebaseConfig } from './FirebaseConfig';

// Security Services
export { EncryptionService } from './EncryptionService';
export { SecureStorageService } from './SecureStorageService';
export { SecureAPIService } from './SecureAPIService';

// Data Management
export { DataManagementService } from './DataManagementService';
export type { ExportData, DeletionResult } from './DataManagementService';

// Analytics
export { AnalyticsService, AnalyticsEvent } from './AnalyticsService';
export type { AnalyticsProperties } from './AnalyticsService';

// Performance Monitoring
export { PerformanceMonitor } from './PerformanceMonitor';
export type { PerformanceMetrics, APICallMetric, AnimationMetric } from './PerformanceMonitor';
export { MemoryMonitor, useMemoryMonitor } from './MemoryMonitor';
export type { MemoryStats } from './MemoryMonitor';
export { ImageCacheManager } from './ImageCacheManager';
export type { CachedImage } from './ImageCacheManager';
export { RequestDeduplicator } from './RequestDeduplicator';
export {
  BackgroundTaskConfig,
  getAnimationSpeed,
  getNextAnalysisTime,
  getMillisecondsUntilNextAnalysis,
  shouldSync,
} from './BackgroundTaskConfig';

// Habitat Services
export {
  HabitatPreferencesService,
  saveScenePreference,
  loadScenePreference,
  clearScenePreference,
  getDefaultScene,
} from './HabitatPreferencesService';
