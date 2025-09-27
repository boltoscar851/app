import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../contexts/AuthContext';
import { firebaseService, Activity } from '../lib/firebase';

interface SurpriseRouletteModalProps {
  visible: boolean;
  onClose: () => void;
}

const surpriseEmojis = ['🎁', '💝', '🎉', '✨', '🌟', '💫', '🎊', '🎈'];

const SurpriseRouletteModal: React.FC<SurpriseRouletteModalProps> = ({
  visible,
  onClose,
}) => {
  const { couple } = useAuth();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showResult, setShowResult] = useState(false);
  const spinAnimation = new Animated.Value(0);

  const spinSurpriseRoulette = async () => {
    if (isSpinning || !couple?.id) return;
    
    setIsSpinning(true);
    setSelectedActivity(null);
    setShowResult(false);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Animate the roulette
    Animated.timing(spinAnimation, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true,
    }).start();
    
    try {
      const randomActivity = await firebaseService.getRandomActivity('surprise', true, couple.id);
      
      setTimeout(() => {
        setSelectedActivity(randomActivity);
        setShowResult(true);
        setIsSpinning(false);
        spinAnimation.setValue(0);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 3000);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo obtener una sorpresa');
      setIsSpinning(false);
      spinAnimation.setValue(0);
    }
  };

  const acceptSurprise = async () => {
    if (!selectedActivity || !couple?.id) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await firebaseService.addActivityToCouple(couple.id, selectedActivity.id);
      
      Alert.alert(
        '¡Sorpresa aceptada!', 
        'La sorpresa ha sido añadida a vuestra lista de actividades',
        [{ text: 'Genial', onPress: onClose }]
      );
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo añadir la sorpresa');
    }
  };

  const spin = spinAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '2160deg'],
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={['#000000', '#1a0033', '#330066']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            
            <Text style={styles.title}>🎁 Ruleta Sorpresa</Text>
            
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>
              ¡Solo tú verás el resultado! Tu pareja recibirá una notificación misteriosa 😉
            </Text>

            {/* Surprise Roulette Wheel */}
            <View style={styles.rouletteContainer}>
              <Animated.View
                style={[
                  styles.rouletteWheel,
                  { transform: [{ rotate: spin }] }
                ]}
              >
                <View style={styles.emojiGrid}>
                  {surpriseEmojis.map((emoji, index) => (
                    <Text key={index} style={styles.surpriseEmoji}>
                      {emoji}
                    </Text>
                  ))}
                </View>
              </Animated.View>
              
              <View style={styles.roulettePointer}>
                <Text style={styles.pointerText}>👆</Text>
              </View>
            </View>

            {/* Result */}
            {showResult && selectedActivity && (
              <BlurView intensity={20} style={styles.resultContainer}>
                <Text style={styles.resultTitle}>¡Tu sorpresa secreta!</Text>
                <Text style={styles.resultActivity}>{selectedActivity.title}</Text>
                <Text style={styles.resultDescription}>{selectedActivity.description}</Text>
                
                <View style={styles.resultActions}>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => {
                      setShowResult(false);
                      setSelectedActivity(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.rejectText}>Otra sorpresa</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={acceptSurprise}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#ff1493', '#8b008b']}
                      style={styles.acceptGradient}
                    >
                      <Text style={styles.acceptText}>¡Acepto la sorpresa!</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </BlurView>
            )}

            {/* Spin Button */}
            {!showResult && (
              <TouchableOpacity
                style={[styles.spinButton, isSpinning && styles.spinButtonDisabled]}
                onPress={spinSurpriseRoulette}
                disabled={isSpinning}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isSpinning ? ['#666', '#444'] : ['#8b008b', '#ff1493']}
                  style={styles.spinGradient}
                >
                  <Text style={styles.spinText}>
                    {isSpinning ? '🎰 Preparando sorpresa...' : '🎁 ¡Sorpréndeme!'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
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
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff69b4',
    textShadowColor: '#ff1493',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  rouletteContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  rouletteWheel: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(139, 0, 139, 0.3)',
    borderWidth: 4,
    borderColor: '#8b008b',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8b008b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    height: '80%',
  },
  surpriseEmoji: {
    fontSize: 24,
    margin: 8,
  },
  roulettePointer: {
    position: 'absolute',
    top: -10,
  },
  pointerText: {
    fontSize: 30,
    textShadowColor: '#ffd700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  resultContainer: {
    backgroundColor: 'rgba(139, 0, 139, 0.2)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#8b008b',
    alignItems: 'center',
    width: '100%',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 15,
    textAlign: 'center',
  },
  resultActivity: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  resultDescription: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 15,
  },
  rejectButton: {
    backgroundColor: 'rgba(107, 114, 128, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  rejectText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  acceptGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  acceptText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spinButton: {
    borderRadius: 30,
    overflow: 'hidden',
    width: '80%',
  },
  spinButtonDisabled: {
    opacity: 0.7,
  },
  spinGradient: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  spinText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SurpriseRouletteModal;