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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import FloatingHearts from '../components/FloatingHearts';

interface DailyQuestion {
  id: string;
  question: string;
  date: string;
  myAnswer?: string;
  partnerAnswer?: string;
  bothAnswered: boolean;
}

const sampleQuestions = [
  "¿Cuál es tu recuerdo favorito de nosotros?",
  "¿Qué es lo que más admiras de tu pareja?",
  "¿Cuál sería nuestro destino de viaje ideal?",
  "¿Qué canción describe mejor nuestra relación?",
  "¿Cuál es tu momento favorito del día con tu pareja?",
  "¿Qué tradición te gustaría crear juntos?",
  "¿Cuál es tu forma favorita de demostrar amor?",
  "¿Qué sueño compartido te emociona más?",
];

const DailyQuestionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, couple } = useAuth();
  const [todayQuestion, setTodayQuestion] = useState<DailyQuestion | null>(null);
  const [myAnswer, setMyAnswer] = useState('');
  const [previousQuestions, setPreviousQuestions] = useState<DailyQuestion[]>([]);

  useEffect(() => {
    loadTodayQuestion();
    loadPreviousQuestions();
  }, []);

  const loadTodayQuestion = () => {
    // Simular pregunta del día
    const today = new Date().toDateString();
    const questionIndex = new Date().getDate() % sampleQuestions.length;
    
    setTodayQuestion({
      id: today,
      question: sampleQuestions[questionIndex],
      date: today,
      myAnswer: '',
      partnerAnswer: '',
      bothAnswered: false,
    });
  };

  const loadPreviousQuestions = () => {
    // Simular preguntas anteriores
    const questions: DailyQuestion[] = [];
    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const questionIndex = (date.getDate()) % sampleQuestions.length;
      
      questions.push({
        id: date.toDateString(),
        question: sampleQuestions[questionIndex],
        date: date.toDateString(),
        myAnswer: i <= 3 ? "Mi respuesta de ejemplo" : undefined,
        partnerAnswer: i <= 3 ? "Respuesta de mi pareja" : undefined,
        bothAnswered: i <= 3,
      });
    }
    setPreviousQuestions(questions);
  };

  const submitAnswer = () => {
    if (!myAnswer.trim()) {
      Alert.alert('Error', 'Por favor escribe tu respuesta');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simular envío de respuesta
    Alert.alert(
      '¡Respuesta enviada!', 
      'Tu pareja recibirá una notificación. Podrás ver su respuesta cuando ambos hayan contestado.'
    );
    
    setMyAnswer('');
  };

  const renderPreviousQuestion = (question: DailyQuestion) => (
    <BlurView key={question.id} intensity={20} style={styles.questionCard}>
      <Text style={styles.questionText}>{question.question}</Text>
      <Text style={styles.questionDate}>
        {new Date(question.date).toLocaleDateString('es-ES')}
      </Text>
      
      {question.bothAnswered ? (
        <View style={styles.answersContainer}>
          <View style={styles.answerSection}>
            <Text style={styles.answerLabel}>Tu respuesta:</Text>
            <Text style={styles.answerText}>{question.myAnswer}</Text>
          </View>
          
          <View style={styles.answerSection}>
            <Text style={styles.answerLabel}>Respuesta de tu pareja:</Text>
            <Text style={styles.answerText}>{question.partnerAnswer}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingText}>
            ⏳ Esperando que ambos respondan
          </Text>
        </View>
      )}
    </BlurView>
  );

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
          
          <Text style={styles.headerTitle}>❓ Pregunta del Día</Text>
          
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Today's Question */}
          {todayQuestion && (
            <BlurView intensity={20} style={styles.todayQuestionCard}>
              <View style={styles.todayHeader}>
                <Text style={styles.todayTitle}>💫 Pregunta de Hoy</Text>
                <Text style={styles.todayDate}>
                  {new Date().toLocaleDateString('es-ES')}
                </Text>
              </View>
              
              <Text style={styles.todayQuestionText}>{todayQuestion.question}</Text>
              
              <View style={styles.answerInputContainer}>
                <TextInput
                  style={styles.answerInput}
                  value={myAnswer}
                  onChangeText={setMyAnswer}
                  placeholder="Escribe tu respuesta aquí..."
                  placeholderTextColor="#999"
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                />
                
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={submitAnswer}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#ff1493', '#8b008b']}
                    style={styles.submitGradient}
                  >
                    <Text style={styles.submitText}>💕 Enviar Respuesta</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>
          )}

          {/* Previous Questions */}
          <View style={styles.previousSection}>
            <Text style={styles.sectionTitle}>📚 Preguntas Anteriores</Text>
            
            {previousQuestions.length === 0 ? (
              <BlurView intensity={20} style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>❓</Text>
                <Text style={styles.emptyTitle}>Sin preguntas anteriores</Text>
                <Text style={styles.emptyText}>
                  Las preguntas que hayáis respondido aparecerán aquí
                </Text>
              </BlurView>
            ) : (
              previousQuestions.map(renderPreviousQuestion)
            )}
          </View>
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
  todayQuestionCard: {
    backgroundColor: 'rgba(255, 20, 147, 0.2)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#ff1493',
  },
  todayHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  todayTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 5,
  },
  todayDate: {
    fontSize: 14,
    color: '#d1d5db',
  },
  todayQuestionText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 26,
    fontWeight: '500',
  },
  answerInputContainer: {
    gap: 15,
  },
  answerInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
    height: 100,
  },
  submitButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  previousSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 20,
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#374151',
  },
  questionText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
    fontWeight: '500',
  },
  questionDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 15,
  },
  answersContainer: {
    gap: 15,
  },
  answerSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 12,
  },
  answerLabel: {
    fontSize: 14,
    color: '#ff69b4',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  answerText: {
    fontSize: 14,
    color: '#f3f4f6',
    lineHeight: 20,
  },
  waitingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  waitingText: {
    fontSize: 14,
    color: '#fbbf24',
    fontStyle: 'italic',
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
});

export default DailyQuestionsScreen;