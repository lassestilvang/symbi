import React, { useState, useEffect } from 'react';
import { View, Image, ActivityIndicator, StyleSheet, ViewStyle, ImageStyle } from 'react-native';

/**
 * ProgressiveImage Component
 * 
 * Implements progressive image loading for evolved Symbi appearances.
 * Shows a loading indicator while the image is being fetched.
 * 
 * Requirement 8.3: Implement progressive image loading for evolutions
 */

interface ProgressiveImageProps {
  source: { uri: string } | number;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  placeholderColor?: string;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  source,
  style,
  containerStyle,
  placeholderColor = '#7C3AED',
  onLoadStart,
  onLoadEnd,
  onError,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset loading state when source changes
    setLoading(true);
    setError(false);
  }, [source]);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setLoading(false);
    onLoadEnd?.();
  };

  const handleError = (e: any) => {
    setLoading(false);
    setError(true);
    onError?.(e);
    console.error('Image loading error:', e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {loading && (
        <View style={[styles.placeholder, { backgroundColor: placeholderColor }]}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
      
      {error && (
        <View style={[styles.placeholder, { backgroundColor: placeholderColor }]}>
          <View style={styles.errorContainer}>
            {/* Could add an error icon here */}
          </View>
        </View>
      )}

      <Image
        source={source}
        style={[style, loading && styles.hidden]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hidden: {
    opacity: 0,
  },
});
