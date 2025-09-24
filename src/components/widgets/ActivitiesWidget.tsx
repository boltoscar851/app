import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../lib/supabase';

interface ActivitiesWidgetProps {
  onPress?: () => void;
}

const ActivitiesWidget: React.FC<ActivitiesWidgetProps> = ({ onPress }) => {
  const { couple } = useAuth();
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (couple?.id) {
      loadActivitiesStats();
    }
  }, [couple?.id]);

  const loadActivitiesStats = async () => {
    if (!couple?.id) return;
    
    try {
      const activities = await authService.getCoupleActivities(couple.id);
      const completed = activities.filter(a => a.status === 'completed').length;
      const pending = activities.filter(a => a.status === 'pending').length;
      
      setCompletedCount(completed);
      setPendingCount(pending);
    } catch (error) {
      console.error('Error loading activities stats:', error);
    }
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8', '#1e40af']}
        style={styles.gradient}
      >
        <BlurView intensity={20} style={styles.content}>
          <Text style={styles.emoji}>🎯</Text>
          <View style={styles.stats}>
            <Text style={styles.completedNumber}>{completedCount}</Text>
            <Text style={styles.separator}>|</Text>
            <Text style={styles.pendingNumber}>{pendingCount}</Text>
          </View>
          <Text style={styles.label}>Actividades</Text>
          <Text style={styles.subtitle}>Hechas | Pendientes</Text>
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  gradient: {
    borderRadius: 20,
  },
  content: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
    textShadowColor: '#3b82f6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  completedNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  separator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 8,
  },
  pendingNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fbbf24',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default ActivitiesWidget;