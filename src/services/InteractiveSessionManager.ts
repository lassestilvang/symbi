import { HealthDataService } from './HealthDataService';
import { EmotionalState } from '../types';

/**
 * SessionType defines the types of interactive wellness sessions
 */
export enum SessionType {
  BREATHING_EXERCISE = 'breathing',
  MEDITATION = 'meditation',
  STRETCHING = 'stretching',
}

/**
 * SessionResult contains the outcome of a completed session
 */
export interface SessionResult {
  success: boolean;
  duration: number;
  newEmotionalState: EmotionalState;
  healthDataWritten: boolean;
}

/**
 * ActiveSession tracks the current session state
 */
interface ActiveSession {
  type: SessionType;
  startTime: Date;
  duration: number; // in minutes
  isPaused: boolean;
}

/**
 * InteractiveSessionManager handles guided wellness activities
 * that improve the Symbi's emotional state
 * 
 * Requirements: 7.2, 7.3, 7.4
 */
export class InteractiveSessionManager {
  private activeSession: ActiveSession | null = null;
  private healthDataService: HealthDataService;

  constructor(healthDataService: HealthDataService) {
    this.healthDataService = healthDataService;
  }

  /**
   * Start a new interactive session
   * 
   * @param type - The type of session to start
   * @param duration - Duration in minutes (default: 5)
   * @throws Error if a session is already active
   */
  async startSession(type: SessionType, duration: number = 5): Promise<void> {
    if (this.activeSession) {
      throw new Error('A session is already active. Complete or cancel it first.');
    }

    this.activeSession = {
      type,
      startTime: new Date(),
      duration,
      isPaused: false,
    };
  }

  /**
   * Complete the current session and write health data
   * 
   * @returns SessionResult with success status and new emotional state
   * @throws Error if no session is active
   */
  async completeSession(): Promise<SessionResult> {
    if (!this.activeSession) {
      throw new Error('No active session to complete');
    }

    const session = this.activeSession;
    const endTime = new Date();
    const actualDuration = (endTime.getTime() - session.startTime.getTime()) / (1000 * 60); // Convert to minutes

    // Write mindful minutes to health data provider
    let healthDataWritten = false;
    try {
      healthDataWritten = await this.healthDataService.writeMindfulMinutes(
        actualDuration,
        session.startTime
      );
    } catch (error) {
      console.error('Error writing mindful minutes:', error);
      healthDataWritten = false;
    }

    // Clear active session
    this.activeSession = null;

    // Return result with Calm state (as per requirement 7.4)
    return {
      success: true,
      duration: actualDuration,
      newEmotionalState: EmotionalState.CALM,
      healthDataWritten,
    };
  }

  /**
   * Cancel the current session without writing health data
   * 
   * @throws Error if no session is active
   */
  cancelSession(): void {
    if (!this.activeSession) {
      throw new Error('No active session to cancel');
    }

    this.activeSession = null;
  }

  /**
   * Pause the current session
   * 
   * @throws Error if no session is active
   */
  pauseSession(): void {
    if (!this.activeSession) {
      throw new Error('No active session to pause');
    }

    this.activeSession.isPaused = true;
  }

  /**
   * Resume a paused session
   * 
   * @throws Error if no session is active or not paused
   */
  resumeSession(): void {
    if (!this.activeSession) {
      throw new Error('No active session to resume');
    }

    if (!this.activeSession.isPaused) {
      throw new Error('Session is not paused');
    }

    this.activeSession.isPaused = false;
  }

  /**
   * Get the current active session
   * 
   * @returns The active session or null if no session is active
   */
  getActiveSession(): ActiveSession | null {
    return this.activeSession ? { ...this.activeSession } : null;
  }

  /**
   * Check if a session is currently active
   * 
   * @returns true if a session is active, false otherwise
   */
  isSessionActive(): boolean {
    return this.activeSession !== null;
  }

  /**
   * Get elapsed time for the current session in seconds
   * 
   * @returns Elapsed time in seconds, or 0 if no session is active
   */
  getElapsedTime(): number {
    if (!this.activeSession) {
      return 0;
    }

    const now = new Date();
    return Math.floor((now.getTime() - this.activeSession.startTime.getTime()) / 1000);
  }

  /**
   * Get remaining time for the current session in seconds
   * 
   * @returns Remaining time in seconds, or 0 if no session is active
   */
  getRemainingTime(): number {
    if (!this.activeSession) {
      return 0;
    }

    const elapsedSeconds = this.getElapsedTime();
    const totalSeconds = this.activeSession.duration * 60;
    const remaining = totalSeconds - elapsedSeconds;

    return Math.max(0, remaining);
  }
}
