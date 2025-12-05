/**
 * Habitat Components Barrel Export
 *
 * Exports all habitat-related components for the Interactive Symbi Habitat feature.
 * Requirements: 1.1
 */

// Main orchestrator component
export { HabitatManager } from './HabitatManager';
export type { HabitatManagerHandle } from './HabitatManager';

// Core rendering components
export { ParallaxLayer, AnimatedParallaxLayer } from './ParallaxLayer';
export { AmbientElement } from './AmbientElement';
export { ParticleSystem } from './ParticleSystem';
export { SceneRenderer } from './SceneRenderer';
export { InteractionEffects } from './InteractionEffects';

// UI components
export { SceneSelector } from './SceneSelector';

// Default exports
export { default as HabitatManagerDefault } from './HabitatManager';
export { default as ParallaxLayerDefault } from './ParallaxLayer';
export { default as AmbientElementDefault } from './AmbientElement';
export { default as ParticleSystemDefault } from './ParticleSystem';
export { default as SceneRendererDefault } from './SceneRenderer';
export { default as InteractionEffectsDefault } from './InteractionEffects';
export { default as SceneSelectorDefault } from './SceneSelector';
