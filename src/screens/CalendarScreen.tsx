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
import { authService, Event } from '../lib/supabase';
import FloatingHearts from '../components/FloatingHearts';

const eventTypes = [
  { type: 'anniversary', emoji: '💕', label: 'Aniversario', color: '#ff1493' },
  { type: 'date', emoji: '🌹', label: 'Cita', color: '#8b5cf6' },
  { type: 'special', emoji: '✨', label: 'Especial', color: '#fbbf24' },
  { type: 'reminder', emoji: '⏰', label: 'Recordatorio', color: '#10b981' },
];

const CalendarScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, userProfile, couple } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewEvent, setShowNewEvent] = useState(false);
  
  // New event form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [selectedType, setSelectedType] = useState<'anniversary' | 'date' | 'special' | 'reminder'>('date');

  useEffect(() => {
    if (couple?.id) {
      loadEvents();
    }
  }, [couple?.id]);

  const loadEvents = async () => {
    if (!couple?.id) return;
    
    try {
      const data = await authService.getEvents(couple.id);
      setEvents(data);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    if (!title.trim() || !date.trim() || !couple?.id || !user?.id) {
      Alert.alert('Error', 'Por favor completa el título y la fecha');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await authService.createEvent(
        couple.id,
        user.id,
        title.trim(),
        description.trim(),
        date,
        selectedType
      );
      
      setTitle('');
      setDescription('');
      setDate('');
      setSelectedType('date');
      setShowNewEvent(false);
      loadEvents();
      
      Alert.alert('¡Éxito!', 'El evento ha sido creado');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo crear el evento');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays === -1) return 'Ayer';
    if (diffDays > 0) return `En ${diffDays} días`;
    return `Hace ${Math.abs(diffDays)} días`;
  };

  const renderEvent = (event: Event) => {
    const eventType = eventTypes.find(t => t.type === event.type) || eventTypes[1];
    const isUpcoming = new Date(event.date) >= new Date();
    
    return (
      <BlurView key={event.id} intensity={20} style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <View style={styles.eventTypeContainer}>
            <Text style={styles.eventEmoji}>{eventType.emoji}</Text>
            <View>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={[styles.eventType, { color: eventType.color }]}>
                {eventType.label}
              </Text>
            </View>
          </View>
          
          <View style={styles.eventDateContainer}>
            <Text style={styles.eventDate}>
              {new Date(event.date).toLocaleDateString('es-ES')}
            </Text>
            <Text style={[
              styles.eventCountdown,
              isUpcoming ? styles.upcomingEvent : styles.pastEvent
            ]}>
              {formatDate(event.date)}
            </Text>
          </View>
        </View>
        
        {event.description && (
          <Text style={styles.eventDescription}>{event.description}</Text>
        )}
      </BlurView>
    );
  };

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.date) < new Date());

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
          
          <Text style={styles.headerTitle}>📅 Nuestro Calendario</Text>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowNewEvent(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+ Evento</Text>
          </TouchableOpacity>
        </View>

        {/* Events */}
        <ScrollView
          style={styles.eventsList}
          contentContainerStyle={styles.eventsContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>🔮 Próximos Eventos</Text>
              {upcomingEvents.map(renderEvent)}
            </>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>📚 Eventos Pasados</Text>
              {pastEvents.map(renderEvent)}
            </>
          )}

          {events.length === 0 && (
            <BlurView intensity={20} style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={styles.emptyTitle}>Sin eventos</Text>
              <Text style={styles.emptyText}>
                Crea vuestro primer evento especial
              </Text>
            </BlurView>
          )}
        </ScrollView>

        {/* New Event Modal */}
        <Modal
          visible={showNewEvent}
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
                  onPress={() => setShowNewEvent(false)}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                
                <Text style={styles.modalTitle}>📅 Nuevo Evento</Text>
                
                <TouchableOpacity
                  onPress={createEvent}
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
                {/* Title */}
                <Text style={styles.fieldLabel}>Título del evento</Text>
                <TextInput
                  style={styles.titleInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Ej: Cena romántica, Aniversario..."
                  placeholderTextColor="#999"
                  maxLength={100}
                />

                {/* Type */}
                <Text style={styles.fieldLabel}>Tipo de evento</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.typeSelector}
                >
                  {eventTypes.map((type) => (
                    <TouchableOpacity
                      key={type.type}
                      style={[
                        styles.typeOption,
                        selectedType === type.type && styles.typeOptionSelected,
                        { borderColor: type.color }
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedType(type.type as any);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.typeEmoji}>{type.emoji}</Text>
                      <Text style={styles.typeLabel}>{type.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Date */}
                <Text style={styles.fieldLabel}>Fecha (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.dateInput}
                  value={date}
                  onChangeText={setDate}
                  placeholder="2024-12-25"
                  placeholderTextColor="#999"
                />

                {/* Description */}
                <Text style={styles.fieldLabel}>Descripción (opcional)</Text>
                <TextInput
                  style={styles.descriptionInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Detalles adicionales del evento..."
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
  eventsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventsContent: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 15,
    marginTop: 10,
  },
  eventCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#374151',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  eventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  eventEmoji: {
    fontSize: 24,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  eventType: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventDateContainer: {
    alignItems: 'flex-end',
  },
  eventDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  eventCountdown: {
    fontSize: 12,
    fontWeight: '600',
  },
  upcomingEvent: {
    color: '#10b981',
  },
  pastEvent: {
    color: '#6b7280',
  },
  eventDescription: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
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
  typeSelector: {
    marginBottom: 10,
  },
  typeOption: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
  },
  typeOptionSelected: {
    backgroundColor: 'rgba(255, 20, 147, 0.3)',
  },
  typeEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  typeLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  dateInput: {
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
    height: 100,
  },
});

export default CalendarScreen;