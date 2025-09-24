import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const FloatingHearts: React.FC = () => {
  const hearts = ['💕', '💖', '💝', '💗', '💓', '💘', '💞', '💟'];
  const animatedValues = useRef(
    Array.from({ length: 15 }, () => ({
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((values, index) => {
      const animateHeart = () => {
        Animated.sequence([
          Animated.timing(values.opacity, {
            toValue: 0.7,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(values.translateY, {
              toValue: -50,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(values.scale, {
                toValue: 1.2,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(values.scale, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.timing(values.opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Reset values
          values.translateY.setValue(0);
          values.scale.setValue(1);
          // Restart animation after random delay
          setTimeout(animateHeart, Math.random() * 3000 + 1000);
        });
      };

      // Start with random delay
      setTimeout(animateHeart, index * 200 + Math.random() * 2000);
      return animateHeart;
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
            styles.heart,
            {
              left: Math.random() * (width - 40),
              top: height - 100 + Math.random() * 50,
              opacity: values.opacity,
              transform: [
                { translateY: values.translateY },
                { scale: values.scale },
              ],
            },
          ]}
        >
          {hearts[Math.floor(Math.random() * hearts.length)]}
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
  heart: {
    position: 'absolute',
    fontSize: 24,
    textShadowColor: '#ff1493',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default FloatingHearts;