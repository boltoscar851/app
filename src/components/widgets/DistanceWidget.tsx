import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useAuth } from '../../contexts/AuthContext';

interface DistanceWidgetProps {
  onPress?: () => void;
}

const DistanceWidget: React.FC<DistanceWidgetProps> = ({ onPress }) => {
  const { userProfile } = useAuth();
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateDistance();
  }, []);

  const calculateDistance = async () => {
    try {
      // Simular distancia (en una implementación real, obtendrías las ubicaciones reales)
      // Por ahora, generamos una distancia aleatoria para demostración
      const simulatedDistance = Math.floor(Math.random() * 50) + 1;
      setDistance(simulatedDistance);
    } catch (error) {
      console.error('Error calculating distance:', error);
      setDistance(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getDistanceText = () => {
    if (loading) return 'Calculando...';
    if (distance === null) return 'Sin datos';
    if (distance === 0) return 'Juntos ❤️';
    if (distance < 1) return `${(distance * 1000).toFixed(0)}m`;
    return `${distance.toFixed(1)}km`;
  };

  const getDistanceColor = () => {
    if (distance === null || distance === 0) return ['#10b981', '#059669'];
    if (distance < 5) return ['#fbbf24', '#f59e0b'];
    return ['#ef4444', '#dc2626'];
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <LinearGradient
        colors={getDistanceColor()}
        style={styles.gradient}
      >
        <BlurView intensity={20} style={styles.content}>
          <Text style={styles.emoji}>📍</Text>
          <Text style={styles.distance}>{getDistanceText()}</Text>
          <Text style={styles.label}>Distancia</Text>
          <Text style={styles.subtitle}>Entre nosotros</Text>
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
  distance: {
    fontSize: 24,
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

export default DistanceWidget;