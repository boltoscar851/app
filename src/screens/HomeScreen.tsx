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
import DaysTogetherWidget from '../components/widgets/DaysTogetherWidget';
import NextEventWidget from '../components/widgets/NextEventWidget';
import MessagesWidget from '../components/widgets/MessagesWidget';
import PhotosWidget from '../components/widgets/PhotosWidget';
import DistanceWidget from '../components/widgets/DistanceWidget';
import ActivitiesWidget from '../components/widgets/ActivitiesWidget';
import DiaryWidget from '../components/widgets/DiaryWidget';
import WishlistWidget from '../components/widgets/WishlistWidget';
import SurpriseRouletteModal from '../components/SurpriseRouletteModal';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, userProfile, couple } = useAuth();
  const [showSurpriseRoulette, setShowSurpriseRoulette] = useState(false);

  return (
    <LinearGradient
      colors={['#000000', '#1a0033', '#330066', '#1a0033', '#000000']}
      style={styles.container}
    >
      <FloatingHearts />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💕 Nuestro Amor 💕</Text>
          <Text style={styles.headerSubtitle}>
            {couple?.name || 'Bienvenidos'}
          </Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Widget - Days Together */}
          <View style={styles.mainWidget}>
            <DaysTogetherWidget />
          </View>

          {/* Secondary Widgets Grid */}
          <View style={styles.widgetsGrid}>
            <NextEventWidget onPress={() => navigation.navigate('Calendar' as never)} />
            <MessagesWidget onPress={() => navigation.navigate('Chat' as never)} />
            <PhotosWidget onPress={() => navigation.navigate('Gallery' as never)} />
            <DistanceWidget />
            <ActivitiesWidget onPress={() => navigation.navigate('Activities' as never)} />
            <DiaryWidget onPress={() => navigation.navigate('Diary' as never)} />
            <WishlistWidget onPress={() => navigation.navigate('Wishlist' as never)} />
            
            {/* Surprise Widget */}
            <TouchableOpacity
              style={styles.surpriseWidget}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowSurpriseRoulette(true);
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#8b008b', '#ff1493']}
                style={styles.surpriseGradient}
              >
                <BlurView intensity={20} style={styles.surpriseContent}>
                  <Text style={styles.surpriseEmoji}>🎁</Text>
                  <Text style={styles.surpriseLabel}>Sorpresa</Text>
                  <Text style={styles.surpriseSubtitle}>¡Ruleta secreta!</Text>
                </BlurView>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <BlurView intensity={20} style={styles.quickActions}>
            <Text style={styles.quickActionsTitle}>🚀 Acciones Rápidas</Text>
            
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Rules' as never)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#ff1493', '#8b008b']}
                  style={styles.actionGradient}
                >
                  <Text style={styles.actionEmoji}>💖</Text>
                  <Text style={styles.actionText}>Reglas</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('DailyQuestions' as never)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#3b82f6', '#1d4ed8']}
                  style={styles.actionGradient}
                >
                  <Text style={styles.actionEmoji}>❓</Text>
                  <Text style={styles.actionText}>Pregunta</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Counters' as never)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.actionGradient}
                >
                  <Text style={styles.actionEmoji}>📊</Text>
                  <Text style={styles.actionText}>Contadores</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
        </ScrollView>
      </SafeAreaView>

      {/* Surprise Roulette Modal */}
      <SurpriseRouletteModal
        visible={showSurpriseRoulette}
        onClose={() => setShowSurpriseRoulette(false)}
      />
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 20, 147, 0.3)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff69b4',
    textShadowColor: '#ff1493',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginTop: 5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  mainWidget: {
    marginBottom: 25,
  },
  widgetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  surpriseWidget: {
    width: (width - 50) / 2,
    height: 120,
    marginBottom: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  surpriseGradient: {
    flex: 1,
  },
  surpriseContent: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  surpriseEmoji: {
    fontSize: 28,
    marginBottom: 5,
    textShadowColor: '#8b008b',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  surpriseLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  surpriseSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  quickActions: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff69b4',
    textAlign: 'center',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 15,
    overflow: 'hidden',
  },
  actionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default HomeScreen;

    fontSize: 16,
    lineHeight: 22,
    marginBottom: 5,
  },
  messageTime: {
    color: '#d1d5db',
    fontSize: 12,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 20, 147, 0.3)',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#374151',
  },
  sendButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 20,
  },
});

export default ChatScreen;