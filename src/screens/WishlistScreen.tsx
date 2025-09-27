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
import { firebaseService, WishlistItem } from '../lib/firebase';
import FloatingHearts from '../components/FloatingHearts';

const categories = [
  { key: 'travel', label: 'Viajes', emoji: '✈️', color: '#3b82f6' },
  { key: 'experiences', label: 'Experiencias', emoji: '🎭', color: '#8b5cf6' },
  { key: 'gifts', label: 'Regalos', emoji: '🎁', color: '#ff1493' },
  { key: 'goals', label: 'Metas', emoji: '🎯', color: '#10b981' },
  { key: 'general', label: 'General', emoji: '⭐', color: '#f59e0b' },
];

const priorities = [
  { key: 'low', label: 'Baja', color: '#6b7280' },
  { key: 'medium', label: 'Media', color: '#f59e0b' },
  { key: 'high', label: 'Alta', color: '#dc2626' },
  { key: 'urgent', label: 'Urgente', color: '#7c2d12' },
];

const WishlistScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, couple } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewItem, setShowNewItem] = useState(false);
  
  // New item form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'travel' | 'experiences' | 'gifts' | 'goals' | 'general'>('general');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [estimatedCost, setEstimatedCost] = useState('');

  useEffect(() => {
    if (couple?.id) {
      loadWishlistItems();
    }
  }, [couple?.id]);

  const loadWishlistItems = async () => {
    if (!couple?.id) return;
    
    try {
      const data = await firebaseService.getWishlistItems(couple.id);
      setWishlistItems(data);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los elementos de la lista');
    } finally {
      setLoading(false);
    }
  };

  const createWishlistItem = async () => {
    if (!title.trim() || !couple?.id || !user?.id) {
      Alert.alert('Error', 'Por favor completa al menos el título');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const cost = estimatedCost ? parseFloat(estimatedCost) : undefined;
      
      await firebaseService.createWishlistItem(
        couple.id,
        user.id,
        title.trim(),
        description.trim(),
        selectedCategory,
        selectedPriority,
        cost
      );
      
      setTitle('');
      setDescription('');
      setSelectedCategory('general');
      setSelectedPriority('medium');
      setEstimatedCost('');
      setShowNewItem(false);
      loadWishlistItems();
      
      Alert.alert('¡Añadido!', 'El elemento ha sido añadido a vuestra lista de deseos');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo añadir el elemento');
    }
  };

  const toggleCompleted = async (item: WishlistItem) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await firebaseService.updateWishlistItem(item.id, {
        is_completed: !item.is_completed,
        completed_at: !item.is_completed ? new Date() : undefined,
      });
      
      loadWishlistItems();
      
      if (!item.is_completed) {
        Alert.alert('¡Conseguido!', '¡Habéis conseguido este deseo! 🎉');
      }
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo actualizar el elemento');
    }
  };

  const deleteItem = async (itemId: string) => {
    Alert.alert(
      'Eliminar elemento',
      '¿Estás seguro de que quieres eliminar este elemento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              await firebaseService.deleteWishlistItem(itemId);
              loadWishlistItems();
            } catch (error: any) {
              Alert.alert('Error', 'No se pudo eliminar el elemento');
            }
          },
        },
      ]
    );
  };

  const renderWishlistItem = (item: WishlistItem) => {
    const category = categories.find(c => c.key === item.category) || categories[4];
    const priority = priorities.find(p => p.key === item.priority) || priorities[1];
    const isMyItem = item.added_by === user?.id;
    
    return (
      <BlurView key={item.id} intensity={20} style={[
        styles.itemCard,
        item.is_completed && styles.completedCard
      ]}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemTitle, item.is_completed && styles.completedText]}>
              {item.title}
            </Text>
            <View style={styles.itemMeta}>
              <Text style={styles.categoryTag}>
                {category.emoji} {category.label}
              </Text>
              <Text style={[styles.priorityTag, { color: priority.color }]}>
                {priority.label}
              </Text>
              {isMyItem && (
                <Text style={styles.ownerTag}>Mío</Text>
              )}
            </View>
          </View>
          
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={[
                styles.completeButton,
                item.is_completed ? styles.completedButton : styles.pendingButton
              ]}
              onPress={() => toggleCompleted(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.completeButtonText}>
                {item.is_completed ? '✅' : '⭕'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteItem(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {item.description && (
          <Text style={[styles.itemDescription, item.is_completed && styles.completedText]}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.itemFooter}>
          {item.estimated_cost && (
            <Text style={styles.costText}>
              💰 €{item.estimated_cost.toFixed(2)}
            </Text>
          )}
          
          {item.is_completed && item.completed_at && (
            <Text style={styles.completedDate}>
              ✅ Conseguido el {new Date(item.completed_at).toLocaleDateString('es-ES')}
            </Text>
          )}
        </View>
      </BlurView>
    );
  };

  const pendingItems = wishlistItems.filter(item => !item.is_completed);
  const completedItems = wishlistItems.filter(item => item.is_completed);

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
          
          <Text style={styles.headerTitle}>⭐ Lista de Deseos</Text>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowNewItem(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+ Deseo</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Pending Items */}
          {pendingItems.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>🌟 Deseos Pendientes ({pendingItems.length})</Text>
              {pendingItems.map(renderWishlistItem)}
            </>
          )}

          {/* Completed Items */}
          {completedItems.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>✅ Deseos Conseguidos ({completedItems.length})</Text>
              {completedItems.map(renderWishlistItem)}
            </>
          )}

          {wishlistItems.length === 0 && (
            <BlurView intensity={20} style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>⭐</Text>
              <Text style={styles.emptyTitle}>Lista vacía</Text>
              <Text style={styles.emptyText}>
                ¡Añade vuestros primeros deseos y metas como pareja!
              </Text>
            </BlurView>
          )}
        </ScrollView>

        {/* New Item Modal */}
        <Modal
          visible={showNewItem}
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
                  onPress={() => setShowNewItem(false)}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                
                <Text style={styles.modalTitle}>⭐ Nuevo Deseo</Text>
                
                <TouchableOpacity
                  onPress={createWishlistItem}
                  style={styles.modalSaveButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#ff1493', '#8b008b']}
                    style={styles.modalSaveGradient}
                  >
                    <Text style={styles.modalSaveText}>Añadir</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                {/* Title */}
                <Text style={styles.fieldLabel}>¿Qué deseáis?</Text>
                <TextInput
                  style={styles.titleInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Ej: Viaje a París, Casa nueva..."
                  placeholderTextColor="#999"
                  maxLength={100}
                />

                {/* Category */}
                <Text style={styles.fieldLabel}>Categoría</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.categorySelector}
                >
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.key}
                      style={[
                        styles.categoryOption,
                        selectedCategory === category.key && styles.categoryOptionSelected,
                        { borderColor: category.color }
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedCategory(category.key as any);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                      <Text style={styles.categoryLabel}>{category.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Priority */}
                <Text style={styles.fieldLabel}>Prioridad</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.prioritySelector}
                >
                  {priorities.map((priority) => (
                    <TouchableOpacity
                      key={priority.key}
                      style={[
                        styles.priorityOption,
                        selectedPriority === priority.key && styles.priorityOptionSelected,
                        { borderColor: priority.color }
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedPriority(priority.key as any);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.priorityLabel, { color: priority.color }]}>
                        {priority.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Estimated Cost */}
                <Text style={styles.fieldLabel}>Coste estimado (opcional)</Text>
                <TextInput
                  style={styles.costInput}
                  value={estimatedCost}
                  onChangeText={setEstimatedCost}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />

                {/* Description */}
                <Text style={styles.fieldLabel}>Descripción (opcional)</Text>
                <TextInput
                  style={styles.descriptionInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Detalles adicionales sobre este deseo..."
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
  itemCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#374151',
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10b981',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  itemMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    fontSize: 12,
    color: '#d1d5db',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priorityTag: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ownerTag: {
    fontSize: 12,
    color: '#ff69b4',
    backgroundColor: 'rgba(255, 20, 147, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontWeight: 'bold',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  completeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingButton: {
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
  },
  completedButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  completeButtonText: {
    fontSize: 18,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(220, 38, 38, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
  },
  itemDescription: {
    fontSize: 16,
    color: '#f3f4f6',
    lineHeight: 22,
    marginBottom: 10,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costText: {
    fontSize: 14,
    color: '#fbbf24',
    fontWeight: 'bold',
  },
  completedDate: {
    fontSize: 12,
    color: '#10b981',
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
  categorySelector: {
    marginBottom: 10,
  },
  categoryOption: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
  },
  categoryOptionSelected: {
    backgroundColor: 'rgba(255, 20, 147, 0.3)',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  categoryLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  prioritySelector: {
    marginBottom: 10,
  },
  priorityOption: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
  },
  priorityOptionSelected: {
    backgroundColor: 'rgba(255, 20, 147, 0.3)',
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  costInput: {
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

export default WishlistScreen;