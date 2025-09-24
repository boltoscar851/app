import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { authService, Event } from '../../lib/supabase';

interface NextEventWidgetProps {
  onPress?: () => void;
}

const NextEventWidget: React.FC<NextEventWidgetProps> = ({ onPress }) => {
  const { couple } = useAuth();
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [daysUntil, setDaysUntil] = useState(0);

  useEffect(() => {
    if (couple?.id) {
      loadNextEvent();
    }
  }, [couple?.id]);

  const loadNextEvent = async () => {
    if (!couple?.id) return;
    
    try {
      const events = await authService.getEvents(couple.id);
      const upcomingEvents = events.filter(e => new Date(e.date) >= new Date());
      
      if (upcomingEvents.length > 0) {
        const next = upcomingEvents[0];
        setNextEvent(next);
        
        const eventDate = new Date(next.date);
        const now = new Date();
        const diffTime = eventDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysUntil(diffDays);
      }
    } catch (error) {
      console.error('Error loading next event:', error);
    }
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getEventEmoji = (type: string) => {
    switch (type) {
      case 'anniversary': return '💕';
      case 'date': return '🌹';
      case 'special': return '✨';
      case 'reminder': return '⏰';
      default: return '📅';
    }
  };

  if (!nextEvent) {
    return (
      <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
        <LinearGradient
          colors={['#6b7280', '#4b5563']}
          style={styles.gradient}
        >
          <BlurView intensity={20} style={styles.content}>
            <Text style={styles.emoji}>📅</Text>
            <Text style={styles.noEventText}>Sin eventos</Text>
            <Text style={styles.subtitle}>Crea uno nuevo</Text>
          </BlurView>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#fbbf24', '#f59e0b', '#d97706']}
        style={styles.gradient}
      >
        <BlurView intensity={20} style={styles.content}>
          <Text style={styles.emoji}>{getEventEmoji(nextEvent.type)}</Text>
          <Text style={styles.number}>{daysUntil}</Text>
          <Text style={styles.label}>
            {daysUntil === 0 ? '¡Hoy!' : daysUntil === 1 ? 'Día restante' : 'Días restantes'}
          </Text>
          <Text style={styles.eventTitle} numberOfLines={1}>{nextEvent.title}</Text>
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#fbbf24',
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
    textShadowColor: '#fbbf24',
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
  eventTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  noEventText: {
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

export default NextEventWidget;