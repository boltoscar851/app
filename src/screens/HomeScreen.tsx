import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import FloatingHearts from '../components/FloatingHearts';
import SparkleEffects from '../components/SparkleEffects';
import SurpriseRouletteModal from '../components/SurpriseRouletteModal';

// Widgets
import DaysTogetherWidget from '../components/widgets/DaysTogetherWidget';
import NextEventWidget from '../components/widgets/NextEventWidget';
import MessagesWidget from '../components/widgets/MessagesWidget';
import PhotosWidget from '../components/widgets/PhotosWidget';
import DistanceWidget from '../components/widgets/DistanceWidget';
import ActivitiesWidget from '../components/widgets/ActivitiesWidget';
import DiaryWidget from '../components/widgets/DiaryWidget';
import WishlistWidget from '../components/widgets/WishlistWidget';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userProfile, couple } = useAuth();
  const [showSurpriseRoulette, setShowSurpriseRoulette] = useState(false);

  const quickActions = [
    {
      title: 'Nuestras Reglas',
      emoji: '💕',
      color: ['#ff1493', '#8b008b'],
      onPress: () => navigation.navigate('Rules' as never),
    },
    {
      title: 'Pregunta del Día',
      emoji: '❓',
      color: ['#8b5cf6', '#7c3aed'],
      onPress: () => navigation.navigate('DailyQuestions' as never),
    },
    {
      title: 'Contadores',
      emoji: '📊',
      color: ['#10b981', '#059669'],
      onPress: () => navigation.navigate('Counters' as never),
    },
    {
      title: 'Sorpresa Secreta',
      emoji: '🎁',
      color: ['#f59e0b', '#d97706'],
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setShowSurpriseRoulette(true);
      },
    },
  ];

  return (
    <LinearGradient
      colors={['#000000', '#1a0033', '#330066', '#1a0033', '#000000']}
      style={styles.container}
    >
      <FloatingHearts />
      <SparkleEffects />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>
              ¡Hola, {userProfile?.display_name || 'mi amor'}! 💕
            </Text>
            <Text style={styles.coupleText}>
              {couple?.name || 'Nuestro Amor'}
            </Text>
          </View>

          {/* Main Widget - Days Together */}
          <View style={styles.mainWidget}>
            <DaysTogetherWidget />
          </View>

          {/* Secondary Widgets Grid */}
          <View style={styles.widgetsGrid}>
            <View style={styles.widgetRow}>
              <View style={styles.widgetHalf}>
                <NextEventWidget onPress={() => navigation.navigate('Calendar' as never)} />
              </View>
              <View style={styles.widgetHalf}>
                <MessagesWidget onPress={() => navigation.navigate('Chat' as never)} />
              </View>
            </View>
            
            <View style={styles.widgetRow}>
              <View style={styles.widgetHalf}>
                <PhotosWidget onPress={() => navigation.navigate('Gallery' as never)} />
              </View>
              <View style={styles.widgetHalf}>
                <DistanceWidget />
              </View>
            </View>
            
            <View style={styles.widgetRow}>
              <View style={styles.widgetHalf}>
                <ActivitiesWidget onPress={() => navigation.navigate('Activities' as never)} />
              </View>
              <View style={styles.widgetHalf}>
                <DiaryWidget onPress={() => navigation.navigate('Diary' as never)} />
              </View>
            </View>
            
            <View style={styles.widgetRow}>
              <View style={styles.widgetHalf}>
                <WishlistWidget onPress={() => navigation.navigate('Activities' as never, { screen: 'Wishlist' })} />
              </View>
              <View style={styles.widgetHalf}>
                {/* Placeholder for future widget */}
                <TouchableOpacity style={styles.placeholderWidget} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#6b7280', '#4b5563']}
                    style={styles.placeholderGradient}
                  >
                    <BlurView intensity={20} style={styles.placeholderContent}>
                      <Text style={styles.placeholderEmoji}>🔮</Text>
                      <Text style={styles.placeholderText}>Próximamente</Text>
                    </BlurView>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>
            
            <View style={styles.actionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.actionCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    action.onPress();
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={action.color}
                    style={styles.actionGradient}
                  >
                    <BlurView intensity={20} style={styles.actionContent}>
                      <Text style={styles.actionEmoji}>{action.emoji}</Text>
                      <Text style={styles.actionTitle}>{action.title}</Text>
                    </BlurView>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Love Quote */}
          <BlurView intensity={20} style={styles.loveQuote}>
            <Text style={styles.quoteEmoji}>💖</Text>
            <Text style={styles.quoteText}>
              "El amor verdadero no es perfecto, es real"
            </Text>
            <Text style={styles.quoteAuthor}>- Nuestro Amor</Text>
          </BlurView>
        </ScrollView>

        {/* Surprise Roulette Modal */}
        <SurpriseRouletteModal
          visible={showSurpriseRoulette}
          onClose={() => setShowSurpriseRoulette(false)}
        />
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff69b4',
    textAlign: 'center',
    textShadowColor: '#ff1493',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: 8,
  },
  coupleText: {
    fontSize: 18,
    color: '#fbbf24',
    fontWeight: '600',
    textAlign: 'center',
  },
  mainWidget: {
    marginBottom: 25,
  },
  widgetsGrid: {
    marginBottom: 30,
  },
  widgetRow: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 15,
  },
  widgetHalf: {
    flex: 1,
  },
  placeholderWidget: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 120,
  },
  placeholderGradient: {
    flex: 1,
  },
  placeholderContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  placeholderEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  quickActions: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: '#ff1493',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 55) / 2,
    height: 100,
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionGradient: {
    flex: 1,
  },
  actionContent: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  actionEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  loveQuote: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
    marginBottom: 20,
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

export default HomeScreen;