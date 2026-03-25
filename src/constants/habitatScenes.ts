/**
 * Habitat Scene Definitions
 *
 * Defines the three Halloween-themed scenes for the Interactive Symbi Habitat.
 * Requirements: 5.2, 5.3, 5.4
 */

import type {
  SceneDefinition,
  SceneType,
  SceneModifiers,
  AmbientElementDefinition,
  LayerDefinition,
  ParticleConfig,
} from '../types/habitat';
import { EmotionalState } from '../types/index';
import { HALLOWEEN_COLORS } from './theme';

// ============================================================================
// Default Emotional Overrides (shared across scenes)
// ============================================================================

const createDefaultEmotionalOverrides = (): Record<EmotionalState, SceneModifiers> => ({
  [EmotionalState.SAD]: {
    colorShift: -0.3,
    brightness: 0.6,
    particleSpeed: 0.5,
    ambientIntensity: 0.4,
  },
  [EmotionalState.RESTING]: {
    colorShift: 0,
    brightness: 0.9,
    particleSpeed: 0.7,
    ambientIntensity: 0.7,
  },
  [EmotionalState.ACTIVE]: {
    colorShift: 0.2,
    brightness: 1.2,
    particleSpeed: 1.3,
    ambientIntensity: 1.2,
  },
  [EmotionalState.VIBRANT]: {
    colorShift: 0.3,
    brightness: 1.4,
    particleSpeed: 1.5,
    ambientIntensity: 1.4,
  },
  [EmotionalState.CALM]: {
    colorShift: 0.1,
    brightness: 0.95,
    particleSpeed: 0.7,
    ambientIntensity: 0.8,
  },
  [EmotionalState.TIRED]: {
    colorShift: -0.1,
    brightness: 0.75,
    particleSpeed: 0.5,
    ambientIntensity: 0.5,
  },
  [EmotionalState.STRESSED]: {
    colorShift: 0.1,
    brightness: 1.0,
    particleSpeed: 1.2,
    ambientIntensity: 1.3,
  },
  [EmotionalState.ANXIOUS]: {
    colorShift: 0.15,
    brightness: 1.05,
    particleSpeed: 1.25,
    ambientIntensity: 1.35,
  },
  [EmotionalState.RESTED]: {
    colorShift: 0.05,
    brightness: 0.9,
    particleSpeed: 0.8,
    ambientIntensity: 0.85,
  },
});

// ============================================================================
// Haunted Forest Scene (Requirements: 5.2)
// ============================================================================

const hauntedForestLayers: LayerDefinition[] = [
  {
    depth: 0,
    parallaxSpeed: 0.1,
    elements: [
      {
        type: 'gradient',
        content: `linear-gradient(180deg, ${HALLOWEEN_COLORS.darkBg} 0%, ${HALLOWEEN_COLORS.primaryDark} 100%)`,
        position: { x: 0, y: 0 },
      },
    ],
  },
  {
    depth: 0.3,
    parallaxSpeed: 0.3,
    elements: [
      {
        type: 'svg',
        content: 'distant-trees',
        position: { x: 0, y: 60 },
        animation: { type: 'sway', duration: 8000, easing: 'ease-in-out' },
      },
    ],
  },
  {
    depth: 0.6,
    parallaxSpeed: 0.6,
    elements: [
      {
        type: 'svg',
        content: 'mid-trees',
        position: { x: 0, y: 50 },
        animation: { type: 'sway', duration: 6000, easing: 'ease-in-out' },
      },
    ],
  },
  {
    depth: 1,
    parallaxSpeed: 1,
    elements: [
      {
        type: 'svg',
        content: 'foreground-trees',
        position: { x: 0, y: 70 },
        animation: { type: 'sway', duration: 4000, easing: 'ease-in-out' },
      },
    ],
  },
];

const hauntedForestAmbientElements: AmbientElementDefinition[] = [
  {
    type: 'tree',
    position: { x: 10, y: 60 },
    scale: 1.2,
    layer: 1,
    animation: { type: 'sway', duration: 5000 },
  },
  {
    type: 'tree',
    position: { x: 85, y: 55 },
    scale: 1.0,
    layer: 1,
    animation: { type: 'sway', duration: 6000, delay: 500 },
  },
  {
    type: 'owl',
    position: { x: 20, y: 35 },
    scale: 0.6,
    layer: 2,
    animation: { type: 'float', duration: 3000 },
  },
  {
    type: 'bat',
    position: { x: 60, y: 20 },
    scale: 0.4,
    layer: 2,
    animation: { type: 'float', duration: 2500, delay: 300 },
  },
  {
    type: 'bat',
    position: { x: 75, y: 25 },
    scale: 0.35,
    layer: 2,
    animation: { type: 'float', duration: 2800, delay: 600 },
  },
  {
    type: 'leaf',
    position: { x: 30, y: 40 },
    scale: 0.3,
    layer: 3,
    animation: { type: 'float', duration: 4000 },
  },
  {
    type: 'firefly',
    position: { x: 45, y: 50 },
    scale: 0.2,
    layer: 3,
    animation: { type: 'pulse', duration: 2000 },
  },
];

const hauntedForestParticles: ParticleConfig[] = [
  {
    type: 'fog',
    emissionRate: 5,
    maxParticles: 30,
    particleLifespan: 8000,
    colors: ['rgba(255, 255, 255, 0.1)', 'rgba(124, 58, 237, 0.1)'],
  },
  {
    type: 'leaves',
    emissionRate: 2,
    maxParticles: 15,
    particleLifespan: 6000,
    colors: [HALLOWEEN_COLORS.orange, '#8B4513', '#654321'],
  },
  {
    type: 'fireflies',
    emissionRate: 1,
    maxParticles: 10,
    particleLifespan: 5000,
    colors: ['#FFFF00', '#FFD700', HALLOWEEN_COLORS.green],
  },
];

export const HAUNTED_FOREST_SCENE: SceneDefinition = {
  id: 'haunted-forest',
  name: 'Haunted Forest',
  layers: hauntedForestLayers,
  ambientElements: hauntedForestAmbientElements,
  particles: hauntedForestParticles,
  emotionalOverrides: createDefaultEmotionalOverrides(),
};

// ============================================================================
// Moonlit Graveyard Scene (Requirements: 5.3)
// ============================================================================

const moonlitGraveyardLayers: LayerDefinition[] = [
  {
    depth: 0,
    parallaxSpeed: 0.1,
    elements: [
      {
        type: 'gradient',
        content: `linear-gradient(180deg, #0f0f23 0%, ${HALLOWEEN_COLORS.primaryDark} 60%, ${HALLOWEEN_COLORS.darkBg} 100%)`,
        position: { x: 0, y: 0 },
      },
    ],
  },
  {
    depth: 0.2,
    parallaxSpeed: 0.2,
    elements: [
      {
        type: 'svg',
        content: 'moon',
        position: { x: 75, y: 10 },
        animation: { type: 'pulse', duration: 10000, easing: 'ease-in-out' },
      },
      {
        type: 'svg',
        content: 'stars',
        position: { x: 0, y: 0 },
        animation: { type: 'pulse', duration: 3000 },
      },
    ],
  },
  {
    depth: 0.5,
    parallaxSpeed: 0.5,
    elements: [
      {
        type: 'svg',
        content: 'distant-tombstones',
        position: { x: 0, y: 65 },
      },
    ],
  },
  {
    depth: 1,
    parallaxSpeed: 1,
    elements: [
      {
        type: 'svg',
        content: 'foreground-fence',
        position: { x: 0, y: 80 },
      },
    ],
  },
];

const moonlitGraveyardAmbientElements: AmbientElementDefinition[] = [
  {
    type: 'moon',
    position: { x: 75, y: 10 },
    scale: 1.5,
    layer: 0,
    animation: { type: 'pulse', duration: 8000 },
  },
  {
    type: 'tombstone',
    position: { x: 15, y: 70 },
    scale: 0.8,
    layer: 1,
    animation: { type: 'sway', duration: 10000 },
  },
  {
    type: 'tombstone',
    position: { x: 35, y: 68 },
    scale: 1.0,
    layer: 1,
    animation: { type: 'sway', duration: 12000, delay: 200 },
  },
  {
    type: 'tombstone',
    position: { x: 60, y: 72 },
    scale: 0.7,
    layer: 1,
    animation: { type: 'sway', duration: 11000, delay: 400 },
  },
  {
    type: 'fence',
    position: { x: 0, y: 80 },
    scale: 1.0,
    layer: 2,
    animation: { type: 'sway', duration: 15000 },
  },
  {
    type: 'wisp',
    position: { x: 25, y: 55 },
    scale: 0.5,
    layer: 2,
    animation: { type: 'float', duration: 4000 },
  },
  {
    type: 'wisp',
    position: { x: 70, y: 50 },
    scale: 0.4,
    layer: 2,
    animation: { type: 'float', duration: 3500, delay: 500 },
  },
  {
    type: 'star',
    position: { x: 20, y: 15 },
    scale: 0.3,
    layer: 0,
    animation: { type: 'pulse', duration: 2000 },
  },
];

const moonlitGraveyardParticles: ParticleConfig[] = [
  {
    type: 'fog',
    emissionRate: 8,
    maxParticles: 40,
    particleLifespan: 10000,
    colors: ['rgba(255, 255, 255, 0.15)', 'rgba(147, 51, 234, 0.1)'],
  },
  {
    type: 'sparkle',
    emissionRate: 3,
    maxParticles: 20,
    particleLifespan: 3000,
    colors: ['#FFFFFF', HALLOWEEN_COLORS.primaryLight, '#E0E0FF'],
  },
  {
    type: 'dust',
    emissionRate: 2,
    maxParticles: 15,
    particleLifespan: 5000,
    colors: ['rgba(255, 255, 255, 0.3)', 'rgba(200, 200, 200, 0.2)'],
  },
];

export const MOONLIT_GRAVEYARD_SCENE: SceneDefinition = {
  id: 'moonlit-graveyard',
  name: 'Moonlit Graveyard',
  layers: moonlitGraveyardLayers,
  ambientElements: moonlitGraveyardAmbientElements,
  particles: moonlitGraveyardParticles,
  emotionalOverrides: createDefaultEmotionalOverrides(),
};

// ============================================================================
// Spooky Mansion Scene (Requirements: 5.4)
// ============================================================================

const spookyMansionLayers: LayerDefinition[] = [
  {
    depth: 0,
    parallaxSpeed: 0.1,
    elements: [
      {
        type: 'gradient',
        content: `linear-gradient(180deg, #1a0a2e 0%, ${HALLOWEEN_COLORS.primaryDark} 50%, ${HALLOWEEN_COLORS.darkBg} 100%)`,
        position: { x: 0, y: 0 },
      },
    ],
  },
  {
    depth: 0.2,
    parallaxSpeed: 0.2,
    elements: [
      {
        type: 'svg',
        content: 'moon-crescent',
        position: { x: 80, y: 8 },
        animation: { type: 'pulse', duration: 8000 },
      },
    ],
  },
  {
    depth: 0.4,
    parallaxSpeed: 0.4,
    elements: [
      {
        type: 'svg',
        content: 'mansion-silhouette',
        position: { x: 20, y: 30 },
      },
    ],
  },
  {
    depth: 1,
    parallaxSpeed: 1,
    elements: [
      {
        type: 'svg',
        content: 'foreground-fence',
        position: { x: 0, y: 85 },
      },
    ],
  },
];

const spookyMansionAmbientElements: AmbientElementDefinition[] = [
  {
    type: 'mansion',
    position: { x: 50, y: 65 },
    scale: 0.8,
    layer: 1,
    animation: { type: 'sway', duration: 20000 },
  },
  {
    type: 'candle',
    position: { x: 35, y: 45 },
    scale: 0.3,
    layer: 2,
    animation: { type: 'flicker', duration: 500 },
  },
  {
    type: 'candle',
    position: { x: 45, y: 42 },
    scale: 0.3,
    layer: 2,
    animation: { type: 'flicker', duration: 600, delay: 100 },
  },
  {
    type: 'candle',
    position: { x: 55, y: 48 },
    scale: 0.3,
    layer: 2,
    animation: { type: 'flicker', duration: 450, delay: 200 },
  },
  {
    type: 'bat',
    position: { x: 15, y: 25 },
    scale: 0.4,
    layer: 2,
    animation: { type: 'float', duration: 3000 },
  },
  {
    type: 'bat',
    position: { x: 80, y: 30 },
    scale: 0.35,
    layer: 2,
    animation: { type: 'float', duration: 3500, delay: 400 },
  },
  {
    type: 'moon',
    position: { x: 80, y: 8 },
    scale: 1.2,
    layer: 0,
    animation: { type: 'pulse', duration: 10000 },
  },
];

const spookyMansionParticles: ParticleConfig[] = [
  {
    type: 'fog',
    emissionRate: 6,
    maxParticles: 35,
    particleLifespan: 9000,
    colors: ['rgba(255, 255, 255, 0.12)', 'rgba(91, 33, 182, 0.1)'],
  },
  {
    type: 'sparkle',
    emissionRate: 2,
    maxParticles: 12,
    particleLifespan: 2500,
    colors: [HALLOWEEN_COLORS.orange, '#FFD700', '#FFA500'],
  },
  {
    type: 'dust',
    emissionRate: 3,
    maxParticles: 20,
    particleLifespan: 6000,
    colors: ['rgba(255, 255, 255, 0.2)', 'rgba(180, 180, 180, 0.15)'],
  },
];

export const SPOOKY_MANSION_SCENE: SceneDefinition = {
  id: 'spooky-mansion',
  name: 'Spooky Mansion',
  layers: spookyMansionLayers,
  ambientElements: spookyMansionAmbientElements,
  particles: spookyMansionParticles,
  emotionalOverrides: createDefaultEmotionalOverrides(),
};

// ============================================================================
// Scene Registry
// ============================================================================

/**
 * Map of all available scenes by their ID
 */
export const SCENE_REGISTRY: Record<SceneType, SceneDefinition> = {
  'haunted-forest': HAUNTED_FOREST_SCENE,
  'moonlit-graveyard': MOONLIT_GRAVEYARD_SCENE,
  'spooky-mansion': SPOOKY_MANSION_SCENE,
};

/**
 * Get a scene definition by its type
 */
export const getSceneDefinition = (sceneType: SceneType): SceneDefinition => {
  return SCENE_REGISTRY[sceneType];
};

/**
 * Get all available scene types
 */
export const getAvailableScenes = (): SceneType[] => {
  return Object.keys(SCENE_REGISTRY) as SceneType[];
};

/**
 * Default scene when no preference is set
 */
export const DEFAULT_SCENE: SceneType = 'haunted-forest';
