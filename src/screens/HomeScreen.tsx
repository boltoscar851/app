import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../types/navigation';
import FloatingHearts from '../components/FloatingHearts';
import SparkleEffects from '../components/SparkleEffects';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const { width, height } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const heartBeatAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Heart beat animation
    const heartBeat = () => {
      Animated.sequence([
        Animated.timing(heartBeatAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(heartBeatAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(heartBeat, 2000);
      });
    };
    heartBeat();
  }, []);

  const handleEnterApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Rules');
  };

  return (
    <LinearGradient
      colors={['#000000', '#1a0033', '#330066', '#1a0033', '#000000']}
      style={styles.container}
    >
      <FloatingHearts />
      <SparkleEffects />
      
      <Animated.View
        style={[
          styles.content,
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('DailyQuestions' as never);
          }}
          activeOpacity={0.8}
        >
          <BlurView intensity={20} style={styles.quickActionBlur}>
            <Text style={styles.quickActionEmoji}>❓</Text>
            <Text style={styles.quickActionText}>Pregunta del Día</Text>
          </BlurView>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('Counters' as never);
          }}
          activeOpacity={0.8}
        >
          <BlurView intensity={20} style={styles.quickActionBlur}>
            <Text style={styles.quickActionEmoji}>📊</Text>
            <Text style={styles.quickActionText}>Contadores</Text>
          </BlurView>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('Activities' as never);
          }}
          activeOpacity={0.8}
        >
          <BlurView intensity={20} style={styles.quickActionBlur}>
            <Text style={styles.quickActionEmoji}>🎯</Text>
            <Text style={styles.quickActionText}>Actividades</Text>
          </BlurView>
        </TouchableOpacity>
      </View>

          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Crown and Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.mainTitle}>💕 Reglas del Amor Eterno 💕</Text>
          <Text style={styles.crown}>👑</Text>
        </View>

        {/* Couple Container */}
        <View style={styles.coupleContainer}>
          <View style={styles.person}>
            <View style={styles.avatar}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>O</Text>
              </View>
            </View>
            <Text style={styles.personName}>Oscar</Text>
          </View>

          <Animated.View
            style={[
              styles.heartCenter,
              { transform: [{ scale: heartBeatAnim }] },
            ]}
          >
            <Text style={styles.heartIcon}>❤️</Text>
            <Text style={styles.loveText}>💕 Amor Infinito 💕</Text>
          </Animated.View>

          <View style={styles.person}>
            <View style={[styles.avatar, styles.avatarDelayed]}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>Y</Text>
              </View>
            </View>
            <Text style={styles.personName}>Yuritzy</Text>
          </View>
        </View>

        {/* Enter Button */}
        <TouchableOpacity
          style={styles.enterButton}
          onPress={handleEnterApp}
          activeOpacity={0.8}
        >
          <BlurView intensity={20} style={styles.buttonBlur}>
            <LinearGradient
              colors={['#ff1493', '#8b008b']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Ver Nuestras Reglas</Text>
              <Text style={styles.buttonEmoji}>💖</Text>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>

        {/* Golden Rule Preview */}
        <View style={styles.goldenPreview}>
          <Text style={styles.goldenTitle}>🌟 Regla de Oro (#30)</Text>
          <Text style={styles.goldenText}>Amarnos por siempre 💗🤍</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 15,
  },
  crown: {
    fontSize: 40,
    textShadowColor: '#ffd700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  mainTitle: {
    fontSize: width > 400 ? 28 : 24,
    fontWeight: 'bold',
    color: '#ff69b4',
    textAlign: 'center',
    textShadowColor: '#ff1493',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  coupleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    gap: 30,
  },
  person: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#ff1493',
    shadowColor: '#ff1493',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  avatarDelayed: {
    // Animation delay handled in component
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: '#ff69b4',
    borderRadius: 37,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  personName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff69b4',
    textShadowColor: '#ff1493',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  heartCenter: {
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 60,
    marginBottom: 10,
    textShadowColor: '#ff1493',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  loveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff69b4',
    textShadowColor: '#ff1493',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  quickActionBlur: {
    backgroundColor: 'rgba(255, 20, 147, 0.2)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff1493',
  },
  quickActionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    color: '#ff69b4',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  enterButton: {
    marginBottom: 40,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#ff1493',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  buttonBlur: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    gap: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  buttonEmoji: {
    fontSize: 20,
  },
  goldenPreview: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#fcd34d',
    alignItems: 'center',
    shadowColor: '#fcd34d',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  goldenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fcd34d',
    marginBottom: 8,
    textShadowColor: '#d97706',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  goldenText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fbbf24',
    textShadowColor: '#d97706',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
});

export default HomeScreen;