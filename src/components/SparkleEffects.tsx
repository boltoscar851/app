import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const SparkleEffects: React.FC = () => {
  const sparkles = ['✨', '⭐', '🌟', '💫', '⚡'];
  const animatedValues = useRef(
    Array.from({ length: 12 }, () => ({
      opacity: new Animated.Value(0.5),
      scale: new Animated.Value(1),
      rotate: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((values, index) => {
      const animateSparkle = () => {
        Animated.parallel([
          Animated.sequence([
            Animated.timing(values.opacity, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(values.opacity, {
              toValue: 0.5,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(values.scale, {
            toValue: 1.5,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(values.rotate, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Reset values
          values.scale.setValue(1);
          values.rotate.setValue(0);
          // Restart animation after delay
          setTimeout(animateSparkle, Math.random() * 2000 + 1000);
        });
      };

      // Start with random delay
      setTimeout(animateSparkle, index * 250 + Math.random() * 1000);
      return animateSparkle;
    });

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <View style={styles.container}>
      {animatedValues.map((values, index) => (
        <Animated.Text
          key={index}
          style={[
            styles.sparkle,
            {
              left: Math.random() * (width - 30),
              top: Math.random() * (height - 30),
              opacity: values.opacity,
              transform: [
                { scale: values.scale },
                {
                  rotate: values.rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          {sparkles[Math.floor(Math.random() * sparkles.length)]}
        </Animated.Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 1,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 20,
    textShadowColor: '#ffd700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});

export default SparkleEffects;