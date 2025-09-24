import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { authService, WeeklyChallenge } from '../lib/supabase';
import FloatingHearts from '../components/FloatingHearts';

const predefinedChallenges = [
  {
    title: '7 días sin redes sociales',
    description: 'Pasen una semana completa sin usar redes sociales, enfocándose solo en su relación.',
  },
  {
    title: 'Una cita diferente cada día',
    description: 'Durante 7 días, tengan una cita diferente cada día, puede ser en casa o fuera.',
  },
  {
    title: 'Expresar gratitud diariamente',
    description: 'Cada día, díganle al otro una cosa específica por la que están agradecidos.',
  },
  {
    title: 'Cocinar juntos toda la semana',
    description: 'Preparen todas sus comidas juntos durante una semana completa.',
  },
  {
    title: 'Ejercicio en pareja',
    description: 'Hagan ejercicio juntos todos los días durante una semana.',
  },
  {
    title: 'Aprender algo nuevo juntos',
    description: 'Dediquen tiempo cada día a aprender una nueva habilidad o hobby juntos.',
  },
];

const ChallengesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, couple } = useAuth();
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewChallenge, setShowNewChallenge] = useState(false);
  const [showPredefined, setShowPredefined] = useState(false);
  
  // New challenge form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (couple?.id) {
      loadChallenges();
    }
  }, [couple?.id]);

  const loadChallenges = async () => {
    if (!couple?.id) return;
    
    try {
      const data = await authService.getWeeklyChallenges(couple.id);
      setChallenges(data);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los retos');
    } finally {
      setLoading(false);
    }
  };

  const createChallenge = async (challengeTitle: string, challengeDescription: string) => {
    if (!couple?.id) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await authService.createWeeklyChallenge(couple.id, challengeTitle, challengeDescription);
      
      setTitle('');
      setDescription('');
      setShowNewChallenge(false);
      setShowPredefined(false);
      loadChallenges();
      
      Alert.alert('¡Reto creado!', 'Vuestro nuevo reto semanal ha sido creado');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo crear el reto');
    }
  };

  const completeChallenge = async (challengeId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await authService.updateWeeklyChallenge(challengeId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
      
      loadChallenges();
      Alert.alert('¡Felicidades!', '¡Habéis completado el reto semanal! 🎉');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo marcar como completado');
    }
  };

  const getWeekString = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.toLocaleDateString('es-ES')} - ${end.toLocaleDateString('es-ES')}`;
  };

  const renderChallenge = (challenge: WeeklyChallenge) => {
    const isCompleted = challenge.status === 'completed';
    const isActive = challenge.status === 'active';
    
    return (
      <BlurView key={challenge.id} intensity={20} style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={styles.challengeMeta}>
              📅 {getWeekString(challenge.week_start)}
            </Text>
          </View>
          
          <View style={[
            styles.statusBadge,
            isCompleted ? styles.completedBadge : 
            isActive ? styles.activeBadge : styles.expiredBadge
          ]}>
            <Text style={styles.statusText}>
              {isCompleted ? '✅ Completado' : 
               isActive ? '🔥 Activo' : '⏰ Expirado'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.challengeDescription}>{challenge.description}</Text>
        
        {isActive && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => completeChallenge(challenge.id)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.completeGradient}
            >
              <Text style={styles.completeText}>🏆 ¡Completado!</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        
        {isCompleted && challenge.completed_at && (
          <Text style={styles.completedDate}>
            Completado el {new Date(challenge.completed_at).toLocaleDateString('es-ES')}
          </Text>
        )}
      </BlurView>
    );
  };

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  return (
    <LinearGradient
      colors={['#000000', '#1a0033', '#330066', '#1a0033', '#000000']}
      style={styles.container}
    >
      <FloatingHearts />
      
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
          
          <Text style={styles.headerTitle}>💪 Retos Semanales</Text>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowPredefined(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+ Reto</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Active Challenges */}
          {activeChallenges.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>🔥 Retos Activos</Text>
              {activeChallenges.map(renderChallenge)}
            </>
          )}

          {/* Completed Challenges */}
          {completedChallenges.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>🏆 Retos Completados</Text>
              {completedChallenges.map(renderChallenge)}
            </>
          )}

          {challenges.length === 0 && (
            <BlurView intensity={20} style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>💪</Text>
              <Text style={styles.emptyTitle}>Sin retos</Text>
              <Text style={styles.emptyText}>
                ¡Crea vuestro primer reto semanal para fortalecer vuestra relación!
              </Text>
            </BlurView>
          )}
        </ScrollView>

        {/* Predefined Challenges Modal */}
        <Modal
          visible={showPredefined}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <LinearGradient
            colors={['#000000', '#1a0033', '#330066']}
            style={styles.modalContainer}
          >
            <SafeAreaView style={styles.modalSafeArea}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setShowPredefined(false)}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                
                <Text style={styles.modalTitle}>💪 Elegir Reto</Text>
                
                <TouchableOpacity
                  onPress={() => {
                    setShowPredefined(false);
                    setShowNewChallenge(true);
                  }}
                  style={styles.customButton}
                >
                  <Text style={styles.customButtonText}>Personalizado</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <Text style={styles.modalSubtitle}>Retos Predefinidos</Text>
                
                {predefinedChallenges.map((challenge, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.predefinedChallenge}
                    onPress={() => createChallenge(challenge.title, challenge.description)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.predefinedTitle}>{challenge.title}</Text>
                    <Text style={styles.predefinedDescription}>{challenge.description}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>

        {/* Custom Challenge Modal */}
        <Modal
          visible={showNewChallenge}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <LinearGradient
            colors={['#000000', '#1a0033', '#330066']}
            style={styles.modalContainer}
          >
            <SafeAreaView style={styles.modalSafeArea}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setShowNewChallenge(false)}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                
                <Text style={styles.modalTitle}>✍️ Reto Personalizado</Text>
                
                <TouchableOpacity
                  onPress={() => {
                    if (title.trim() && description.trim()) {
                      createChallenge(title.trim(), description.trim());
                    } else {
                      Alert.alert('Error', 'Por favor completa todos los campos');
                    }
                  }}
                  style={styles.modalSaveButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#ff1493', '#8b008b']}
                    style={styles.modalSaveGradient}
                  >
                    <Text style={styles.modalSaveText}>Crear</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <Text style={styles.fieldLabel}>Título del reto</Text>
                <TextInput
                  style={styles.titleInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Ej: Una semana de aventuras"
                  placeholderTextColor="#999"
                  maxLength={100}
                />

                <Text style={styles.fieldLabel}>Descripción del reto</Text>
                <TextInput
                  style={styles.descriptionInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe qué deben hacer durante la semana..."
                  placeholderTextColor="#999"
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                />
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>
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
  addButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  addButtonText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 15,
    marginTop: 10,
  },
  challengeCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#374151',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  challengeMeta: {
    fontSize: 14,
    color: '#d1d5db',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  activeBadge: {
    backgroundColor: '#f59e0b',
  },
  completedBadge: {
    backgroundColor: '#10b981',
  },
  expiredBadge: {
    backgroundColor: '#6b7280',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  challengeDescription: {
    fontSize: 16,
    color: '#f3f4f6',
    lineHeight: 22,
    marginBottom: 15,
  },
  completeButton: {
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  completeGradient: {
    paddingHorizontal: 25,
    paddingVertical: 12,
  },
  completeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedDate: {
    fontSize: 14,
    color: '#10b981',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 20, 147, 0.3)',
  },
  modalCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalCancelText: {
    color: '#ff69b4',
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff69b4',
  },
  customButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  customButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalSaveGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalSaveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 20,
    textAlign: 'center',
  },
  predefinedChallenge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#374151',
  },
  predefinedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  predefinedDescription: {
    fontSize: 16,
    color: '#d1d5db',
    lineHeight: 22,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 10,
    marginTop: 20,
  },
  titleInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  descriptionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
    height: 120,
  },
});

export default ChallengesScreen;