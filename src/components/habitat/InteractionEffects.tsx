/**
 * InteractionEffects Component
 *
 * Renders visual feedback for habitat interactions including:
 * - Particle burst effects for background taps
 * - Ripple effects for Symbi poke interactions
 * - Glow effects for hover feedback
 *
 * Requirements: 7.1, 7.3, 7.4
 * - Trigger localized particle burst at interaction point
 * - Trigger ripple effect through nearby ambient elements
 * - Complete effects within 1 second
 *
 * @example
 * ```tsx
 * const { effects } = useHabitatInteraction();
 *
 * <InteractionEffects effects={effects} containerSize={{ width: 400, height: 600 }} />
 * ```
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import type { AnimatedInteractionEffect } from '../../hooks/useHabitatInteraction';
import type { Dimensions } from '../../types/habitat';
import { HALLOWEEN_COLORS } from '../../constants/theme';

/**
 * Props for the InteractionEffects component
 */
interface InteractionEffectsProps {
  /** Array of active interaction effects */
  effects: AnimatedInteractionEffect[];
  /** Container dimensions for bounds checking */
  containerSize: Dimensions;
  /** Additional styles */
  style?: ViewStyle;
}

/**
 * Props for individual effect renderers
 */
interface EffectRendererProps {
  effect: AnimatedInteractionEffect;
}

/**
 * Burst effect colors - Halloween themed
 */
const BURST_COLORS = [
  HALLOWEEN_COLORS.primaryLight,
  HALLOWEEN_COLORS.primary,
  HALLOWEEN_COLORS.orange,
  '#FFD700', // Gold
  HALLOWEEN_COLORS.ghostWhite,
  '#00FF88', // Ghostly green
  '#FF6B6B', // Spooky red
];

/**
 * Halloween emoji particles for burst effect
 */
const HALLOWEEN_EMOJIS = ['👻', '🎃', '✨', '💜', '🦇', '⭐', '🌙', '💫'];

/**
 * Ripple effect color
 */
const RIPPLE_COLOR = HALLOWEEN_COLORS.primaryLight;

/**
 * Glow effect color
 */
const GLOW_COLOR = HALLOWEEN_COLORS.primary;

/**
 * BurstEffect renders a particle burst animation
 * Requirement: 7.1 - Localized particle burst at interaction point
 */
const BurstEffect: React.FC<EffectRendererProps> = React.memo(({ effect }) => {
  const { position, progress, config } = effect;
  const particleCount = config.particleCount || 12;

  // Generate particles in a circular pattern - BIGGER and more dramatic
  const particles = useMemo(() => {
    return Array.from({ length: particleCount * 2 }, (_, i) => {
      const angle = (i / (particleCount * 2)) * Math.PI * 2 + Math.random() * 0.3;
      const distance = 80 + Math.random() * 150; // Much bigger: 80-230px
      const size = 8 + Math.random() * 12; // Bigger particles: 8-20px
      const color = BURST_COLORS[i % BURST_COLORS.length];
      const isEmoji = i < 8; // First 8 particles are emojis
      const emoji = HALLOWEEN_EMOJIS[i % HALLOWEEN_EMOJIS.length];

      return {
        id: i,
        angle,
        distance,
        size,
        color,
        isEmoji,
        emoji,
        delay: Math.random() * 0.15,
        rotationSpeed: (Math.random() - 0.5) * 720, // Random rotation
      };
    });
  }, [particleCount]);

  // Calculate opacity based on progress (fade out in last 30%)
  const opacity = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;

  return (
    <View style={[styles.effectContainer, { left: position.x, top: position.y }]}>
      {particles.map(particle => {
        // Adjust progress for particle delay
        const adjustedProgress = Math.max(0, Math.min(1, (progress - particle.delay) / 0.85));

        // Easing function for natural motion (ease-out with bounce)
        const easedProgress = 1 - Math.pow(1 - adjustedProgress, 3);

        // Calculate particle position
        const x = Math.cos(particle.angle) * particle.distance * easedProgress;
        const y =
          Math.sin(particle.angle) * particle.distance * easedProgress -
          (particle.isEmoji ? easedProgress * 30 : 0); // Emojis float up slightly

        // Scale animation
        const scale = particle.isEmoji
          ? 1 + Math.sin(adjustedProgress * Math.PI) * 0.3
          : 1 - easedProgress * 0.5;

        const rotation = particle.rotationSpeed * adjustedProgress;

        if (particle.isEmoji) {
          return (
            <View
              key={particle.id}
              style={{
                position: 'absolute',
                left: x - 16,
                top: y - 16,
                opacity: opacity * (1 - easedProgress * 0.2),
                transform: [{ scale }, { rotate: `${rotation}deg` }],
              }}>
              <Text style={{ fontSize: 28 }}>{particle.emoji}</Text>
            </View>
          );
        }

        const particleStyle: ViewStyle = {
          position: 'absolute',
          left: x - particle.size / 2,
          top: y - particle.size / 2,
          width: particle.size * scale,
          height: particle.size * scale,
          borderRadius: (particle.size * scale) / 2,
          backgroundColor: particle.color,
          opacity: opacity * (1 - easedProgress * 0.3),
          shadowColor: particle.color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: particle.size * 1.5,
        };

        return <View key={particle.id} style={particleStyle} />;
      })}
    </View>
  );
});

BurstEffect.displayName = 'BurstEffect';

/**
 * RippleEffect renders an expanding ripple animation
 * Requirement: 7.3 - Ripple effect for Symbi poke
 */
const RippleEffect: React.FC<EffectRendererProps> = React.memo(({ effect }) => {
  const { position, progress, config } = effect;
  const maxRadius = config.maxRadius || 150;

  // Easing function for smooth expansion (ease-out)
  const easedProgress = 1 - Math.pow(1 - progress, 2);

  // Opacity fades out as ripple expands
  const opacity = 1 - easedProgress;

  // Multiple ripple rings for depth
  const rings = [
    { scale: 1, opacityMultiplier: 1, delay: 0 },
    { scale: 0.7, opacityMultiplier: 0.7, delay: 0.1 },
    { scale: 0.4, opacityMultiplier: 0.5, delay: 0.2 },
  ];

  return (
    <View style={[styles.effectContainer, { left: position.x, top: position.y }]}>
      {rings.map((ring, index) => {
        const ringProgress = Math.max(0, Math.min(1, (progress - ring.delay) / 0.8));
        const ringEasedProgress = 1 - Math.pow(1 - ringProgress, 2);
        const ringRadius = maxRadius * ring.scale * ringEasedProgress;
        const ringOpacity = (1 - ringEasedProgress) * ring.opacityMultiplier;

        const ringStyle: ViewStyle = {
          position: 'absolute',
          left: -ringRadius,
          top: -ringRadius,
          width: ringRadius * 2,
          height: ringRadius * 2,
          borderRadius: ringRadius,
          borderWidth: 2,
          borderColor: RIPPLE_COLOR,
          opacity: ringOpacity,
          backgroundColor: 'transparent',
        };

        return <View key={index} style={ringStyle} />;
      })}

      {/* Center glow */}
      <View
        style={[
          styles.rippleCenter,
          {
            opacity: opacity * 0.6,
            transform: [{ scale: 1 - easedProgress * 0.5 }],
          },
        ]}
      />
    </View>
  );
});

RippleEffect.displayName = 'RippleEffect';

/**
 * GlowEffect renders a pulsing glow animation
 */
const GlowEffect: React.FC<EffectRendererProps> = React.memo(({ effect }) => {
  const { position, progress } = effect;

  // Pulse effect - grows then shrinks
  const pulseProgress = Math.sin(progress * Math.PI);
  const size = 20 + pulseProgress * 30;
  const opacity = pulseProgress * 0.8;

  const glowStyle: ViewStyle = {
    position: 'absolute',
    left: -size / 2,
    top: -size / 2,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: GLOW_COLOR,
    opacity,
    shadowColor: GLOW_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: size / 2,
  };

  return (
    <View style={[styles.effectContainer, { left: position.x, top: position.y }]}>
      <View style={glowStyle} />
    </View>
  );
});

GlowEffect.displayName = 'GlowEffect';

/**
 * InteractionEffects renders all active interaction effects
 */
export const InteractionEffects: React.FC<InteractionEffectsProps> = ({
  effects,
  containerSize,
  style,
}) => {
  if (effects.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { width: containerSize.width, height: containerSize.height },
        style,
      ]}>
      {effects.map(effect => {
        switch (effect.type) {
          case 'burst':
            return <BurstEffect key={effect.id} effect={effect} />;
          case 'ripple':
            return <RippleEffect key={effect.id} effect={effect} />;
          case 'glow':
            return <GlowEffect key={effect.id} effect={effect} />;
          default:
            return null;
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  effectContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleCenter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: RIPPLE_COLOR,
    position: 'absolute',
    left: -8,
    top: -8,
  },
});

export default InteractionEffects;
