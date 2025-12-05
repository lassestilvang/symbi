/**
 * ParticleSystem Component
 *
 * Manages particle generation and lifecycle for habitat effects.
 * Supports different particle types (fog, sparkles, fireflies, leaves)
 * and respects quality settings for particle count.
 *
 * Requirements: 1.3, 2.2, 2.3, 2.4, 6.1
 * - Animate ambient elements smoothly at 60 FPS
 * - SAD state: slower ambient animations
 * - ACTIVE/VIBRANT: more energetic particle effects
 * - CALM/RESTED: gentle floating particles
 * - Low-performance device: reduce particle count by 50%
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing, ViewStyle } from 'react-native';
import type {
  ParticleType,
  Particle,
  ParticleSystemProps,
  SceneModifiers,
} from '../../types/habitat';
import { getSceneModifiers } from '../../utils/getSceneModifiers';
import { HALLOWEEN_COLORS } from '../../constants/theme';

/**
 * Extended props for the ParticleSystem component
 */
interface ParticleSystemComponentProps extends ParticleSystemProps {
  /** Quality multiplier (0-1) for particle count */
  qualityMultiplier?: number;
  /** Colors for particles */
  colors?: string[];
  /** Particle lifespan in ms */
  particleLifespan?: number;
  /** Whether the system is paused */
  isPaused?: boolean;
  /** Additional styles */
  style?: ViewStyle;
}

/**
 * Default particle configurations by type
 */
const PARTICLE_DEFAULTS: Record<
  ParticleType,
  {
    baseSize: { min: number; max: number };
    velocity: { x: { min: number; max: number }; y: { min: number; max: number } };
    opacity: { min: number; max: number };
    colors: string[];
  }
> = {
  fog: {
    baseSize: { min: 40, max: 80 },
    velocity: { x: { min: -0.2, max: 0.2 }, y: { min: -0.1, max: 0.1 } },
    opacity: { min: 0.05, max: 0.15 },
    colors: ['rgba(255, 255, 255, 0.1)', 'rgba(124, 58, 237, 0.1)'],
  },
  sparkle: {
    baseSize: { min: 2, max: 6 },
    velocity: { x: { min: -0.5, max: 0.5 }, y: { min: -1, max: -0.2 } },
    opacity: { min: 0.5, max: 1 },
    colors: ['#FFFFFF', HALLOWEEN_COLORS.primaryLight, '#FFD700'],
  },
  rain: {
    baseSize: { min: 2, max: 4 },
    velocity: { x: { min: -0.5, max: 0 }, y: { min: 3, max: 6 } },
    opacity: { min: 0.3, max: 0.6 },
    colors: ['rgba(150, 200, 255, 0.5)', 'rgba(100, 150, 200, 0.4)'],
  },
  leaves: {
    baseSize: { min: 8, max: 16 },
    velocity: { x: { min: -1, max: 1 }, y: { min: 0.5, max: 1.5 } },
    opacity: { min: 0.6, max: 0.9 },
    colors: [HALLOWEEN_COLORS.orange, '#8B4513', '#654321'],
  },
  fireflies: {
    baseSize: { min: 3, max: 6 },
    velocity: { x: { min: -0.3, max: 0.3 }, y: { min: -0.3, max: 0.3 } },
    opacity: { min: 0.4, max: 1 },
    colors: ['#FFFF00', '#FFD700', HALLOWEEN_COLORS.green],
  },
  dust: {
    baseSize: { min: 1, max: 3 },
    velocity: { x: { min: -0.2, max: 0.2 }, y: { min: -0.5, max: 0.5 } },
    opacity: { min: 0.2, max: 0.4 },
    colors: ['rgba(255, 255, 255, 0.3)', 'rgba(200, 200, 200, 0.2)'],
  },
};

/**
 * Generate a unique particle ID
 */
let particleIdCounter = 0;
const generateParticleId = (): string => {
  particleIdCounter += 1;
  return `particle-${particleIdCounter}-${Date.now()}`;
};

/**
 * Get a random value between min and max
 */
const randomRange = (min: number, max: number): number => {
  return min + Math.random() * (max - min);
};

/**
 * Pick a random color from an array
 */
const randomColor = (colors: string[]): string => {
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * ParticleSystem manages particle generation and animation.
 *
 * Uses requestAnimationFrame for smooth 60 FPS updates and
 * respects quality settings to reduce particle count on
 * lower-powered devices.
 */
export const ParticleSystem: React.FC<ParticleSystemComponentProps> = ({
  type,
  emissionRate,
  maxParticles,
  bounds,
  emotionalState,
  qualityMultiplier = 1,
  colors,
  particleLifespan = 5000,
  isPaused = false,
  style,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastEmitTimeRef = useRef<number>(0);
  const particleAnimations = useRef<Map<string, Animated.Value>>(new Map());

  // Get particle defaults for this type
  const defaults = PARTICLE_DEFAULTS[type];
  const particleColors = colors || defaults.colors;

  // Get emotional state modifiers
  const modifiers: SceneModifiers = useMemo(
    () => getSceneModifiers(emotionalState),
    [emotionalState]
  );

  // Calculate adjusted max particles based on quality
  const adjustedMaxParticles = useMemo(() => {
    return Math.floor(maxParticles * qualityMultiplier);
  }, [maxParticles, qualityMultiplier]);

  // Calculate adjusted emission rate based on emotional state
  const adjustedEmissionRate = useMemo(() => {
    return emissionRate * modifiers.particleSpeed;
  }, [emissionRate, modifiers.particleSpeed]);

  /**
   * Create a new particle
   */
  const createParticle = useCallback((): Particle => {
    const sizeRange = defaults.baseSize;
    const velocityRange = defaults.velocity;
    const opacityRange = defaults.opacity;

    // Apply emotional modifiers to velocity
    const speedMultiplier = modifiers.particleSpeed;

    return {
      id: generateParticleId(),
      x: randomRange(0, bounds.width),
      y: type === 'rain' ? -20 : randomRange(0, bounds.height),
      vx: randomRange(velocityRange.x.min, velocityRange.x.max) * speedMultiplier,
      vy: randomRange(velocityRange.y.min, velocityRange.y.max) * speedMultiplier,
      life: particleLifespan,
      maxLife: particleLifespan,
      size: randomRange(sizeRange.min, sizeRange.max),
      opacity: randomRange(opacityRange.min, opacityRange.max) * modifiers.brightness,
      color: randomColor(particleColors),
    };
  }, [bounds, defaults, modifiers, particleColors, particleLifespan, type]);

  /**
   * Update particle positions and lifecycle
   */
  const updateParticles = useCallback(
    (deltaTime: number) => {
      setParticles(prevParticles => {
        // Update existing particles
        const updated = prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx * deltaTime,
            y: particle.y + particle.vy * deltaTime,
            life: particle.life - deltaTime * 16, // Approximate ms per frame
            opacity: particle.opacity * (particle.life / particle.maxLife),
          }))
          .filter(particle => {
            // Remove dead particles
            if (particle.life <= 0) {
              particleAnimations.current.delete(particle.id);
              return false;
            }
            // Remove particles outside bounds (with margin)
            if (
              particle.x < -50 ||
              particle.x > bounds.width + 50 ||
              particle.y < -50 ||
              particle.y > bounds.height + 50
            ) {
              particleAnimations.current.delete(particle.id);
              return false;
            }
            return true;
          });

        return updated;
      });
    },
    [bounds]
  );

  /**
   * Emit new particles based on emission rate
   */
  const emitParticles = useCallback(
    (currentTime: number) => {
      const timeSinceLastEmit = currentTime - lastEmitTimeRef.current;
      const emitInterval = 1000 / adjustedEmissionRate;

      if (timeSinceLastEmit >= emitInterval) {
        setParticles(prevParticles => {
          if (prevParticles.length < adjustedMaxParticles) {
            const newParticle = createParticle();

            // Create animation value for this particle
            const animValue = new Animated.Value(1);
            particleAnimations.current.set(newParticle.id, animValue);

            // Animate opacity fade
            Animated.timing(animValue, {
              toValue: 0,
              duration: particleLifespan,
              easing: Easing.linear,
              useNativeDriver: true,
            }).start();

            return [...prevParticles, newParticle];
          }
          return prevParticles;
        });
        lastEmitTimeRef.current = currentTime;
      }
    },
    [adjustedEmissionRate, adjustedMaxParticles, createParticle, particleLifespan]
  );

  /**
   * Main animation loop
   */
  useEffect(() => {
    if (isPaused || qualityMultiplier === 0) {
      return;
    }

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16; // Normalize to ~60fps
      lastTime = currentTime;

      updateParticles(deltaTime);
      emitParticles(currentTime);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, qualityMultiplier, updateParticles, emitParticles]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      particleAnimations.current.clear();
      setParticles([]);
    };
  }, []);

  // Don't render if quality is 0 (reduced motion)
  if (qualityMultiplier === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { width: bounds.width, height: bounds.height }, style]}>
      {particles.map(particle => (
        <ParticleView key={particle.id} particle={particle} type={type} />
      ))}
    </View>
  );
};

/**
 * Individual particle view component
 */
interface ParticleViewProps {
  particle: Particle;
  type: ParticleType;
}

const ParticleView: React.FC<ParticleViewProps> = React.memo(({ particle, type }) => {
  // Get particle shape based on type
  const getParticleStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      position: 'absolute',
      left: particle.x,
      top: particle.y,
      width: particle.size,
      height: particle.size,
      opacity: particle.opacity,
    };

    switch (type) {
      case 'fog':
        return {
          ...baseStyle,
          backgroundColor: particle.color,
          borderRadius: particle.size / 2,
          // Fog particles are larger and blurrier
          width: particle.size * 2,
          height: particle.size * 2,
        };
      case 'sparkle':
      case 'fireflies':
        return {
          ...baseStyle,
          backgroundColor: particle.color,
          borderRadius: particle.size / 2,
          // Add glow effect simulation
          shadowColor: particle.color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: particle.size,
        };
      case 'rain':
        return {
          ...baseStyle,
          backgroundColor: particle.color,
          borderRadius: 1,
          // Rain drops are elongated
          height: particle.size * 3,
        };
      case 'leaves':
        return {
          ...baseStyle,
          backgroundColor: particle.color,
          borderRadius: particle.size / 4,
          // Leaves are slightly oval
          width: particle.size * 0.8,
        };
      case 'dust':
      default:
        return {
          ...baseStyle,
          backgroundColor: particle.color,
          borderRadius: particle.size / 2,
        };
    }
  };

  return <View style={getParticleStyle()} />;
});

ParticleView.displayName = 'ParticleView';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
});

export default ParticleSystem;
