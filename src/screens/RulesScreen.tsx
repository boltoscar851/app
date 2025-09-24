import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

import { rules, goldenRule } from '../data/rules';
import FloatingHearts from '../components/FloatingHearts';
import SparkleEffects from '../components/SparkleEffects';
import RuleCard from '../components/RuleCard';
import ProgressBar from '../components/ProgressBar';

const { width } = Dimensions.get('window');

const RulesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentRule, setCurrentRule] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePrevious = () => {
    if (currentRule > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentRule(currentRule - 1);
    }
  };

  const handleNext = () => {
    if (currentRule < rules.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentRule(currentRule + 1);
    }
  };

  const handleRuleSelect = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentRule(index);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={['#000000', '#1a0033', '#330066', '#1a0033', '#000000']}
      style={styles.container}
    >
      <FloatingHearts />
      <SparkleEffects />
      
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>← Volver</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>💕 Nuestras Reglas 💕</Text>
          </View>

          {/* Rules Card */}
          <BlurView intensity={20} style={styles.rulesCard}>
            {/* Navigation */}
            <View style={styles.navigation}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentRule === 0 && styles.navButtonDisabled,
                ]}
                onPress={handlePrevious}
                disabled={currentRule === 0}
                activeOpacity={0.7}
              >
                <Text style={styles.navButtonText}>← Anterior</Text>
              </TouchableOpacity>

              <View style={styles.counter}>
                <Text style={styles.counterText}>
                  Regla {currentRule + 1} de {rules.length}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentRule === rules.length - 1 && styles.navButtonDisabled,
                ]}
                onPress={handleNext}
                disabled={currentRule === rules.length - 1}
                activeOpacity={0.7}
              >
                <Text style={styles.navButtonText}>Siguiente →</Text>
              </TouchableOpacity>
            </View>

            {/* Current Rule */}
            <RuleCard rule={rules[currentRule]} />

            {/* Progress Bar */}
            <ProgressBar current={currentRule + 1} total={rules.length} />

            {/* Rules Grid */}
            <ScrollView
              style={styles.rulesGrid}
              showsVerticalScrollIndicator={false}
            >
              {rules.map((rule, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.ruleItem,
                    index === currentRule && styles.ruleItemActive,
                  ]}
                  onPress={() => handleRuleSelect(index)}
                  activeOpacity={0.8}
                >
                  <View style={styles.ruleItemHeader}>
                    <Text style={styles.ruleItemEmoji}>💖</Text>
                    <Text style={styles.ruleItemTitle}>Regla {index + 1}</Text>
                  </View>
                  <Text style={styles.ruleItemPreview} numberOfLines={3}>
                    {rule}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </BlurView>

          {/* Golden Rule */}
          <LinearGradient
            colors={['#d97706', '#fbbf24', '#f59e0b']}
            style={styles.goldenRule}
          >
            <View style={styles.goldenHeader}>
              <Text style={styles.sparkle}>✨</Text>
              <Text style={styles.goldenTitle}>🌟 Regla de Oro (#30)</Text>
              <Text style={styles.sparkle}>✨</Text>
            </View>
            <Text style={styles.goldenText}>{goldenRule}</Text>
            <View style={styles.goldenHearts}>
              <Text style={styles.heartBounce}>💕</Text>
              <Text style={styles.heartBounce}>💖</Text>
              <Text style={styles.heartBounce}>💝</Text>
              <Text style={styles.heartBounce}>💗</Text>
              <Text style={styles.heartBounce}>💓</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255, 20, 147, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ff1493',
  },
  backButtonText: {
    color: '#ff69b4',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff69b4',
    textShadowColor: '#ff1493',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    flex: 1,
    textAlign: 'center',
    marginRight: 80, // Balance the back button
  },
  rulesCard: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ff1493',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  navButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    minWidth: 80,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  counter: {
    backgroundColor: '#ff1493',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    flex: 1,
  },
  counterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rulesGrid: {
    flex: 1,
    marginTop: 20,
  },
  ruleItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  ruleItemActive: {
    backgroundColor: 'rgba(255, 20, 147, 0.2)',
    borderColor: '#ff69b4',
  },
  ruleItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  ruleItemEmoji: {
    fontSize: 16,
  },
  ruleItemTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ruleItemPreview: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
  },
  goldenRule: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fcd34d',
    shadowColor: '#fcd34d',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  goldenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  sparkle: {
    fontSize: 24,
    textShadowColor: '#fcd34d',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  goldenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
    textShadowColor: '#d97706',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  goldenText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: '#d97706',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  goldenHearts: {
    flexDirection: 'row',
    gap: 12,
  },
  heartBounce: {
    fontSize: 24,
    textShadowColor: '#ff1493',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default RulesScreen;