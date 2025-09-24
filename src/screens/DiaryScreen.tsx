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
import { authService, DiaryEntry } from '../lib/supabase';
import FloatingHearts from '../components/FloatingHearts';

const moods = [
  { emoji: '😊', name: 'happy', label: 'Feliz' },
  { emoji: '😍', name: 'love', label: 'Enamorado' },
  { emoji: '🤩', name: 'excited', label: 'Emocionado' },
  { emoji: '🙏', name: 'grateful', label: 'Agradecido' },
  { emoji: '😌', name: 'peaceful', label: 'En paz' },
  { emoji: '😢', name: 'sad', label: 'Triste' },
  { emoji: '😰', name: 'worried', label: 'Preocupado' },
];

const DiaryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, userProfile, couple } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewEntry, setShowNewEntry] = useState(false);
  
  // New entry form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('happy');

  useEffect(() => {
    if (couple?.id) {
      loadEntries();
    }
  }, [couple?.id]);

  const loadEntries = async () => {
    if (!couple?.id) return;
    
    try {
      const data = await authService.getDiaryEntries(couple.id);
      setEntries(data);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar las entradas del diario');
    } finally {
      setLoading(false);
    }
  };

  const createEntry = async () => {
    if (!title.trim() || !content.trim() || !couple?.id || !user?.id) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await authService.createDiaryEntry(
        couple.id,
        user.id,
        title.trim(),
        content.trim(),
        selectedMood
      );
      
      setTitle('');
      setContent('');
      setSelectedMood('happy');
      setShowNewEntry(false);
      loadEntries();
      
      Alert.alert('¡Éxito!', 'Tu entrada ha sido guardada en el diario');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo guardar la entrada');
    }
  };

  const renderEntry = (entry: DiaryEntry) => {
    const mood = moods.find(m => m.name === entry.mood) || moods[0];
    const isMyEntry = entry.author_id === user?.id;
    
    return (
      <BlurView key={entry.id} intensity={20} style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <View style={styles.entryInfo}>
            <Text style={styles.entryTitle}>{entry.title}</Text>
            <Text style={styles.entryMeta}>
              {mood.emoji} {mood.label} • {entry.author_name} • {' '}
              {new Date(entry.created_at).toLocaleDateString('es-ES')}
            </Text>
          </View>
          {isMyEntry && (
            <View style={styles.myEntryBadge}>
              <Text style={styles.myEntryText}>Mía</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.entryContent}>{entry.content}</Text>
      </BlurView>
    );
  };

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
          
          <Text style={styles.headerTitle}>📖 Nuestro Diario</Text>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowNewEntry(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+ Nueva</Text>
          </TouchableOpacity>
        </View>

        {/* Entries */}
        <ScrollView
          style={styles.entriesList}
          contentContainerStyle={styles.entriesContent}
          showsVerticalScrollIndicator={false}
        >
          {entries.length === 0 ? (
            <BlurView intensity={20} style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyTitle}>Diario vacío</Text>
              <Text style={styles.emptyText}>
                Comienza a escribir vuestros momentos especiales
              </Text>
            </BlurView>
          ) : (
            entries.map(renderEntry)
          )}
        </ScrollView>

        {/* New Entry Modal */}
        <Modal
          visible={showNewEntry}
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
                  onPress={() => setShowNewEntry(false)}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                
                <Text style={styles.modalTitle}>✍️ Nueva Entrada</Text>
                
                <TouchableOpacity
                  onPress={createEntry}
                  style={styles.modalSaveButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#ff1493', '#8b008b']}
                    style={styles.modalSaveGradient}
                  >
                    <Text style={styles.modalSaveText}>Guardar</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                {/* Title */}
                <Text style={styles.fieldLabel}>Título</Text>
                <TextInput
                  style={styles.titleInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="¿Qué pasó hoy?"
                  placeholderTextColor="#999"
                  maxLength={100}
                />

                {/* Mood */}
                <Text style={styles.fieldLabel}>¿Cómo te sientes?</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.moodSelector}
                >
                  {moods.map((mood) => (
                    <TouchableOpacity
                      key={mood.name}
                      style={[
                        styles.moodOption,
                        selectedMood === mood.name && styles.moodOptionSelected
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedMood(mood.name);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                      <Text style={styles.moodLabel}>{mood.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Content */}
                <Text style={styles.fieldLabel}>Cuéntanos más</Text>
                <TextInput
                  style={styles.contentInput}
                  value={content}
                  onChangeText={setContent}
                  placeholder="Escribe sobre vuestro día, sentimientos, planes..."
                  placeholderTextColor="#999"
                  multiline
                  textAlignVertical="top"
                  maxLength={1000}
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
  entriesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  entriesContent: {
    paddingVertical: 20,
  },
  entryCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#374151',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  entryInfo: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  entryMeta: {
    fontSize: 14,
    color: '#d1d5db',
  },
  myEntryBadge: {
    backgroundColor: '#ff1493',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  myEntryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  entryContent: {
    fontSize: 16,
    color: '#f3f4f6',
    lineHeight: 24,
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
  moodSelector: {
    marginBottom: 10,
  },
  moodOption: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#374151',
  },
  moodOptionSelected: {
    backgroundColor: 'rgba(255, 20, 147, 0.3)',
    borderColor: '#ff1493',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  moodLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  contentInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
    height: 150,
  },
});

export default DiaryScreen;