/**
 * Habitat Type Definitions for Interactive Symbi Habitat
 *
 * This file contains all TypeScript interfaces and types for the habitat system.
 * Requirements: 1.1, 5.1
 */

import type { EmotionalState } from './index';

// ============================================================================
// Core Enums and Types
// ============================================================================

/**
 * SceneType represents the available themed environments
 */
export type SceneType = 'haunted-forest' | 'moonlit-graveyard' | 'spooky-mansion';

/**
 * TimePhase represents periods of the day affecting scene lighting
 * Dawn: 5-8am, Day: 8am-5pm, Dusk: 5-8pm, Night: 8pm-5am
 */
export type TimePhase = 'dawn' | 'day' | 'dusk' | 'night';

/**
 * QualityLevel for performance optimization
 */
export type QualityLevel = 'low' | 'medium' | 'high';

/**
 * AmbientElementType represents decorative animated elements
 */
export type AmbientElementType =
  | 'tree'
  | 'tombstone'
  | 'fence'
  | 'mansion'
  | 'bat'
  | 'owl'
  | 'wisp'
  | 'firefly'
  | 'leaf'
  | 'candle'
  | 'moon'
  | 'star';

/**
 * ParticleType for particle system effects
 */
export type ParticleType = 'fog' | 'sparkle' | 'rain' | 'leaves' | 'fireflies' | 'dust';

/**
 * InteractionEffectType for user interaction feedback
 */
export type InteractionEffectType = 'ripple' | 'burst' | 'glow';

// ============================================================================
// Configuration Interfaces
// ============================================================================

/**
 * HabitatConfig is the main configuration for the habitat system
 */
export interface HabitatConfig {
  scene: SceneType;
  timePhase: TimePhase;
  emotionalState: EmotionalState;
  quality: QualityLevel;
}

/**
 * HabitatManagerProps for the main habitat orchestrator component
 */
export interface HabitatManagerProps {
  emotionalState: EmotionalState;
  isVisible: boolean;
  onInteraction?: (point: Position) => void;
  reducedMotion?: boolean;
}

/**
 * SceneRendererProps for the scene rendering component
 */
export interface SceneRendererProps {
  config: HabitatConfig;
  dimensions: Dimensions;
  onTransitionComplete?: () => void;
}

// ============================================================================
// Position and Dimension Types
// ============================================================================

/**
 * Position represents x, y coordinates
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Dimensions represents width and height
 */
export interface Dimensions {
  width: number;
  height: number;
}

// ============================================================================
// Time Phase Configuration
// ============================================================================

/**
 * TimePhaseColors defines the color scheme for each time phase
 */
export interface TimePhaseColors {
  skyGradient: string[];
  ambientLight: string;
  accentColor: string;
  particleColor: string;
}

/**
 * TimePhaseConfig defines boundaries and colors for a time phase
 */
export interface TimePhaseConfig {
  phase: TimePhase;
  startHour: number;
  endHour: number;
  colors: TimePhaseColors;
}

/**
 * TimeManagerConfig for time-based transitions
 */
export interface TimeManagerConfig {
  updateInterval: number;
  transitionDuration: number;
}

// ============================================================================
// Scene Modifiers
// ============================================================================

/**
 * SceneModifiers adjust scene appearance based on emotional state
 */
export interface SceneModifiers {
  colorShift: number; // -1 to 1
  brightness: number; // 0 to 2
  particleSpeed: number; // multiplier
  ambientIntensity: number; // 0 to 2
}

// ============================================================================
// Quality and Performance
// ============================================================================

/**
 * QualitySettings defines rendering constraints per quality level
 */
export interface QualitySettings {
  particleMultiplier: number;
  parallaxLayers: number;
  ambientElementCount: number;
  enableBlur: boolean;
  enableShadows: boolean;
}

/**
 * PerformanceMetrics for monitoring habitat performance
 */
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  particleCount: number;
  memoryUsage?: number;
}

// ============================================================================
// Layer and Element Definitions
// ============================================================================

/**
 * ParallaxLayerProps for depth-based parallax scrolling
 */
export interface ParallaxLayerProps {
  depth: number; // 0-1, affects parallax speed
  children: React.ReactNode;
  offsetX?: number;
  offsetY?: number;
}

/**
 * LayerDefinition for scene layer configuration
 */
export interface LayerDefinition {
  depth: number;
  elements: LayerElement[];
  parallaxSpeed: number;
}

/**
 * LayerElement for individual elements within a layer
 */
export interface LayerElement {
  type: 'gradient' | 'svg' | 'image';
  content: string;
  position: Position;
  animation?: AnimationConfig;
}

/**
 * AnimationConfig for element animations
 */
export interface AnimationConfig {
  type: 'float' | 'sway' | 'pulse' | 'flicker';
  duration: number;
  delay?: number;
  easing?: string;
}

// ============================================================================
// Ambient Elements
// ============================================================================

/**
 * AmbientElementProps for animated decorative elements
 */
export interface AmbientElementProps {
  type: AmbientElementType;
  position: Position;
  scale?: number;
  animationDelay?: number;
  emotionalModifier?: EmotionalState;
}

/**
 * AmbientElementDefinition for scene configuration
 */
export interface AmbientElementDefinition {
  type: AmbientElementType;
  position: Position;
  scale: number;
  layer: number;
  animation: AnimationConfig;
}

// ============================================================================
// Particle System
// ============================================================================

/**
 * ParticleSystemProps for particle generation component
 */
export interface ParticleSystemProps {
  type: ParticleType;
  emissionRate: number;
  maxParticles: number;
  bounds: Dimensions;
  emotionalState: EmotionalState;
}

/**
 * Particle represents a single particle instance
 */
export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  opacity: number;
  color: string;
}

/**
 * ParticleConfig for scene particle configuration
 */
export interface ParticleConfig {
  type: ParticleType;
  emissionRate: number;
  maxParticles: number;
  particleLifespan: number;
  colors: string[];
}

// ============================================================================
// Scene Definition
// ============================================================================

/**
 * SceneDefinition is the complete configuration for a themed scene
 */
export interface SceneDefinition {
  id: SceneType;
  name: string;
  layers: LayerDefinition[];
  ambientElements: AmbientElementDefinition[];
  particles: ParticleConfig[];
  emotionalOverrides: Record<EmotionalState, SceneModifiers>;
}

// ============================================================================
// Habitat State
// ============================================================================

/**
 * InteractionEffect for user interaction feedback
 */
export interface InteractionEffect {
  id: string;
  type: InteractionEffectType;
  position: Position;
  startTime: number;
  duration: number;
}

/**
 * HabitatState represents the current state of the habitat system
 */
export interface HabitatState {
  currentScene: SceneType;
  timePhase: TimePhase;
  emotionalState: EmotionalState;
  isTransitioning: boolean;
  quality: QualityLevel;
  interactionEffects: InteractionEffect[];
}

// ============================================================================
// Preferences
// ============================================================================

/**
 * HabitatPreferences for persisted user preferences
 */
export interface HabitatPreferences {
  selectedScene: SceneType;
  lastUpdated: string;
}
