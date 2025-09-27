import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { firebaseService, Activity, CoupleActivity } from '../lib/firebase';
import FloatingHearts from '../components/FloatingHearts';
import SparkleEffects from '../components/SparkleEffects';

const { width } = Dimensions.get('window');

const categories = [
  { key: 'all', label: 'Todas', emoji: '🎯', color: '#8b5cf6' },
  { key: 'romantic', label: 'Románticas', emoji: '💕', color: '#ff1493' },
  { key: 'fun', label: 'Divertidas', emoji: '🎉', color: '#10b981' },
  { key: 'challenge', label: 'Retos', emoji: '💪', color: '#f59e0b' },
  { key: 'surprise', label: 'Sorpresas', emoji: '🎁', color: '#8b008b' },
];

const difficultyColors = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#dc2626',
};

const ActivitiesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, couple } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [coupleActivities, setCoupleActivities] = useState<CoupleActivity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [rouletteActivity, setRouletteActivity] = useState<Activity | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const spinAnimation = new Animated.Value(0);

  useEffect(() => {
    if (couple?.id) {
      loadData();
    }
  }, [couple?.id]);

  const loadData = async () => {
    if (!couple?.id) return;
    
    try {
      const [activitiesData, coupleActivitiesData] = await Promise.all([
        firebaseService.getActivities(),
        firebaseService.getCoupleActivities(couple.id),
      ]);
      
      setActivities(activitiesData);
      setCoupleActivities(coupleActivitiesData);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar las actividades');
    } finally {
      setLoading(false);
    }
  };

  const spinRoulette = async () => {
    if (isSpinning || !couple?.id) return;
    
    setIsSpinning(true);
    setRouletteActivity(null); // Clear previous result
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Animate the roulette
    Animated.timing(spinAnimation, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
    
    try {
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const randomActivity = await firebaseService.getRandomActivity(category, true, couple.id);
      
      setTimeout(() => {
        setRouletteActivity(randomActivity);
        setIsSpinning(false);
        spinAnimation.setValue(0);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 2000);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo obtener una actividad');
      setIsSpinning(false);
      spinAnimation.setValue(0);
    }
  };

  const acceptActivity = async () => {
    if (!rouletteActivity || !couple?.id) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await firebaseService.addActivityToCouple(couple.id, rouletteActivity.id);
      setRouletteActivity(null);
      loadData();
      Alert.alert('¡Genial!', 'La actividad ha sido añadida a vuestra lista');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo añadir la actividad');
    }
  };

  const completeActivity = async (coupleActivityId: string, rating: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await firebaseService.updateCoupleActivity(coupleActivityId, {
        status: 'completed',
        completed_at: new Date(),
        rating,
      });
      loadData();
      Alert.alert('¡Completada!', '¡Habéis completado la actividad!');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo marcar como completada');
    }
  };

  const filteredActivities = selectedCategory === 'all' 
    ? activities 
    : activities.filter(a => a.category === selectedCategory);

  const spin = spinAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1440deg'],
  });

  const renderActivity = (activity: Activity) => {
    const coupleActivity = coupleActivities.find(ca => ca.activity_id === activity.id);
    const isCompleted = coupleActivity?.status === 'completed';
    
    return (
      <BlurView key={activity.id} intensity={20} style={styles.activityCard}>
        <View style={styles.activityHeader}>
          <View style={styles.activityInfo}>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityMeta}>
              {categories.find(c => c.key === activity.category)?.emoji} {activity.category} • 
              <Text style={[styles.difficulty, { color: difficultyColors[activity.difficulty] }]}>
                {' '}{activity.difficulty}
              </Text> • {activity.duration}
            </Text>
          </View>
          
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✅ Completada</Text>
              {coupleActivity?.rating && (
                <Text style={styles.rating}>
                  {'⭐'.repeat(coupleActivity.rating)}
                </Text>
              )}
            </View>
          )}
        </View>
        
        <Text style={styles.activityDescription}>{activity.description}</Text>
        
        {!isCompleted && coupleActivity && (
          <View style={styles.activityActions}>
            <TouchableOpacity
              style={styles.ratingButton}
              onPress={() => completeActivity(coupleActivity.id, 5)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.ratingGradient}
              >
                <Text style={styles.ratingText}>¡Completada! ⭐⭐⭐⭐⭐</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </BlurView>
    );
  };

  return (
    <LinearGradient
      colors={['#000000', '#1a0033', '#330066', '#1a0033', '#000000']}
      style={styles.container}
    >
      <FloatingHearts />
      <SparkleEffects />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>🎯 Actividades</Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.challengesButton}
              onPress={() => navigation.navigate('Challenges' as never)}
              activeOpacity={0.7}
            >
              <Text style={styles.challengesButtonText}>💪</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.wishlistButton}
              onPress={() => navigation.navigate('Wishlist' as never)}
              activeOpacity={0.7}
            >
              <Text style={styles.wishlistButtonText}>⭐</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Roulette Section */}
          <BlurView intensity={20} style={styles.rouletteSection}>
            <Text style={styles.sectionTitle}>🎰 Ruleta de Actividades</Text>
            
            <Animated.View
              style={[
                styles.rouletteWheel,
                { transform: [{ rotate: spin }] }
              ]}
            >
              <Text style={styles.rouletteEmoji}>🎯</Text>
            </Animated.View>
            
            {rouletteActivity && !isSpinning && (
              <BlurView intensity={10} style={styles.rouletteResult}>
                <Text style={styles.resultTitle}>¡Tu actividad es!</Text>
                <Text style={styles.resultActivity}>{rouletteActivity.title}</Text>
                <Text style={styles.resultDescription}>{rouletteActivity.description}</Text>
                
                <View style={styles.resultActions}>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => setRouletteActivity(null)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.rejectText}>Otra vez</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={acceptActivity}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#10b981', '#059669']}
                      style={styles.acceptGradient}
                    >
                      <Text style={styles.acceptText}>¡Me gusta!</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </BlurView>
            )}
            
            <TouchableOpacity
              style={[styles.spinButton, isSpinning && styles.spinButtonDisabled]}
              onPress={spinRoulette}
              disabled={isSpinning}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isSpinning ? ['#666', '#444'] : ['#ff1493', '#8b008b']}
                style={styles.spinGradient}
              >
                <Text style={styles.spinText}>
                  {isSpinning ? '🎰 Girando...' : '🎰 ¡Girar Ruleta!'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>

          {/* Category Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilter}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.key && styles.categoryButtonActive,
                  { borderColor: category.color }
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(category.key);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={styles.categoryLabel}>{category.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Activities List */}
          <View style={styles.activitiesList}>
            <Text style={styles.sectionTitle}>
              📋 Todas las Actividades ({filteredActivities.length})
            </Text>
            
            {filteredActivities.map(renderActivity)}
          </View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 20, 147, 0.3)',
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
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  challengesButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  challengesButtonText: {
    fontSize: 18,
  },
  wishlistButton: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  wishlistButtonText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  rouletteSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ff1493',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 20,
    textAlign: 'center',
  },
  rouletteWheel: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 20, 147, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#ff1493',
  },
  rouletteEmoji: {
    fontSize: 60,
  },
  rouletteResult: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#10b981',
    alignItems: 'center',
    width: '100%',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 10,
  },
  resultActivity: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultDescription: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 15,
  },
  rejectButton: {
    backgroundColor: 'rgba(107, 114, 128, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  rejectText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  acceptGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  acceptText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spinButton: {
    borderRadius: 25,
    overflow: 'hidden',
    width: '100%',
  },
  spinButtonDisabled: {
    opacity: 0.7,
  },
  spinGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  spinText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryFilter: {
    marginBottom: 20,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(255, 20, 147, 0.3)',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  categoryLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  activitiesList: {
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#374151',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  activityMeta: {
    fontSize: 14,
    color: '#d1d5db',
  },
  difficulty: {
    fontWeight: 'bold',
  },
  completedBadge: {
    alignItems: 'flex-end',
  },
  completedText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: 'bold',
  },
  rating: {
    fontSize: 14,
    marginTop: 2,
  },
  activityDescription: {
    fontSize: 16,
    color: '#f3f4f6',
    lineHeight: 22,
    marginBottom: 15,
  },
  activityActions: {
    alignItems: 'center',
  },
  ratingButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  ratingGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  ratingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ActivitiesScreen;