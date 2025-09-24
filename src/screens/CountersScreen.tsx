import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import FloatingHearts from '../components/FloatingHearts';
import SparkleEffects from '../components/SparkleEffects';

const { width } = Dimensions.get('window');

interface Counter {
  id: string;
  title: string;
  emoji: string;
  startDate: string;
  color: string[];
  type: 'days' | 'distance' | 'events';
  value?: number;
}

const CountersScreen: React.FC = () => {
  const navigation = useNavigation();
  const { couple } = useAuth();
  const [counters, setCounters] = useState<Counter[]>([]);

  useEffect(() => {
    loadCounters();
  }, [couple]);

  const loadCounters = () => {
    // Simular contadores basados en la pareja
    const coupleStartDate = couple?.created_at || new Date().toISOString();
    
    const defaultCounters: Counter[] = [
      {
        id: '1',
        title: 'Días Juntos',
        emoji: '💕',
        startDate: coupleStartDate,
        color: ['#ff1493', '#8b008b'],
        type: 'days',
      },
      {
        id: '2',
        title: 'Próximo Aniversario',
        emoji: '🎉',
        startDate: getNextAnniversary(coupleStartDate),
        color: ['#fbbf24', '#f59e0b'],
        type: 'days',
      },
      {
        id: '3',
        title: 'Mensajes Enviados',
        emoji: '💬',
        startDate: coupleStartDate,
        color: ['#8b5cf6', '#7c3aed'],
        type: 'events',
        value: 1247, // Simulated
      },
      {
        id: '4',
        title: 'Fotos Compartidas',
        emoji: '📸',
        startDate: coupleStartDate,
        color: ['#10b981', '#059669'],
        type: 'events',
        value: 89, // Simulated
      },
      {
        id: '5',
        title: 'Actividades Completadas',
        emoji: '🎯',
        startDate: coupleStartDate,
        color: ['#3b82f6', '#1d4ed8'],
        type: 'events',
        value: 23, // Simulated
      },
    ];

    setCounters(defaultCounters);
  };

  const getNextAnniversary = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const thisYear = now.getFullYear();
    
    let anniversary = new Date(thisYear, start.getMonth(), start.getDate());
    
    // Si ya pasó este año, usar el próximo año
    if (anniversary < now) {
      anniversary = new Date(thisYear + 1, start.getMonth(), start.getDate());
    }
    
    return anniversary.toISOString();
  };

  const calculateDays = (startDate: string, isCountdown: boolean = false) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = isCountdown ? start.getTime() - now.getTime() : now.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.abs(diffDays);
  };

  const renderCounter = (counter: Counter) => {
    let displayValue: string;
    let subtitle: string;

    switch (counter.type) {
      case 'days':
        if (counter.title.includes('Próximo')) {
          const days = calculateDays(counter.startDate, true);
          displayValue = days.toString();
          subtitle = days === 1 ? 'día restante' : 'días restantes';
        } else {
          const days = calculateDays(counter.startDate);
          displayValue = days.toString();
          subtitle = days === 1 ? 'día juntos' : 'días juntos';
        }
        break;
      case 'events':
        displayValue = counter.value?.toString() || '0';
        subtitle = 'total';
        break;
      default:
        displayValue = '0';
        subtitle = '';
    }

    return (
      <TouchableOpacity
        key={counter.id}
        style={styles.counterCard}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={counter.color}
          style={styles.counterGradient}
        >
          <BlurView intensity={20} style={styles.counterContent}>
            <Text style={styles.counterEmoji}>{counter.emoji}</Text>
            <Text style={styles.counterValue}>{displayValue}</Text>
            <Text style={styles.counterSubtitle}>{subtitle}</Text>
            <Text style={styles.counterTitle}>{counter.title}</Text>
          </BlurView>
        </LinearGradient>
      </TouchableOpacity>
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
          
          <Text style={styles.headerTitle}>📊 Nuestros Contadores</Text>
          
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Counter - Days Together */}
          <BlurView intensity={20} style={styles.mainCounter}>
            <LinearGradient
              colors={['#ff1493', '#8b008b', '#ff69b4']}
              style={styles.mainCounterGradient}
            >
              <Text style={styles.mainCounterEmoji}>💕</Text>
              <Text style={styles.mainCounterValue}>
                {calculateDays(couple?.created_at || new Date().toISOString())}
              </Text>
              <Text style={styles.mainCounterLabel}>Días de Amor Eterno</Text>
              <Text style={styles.mainCounterSubtext}>
                Desde {new Date(couple?.created_at || new Date()).toLocaleDateString('es-ES')}
              </Text>
            </LinearGradient>
          </BlurView>

          {/* Counters Grid */}
          <View style={styles.countersGrid}>
            {counters.slice(1).map(renderCounter)}
          </View>

          {/* Love Quote */}
          <BlurView intensity={20} style={styles.quoteCard}>
            <Text style={styles.quoteEmoji}>💖</Text>
            <Text style={styles.quoteText}>
              "Cada día contigo es un nuevo capítulo en nuestra historia de amor"
            </Text>
            <Text style={styles.quoteAuthor}>- Nuestro Amor</Text>
          </BlurView>
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
  },
  headerSpacer: {
    width: 80,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  mainCounter: {
    borderRadius: 25,
    marginBottom: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ff1493',
  },
  mainCounterGradient: {
    padding: 30,
    alignItems: 'center',
  },
  mainCounterEmoji: {
    fontSize: 50,
    marginBottom: 15,
    textShadowColor: '#ff1493',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  mainCounterValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  mainCounterLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  mainCounterSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  countersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  counterCard: {
    width: (width - 50) / 2,
    height: 140,
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  counterGradient: {
    flex: 1,
  },
  counterContent: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  counterValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  counterSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  counterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  quoteCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  quoteEmoji: {
    fontSize: 40,
    marginBottom: 15,
  },
  quoteText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#fbbf24',
    fontWeight: 'bold',
  },
});

export default CountersScreen;