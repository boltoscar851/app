import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../lib/supabase';

interface DiaryWidgetProps {
  onPress?: () => void;
}

const DiaryWidget: React.FC<DiaryWidgetProps> = ({ onPress }) => {
  const { couple } = useAuth();
  const [entryCount, setEntryCount] = useState(0);
  const [lastEntryDate, setLastEntryDate] = useState<string>('');

  useEffect(() => {
    if (couple?.id) {
      loadDiaryStats();
    }
  }, [couple?.id]);

  const loadDiaryStats = async () => {
    if (!couple?.id) return;
    
    try {
      const entries = await authService.getDiaryEntries(couple.id, 50);
      setEntryCount(entries.length);
      
      if (entries.length > 0) {
        const lastDate = new Date(entries[0].created_at);
        const today = new Date();
        const diffTime = today.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          setLastEntryDate('Hoy');
        } else if (diffDays === 1) {
          setLastEntryDate('Ayer');
        } else {
          setLastEntryDate(`Hace ${diffDays} días`);
        }
      } else {
        setLastEntryDate('Sin entradas');
      }
    } catch (error) {
      console.error('Error loading diary stats:', error);
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
        colors={['#f59e0b', '#d97706', '#b45309']}
        style={styles.gradient}
      >
        <BlurView intensity={20} style={styles.content}>
          <Text style={styles.emoji}>📖</Text>
          <Text style={styles.number}>{entryCount}</Text>
          <Text style={styles.label}>Entradas</Text>
          <Text style={styles.subtitle}>{lastEntryDate}</Text>
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#f59e0b',
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
    textShadowColor: '#f59e0b',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  number: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
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

export default DiaryWidget;