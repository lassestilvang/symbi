/**
 * SceneRenderer Component
 *
 * Renders the complete habitat scene with parallax layers, ambient elements,
 * and particle systems. Applies time phase colors and emotional modifiers.
 *
 * Requirements: 1.1, 1.2, 1.4, 2.1, 3.1, 4.1, 4.2, 4.3
 */

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
import type {
  SceneRendererProps,
  HabitatConfig,
  SceneDefinition,
  SceneModifiers,
  QualitySettings,
  SceneType,
} from '../../types/habitat';
import { ParallaxLayer } from './ParallaxLayer';
import { AmbientElement } from './AmbientElement';
import { ParticleSystem } from './ParticleSystem';
import { getSceneDefinition } from '../../constants/habitatScenes';
import { getTimePhaseColors } from '../../utils/TimeManager';
import { getSceneModifiers } from '../../utils/getSceneModifiers';
import { getQualitySettings } from '../../utils/getQualitySettings';

// Background images for each habitat scene
// eslint-disable-next-line @typescript-eslint/no-require-imports
const hauntedForestBg = require('../../assets/images/habitats/haunted-forest.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const moonlitGraveyardBg = require('../../assets/images/habitats/moonlit-graveyard.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const spookyMansionBg = require('../../assets/images/habitats/spooky-mansion.png');

const SCENE_BACKGROUNDS: Record<SceneType, ImageSourcePropType> = {
  'haunted-forest': hauntedForestBg,
  'moonlit-graveyard': moonlitGraveyardBg,
  'spooky-mansion': spookyMansionBg,
};

const TRANSITION_DURATIONS = {
  timePhase: 3000,
  emotionalState: 1500,
};

export const SceneRenderer: React.FC<SceneRendererProps> = ({
  config,
  dimensions,
  onTransitionComplete,
}) => {
  const transitionOpacity = useRef(new Animated.Value(1)).current;
  const ambientCrossfadeOpacity = useRef(new Animated.Value(1)).current;
  const colorTransitionProgress = useRef(new Animated.Value(1)).current;
  const prevConfigRef = useRef<HabitatConfig | null>(null);
  const isTransitioningRef = useRef(false);
  const activeAnimationsRef = useRef<Animated.CompositeAnimation[]>([]);

  const sceneDefinition: SceneDefinition = useMemo(
    () => getSceneDefinition(config.scene),
    [config.scene]
  );

  // Time phase colors available for future use (e.g., tinting overlay)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _timePhaseColors = useMemo(() => getTimePhaseColors(config.timePhase), [config.timePhase]);

  const sceneModifiers: SceneModifiers = useMemo(
    () => getSceneModifiers(config.emotionalState),
    [config.emotionalState]
  );

  const qualitySettings: QualitySettings = useMemo(
    () => getQualitySettings({ quality: config.quality, reducedMotion: false }),
    [config.quality]
  );

  const stopActiveAnimations = useCallback(() => {
    activeAnimationsRef.current.forEach(anim => anim.stop());
    activeAnimationsRef.current = [];
  }, []);

  const handleSimultaneousTransitions = useCallback(
    (timePhaseChanged: boolean, emotionalStateChanged: boolean, sceneChanged: boolean) => {
      stopActiveAnimations();
      isTransitioningRef.current = true;

      const animations: Animated.CompositeAnimation[] = [];

      if (timePhaseChanged || sceneChanged) {
        colorTransitionProgress.setValue(0);
        animations.push(
          Animated.timing(colorTransitionProgress, {
            toValue: 1,
            duration: TRANSITION_DURATIONS.timePhase,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          })
        );
        animations.push(
          Animated.sequence([
            Animated.timing(transitionOpacity, {
              toValue: 0.85,
              duration: TRANSITION_DURATIONS.timePhase * 0.25,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(transitionOpacity, {
              toValue: 1,
              duration: TRANSITION_DURATIONS.timePhase * 0.75,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
      }

      if (emotionalStateChanged) {
        ambientCrossfadeOpacity.setValue(0.6);
        animations.push(
          Animated.timing(ambientCrossfadeOpacity, {
            toValue: 1,
            duration: TRANSITION_DURATIONS.emotionalState,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        );
      }

      if (animations.length > 0) {
        const combinedAnimation = Animated.parallel(animations);
        activeAnimationsRef.current.push(combinedAnimation);
        combinedAnimation.start(() => {
          isTransitioningRef.current = false;
          activeAnimationsRef.current = activeAnimationsRef.current.filter(
            a => a !== combinedAnimation
          );
          onTransitionComplete?.();
        });
      }
    },
    [
      stopActiveAnimations,
      colorTransitionProgress,
      transitionOpacity,
      ambientCrossfadeOpacity,
      onTransitionComplete,
    ]
  );

  useEffect(() => {
    const prevConfig = prevConfigRef.current;
    if (prevConfig) {
      const timePhaseChanged = prevConfig.timePhase !== config.timePhase;
      const emotionalStateChanged = prevConfig.emotionalState !== config.emotionalState;
      const sceneChanged = prevConfig.scene !== config.scene;
      if (timePhaseChanged || emotionalStateChanged || sceneChanged) {
        handleSimultaneousTransitions(timePhaseChanged, emotionalStateChanged, sceneChanged);
      }
    }
    prevConfigRef.current = config;
  }, [config, handleSimultaneousTransitions]);

  useEffect(() => {
    return () => stopActiveAnimations();
  }, [stopActiveAnimations]);

  const visibleAmbientElements = useMemo(() => {
    const maxElements = qualitySettings.ambientElementCount;
    return sceneDefinition.ambientElements.slice(0, maxElements);
  }, [sceneDefinition.ambientElements, qualitySettings.ambientElementCount]);

  const visibleLayers = useMemo(() => {
    const maxLayers = qualitySettings.parallaxLayers;
    return sceneDefinition.layers.slice(0, Math.max(1, maxLayers));
  }, [sceneDefinition.layers, qualitySettings.parallaxLayers]);

  /**
   * Get background image for current scene
   */
  const backgroundImage = useMemo(
    () => SCENE_BACKGROUNDS[config.scene] || hauntedForestBg,
    [config.scene]
  );

  /**
   * Render scene background with themed image
   */
  const renderBackground = () => (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover" />
  );

  const renderParallaxLayers = () => {
    return visibleLayers.map((layer, index) => (
      <ParallaxLayer
        key={`layer-${index}-${layer.depth}`}
        depth={layer.depth}
        zIndex={index}
        width={dimensions.width}
        height={dimensions.height}>
        <View style={styles.layerContent} />
      </ParallaxLayer>
    ));
  };

  const renderAmbientElements = () => {
    return visibleAmbientElements.map((element, index) => (
      <AmbientElement
        key={`ambient-${element.type}-${index}`}
        type={element.type}
        position={element.position}
        scale={element.scale}
        animationDelay={element.animation.delay || index * 200}
        animation={element.animation}
        emotionalState={config.emotionalState}
        containerSize={dimensions}
      />
    ));
  };

  const renderParticleSystems = () => {
    if (qualitySettings.particleMultiplier === 0) return null;

    return sceneDefinition.particles.map((particleConfig, index) => (
      <ParticleSystem
        key={`particles-${particleConfig.type}-${index}`}
        type={particleConfig.type}
        emissionRate={particleConfig.emissionRate}
        maxParticles={particleConfig.maxParticles}
        bounds={dimensions}
        emotionalState={config.emotionalState}
        qualityMultiplier={qualitySettings.particleMultiplier}
        colors={particleConfig.colors}
        particleLifespan={particleConfig.particleLifespan}
        isPaused={false}
      />
    ));
  };

  const containerStyle = useMemo(
    () => [
      styles.container,
      {
        width: dimensions.width,
        height: dimensions.height,
        opacity: sceneModifiers.brightness,
      },
    ],
    [dimensions, sceneModifiers.brightness]
  );

  return (
    <Animated.View style={[containerStyle, { opacity: transitionOpacity }]}>
      {renderBackground()}
      {renderParallaxLayers()}
      <Animated.View style={[styles.ambientContainer, { opacity: ambientCrossfadeOpacity }]}>
        {renderAmbientElements()}
      </Animated.View>
      <View style={styles.particleContainer}>{renderParticleSystems()}</View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  layerContent: {
    flex: 1,
  },
  ambientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
});

export default SceneRenderer;
