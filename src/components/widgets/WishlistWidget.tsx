import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../lib/supabase';

interface WishlistWidgetProps {
  onPress?: () => void;
}

const WishlistWidget: React.FC<WishlistWidgetProps> = ({ onPress }) => {
  const { couple } = useAuth();
  const [totalWishes, setTotalWishes] = useState(0);
  const [completedWishes, setCompletedWishes] = useState(0);

  useEffect(() => {
    if (couple?.id) {
      loadWishlistStats();
    }
  }, [couple?.id]);

  const loadWishlistStats = async () => {
    if (!couple?.id) return;
    
    try {
      const items = await authService.getWishlistItems(couple.id);
      const completed = items.filter(item => item.is_completed).length;
      
      setTotalWishes(items.length);
      setCompletedWishes(completed);
    } catch (error) {
      console.error('Error loading wishlist stats:', error);
    }
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getProgressPercentage = () => {
    if (totalWishes === 0) return 0;
    return Math.round((completedWishes / totalWishes) * 100);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#ec4899', '#db2777', '#be185d']}
        style={styles.gradient}
      >
        <BlurView intensity={20} style={styles.content}>
          <Text style={styles.emoji}>⭐</Text>
          <View style={styles.stats}>
            <Text style={styles.completedNumber}>{completedWishes}</Text>
            <Text style={styles.separator}>/</Text>
            <Text style={styles.totalNumber}>{totalWishes}</Text>
          </View>
          <Text style={styles.label}>Deseos</Text>
          <Text style={styles.subtitle}>{getProgressPercentage()}% logrados</Text>
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#ec4899',
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
    textShadowColor: '#ec4899',
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
    marginHorizontal: 4,
  },
  totalNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
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

export default WishlistWidget;