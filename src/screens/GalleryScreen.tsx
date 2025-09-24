import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import FloatingHearts from '../components/FloatingHearts';

const { width } = Dimensions.get('window');

interface GalleryItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
  title: string;
  folder: string;
  isFavorite: boolean;
  uploadedBy: string;
  createdAt: string;
}

const folders = [
  { key: 'all', label: 'Todas', emoji: '📱', color: '#8b5cf6' },
  { key: 'dates', label: 'Citas', emoji: '💕', color: '#ff1493' },
  { key: 'trips', label: 'Viajes', emoji: '✈️', color: '#3b82f6' },
  { key: 'special', label: 'Especiales', emoji: '✨', color: '#fbbf24' },
  { key: 'everyday', label: 'Día a día', emoji: '🌸', color: '#10b981' },
];

const GalleryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, couple } = useAuth();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const filteredItems = selectedFolder === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.folder === selectedFolder);

  const renderGalleryItem = (item: GalleryItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.galleryItem}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedImage(item);
      }}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.url }} style={styles.galleryImage} />
      {item.isFavorite && (
        <View style={styles.favoriteIcon}>
          <Text style={styles.favoriteText}>❤️</Text>
        </View>
      )}
      <View style={styles.itemOverlay}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
      </View>
    </TouchableOpacity>
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
          
          <Text style={styles.headerTitle}>📸 Nuestra Galería</Text>
          
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Próximamente', 'La función de subir fotos estará disponible pronto');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.uploadButtonText}>+ Foto</Text>
          </TouchableOpacity>
        </View>

        {/* Folder Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.folderFilter}
          contentContainerStyle={styles.folderContent}
        >
          {folders.map((folder) => (
            <TouchableOpacity
              key={folder.key}
              style={[
                styles.folderButton,
                selectedFolder === folder.key && styles.folderButtonActive,
                { borderColor: folder.color }
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedFolder(folder.key);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.folderEmoji}>{folder.emoji}</Text>
              <Text style={styles.folderLabel}>{folder.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Gallery Grid */}
        <ScrollView
          style={styles.galleryContainer}
          contentContainerStyle={styles.galleryContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredItems.length === 0 ? (
            <BlurView intensity={20} style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📸</Text>
              <Text style={styles.emptyTitle}>Galería vacía</Text>
              <Text style={styles.emptyText}>
                Comenzad a crear recuerdos juntos subiendo vuestras primeras fotos
              </Text>
            </BlurView>
          ) : (
            <View style={styles.galleryGrid}>
              {filteredItems.map(renderGalleryItem)}
            </View>
          )}
        </ScrollView>

        {/* Image Viewer Modal */}
        <Modal
          visible={!!selectedImage}
          animationType="fade"
          presentationStyle="overFullScreen"
          onRequestClose={() => setSelectedImage(null)}
        >
          {selectedImage && (
            <View style={styles.imageViewerContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedImage(null)}
                activeOpacity={0.8}
              >
                <BlurView intensity={20} style={styles.closeButtonBlur}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </BlurView>
              </TouchableOpacity>
              
              <Image 
                source={{ uri: selectedImage.url }} 
                style={styles.fullImage}
                resizeMode="contain"
              />
              
              <BlurView intensity={20} style={styles.imageInfo}>
                <Text style={styles.imageTitle}>{selectedImage.title}</Text>
                <Text style={styles.imageDate}>
                  {new Date(selectedImage.createdAt).toLocaleDateString('es-ES')}
                </Text>
              </BlurView>
            </View>
          )}
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
  uploadButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  uploadButtonText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
  },
  folderFilter: {
    paddingVertical: 15,
  },
  folderContent: {
    paddingHorizontal: 20,
  },
  folderButton: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
  },
  folderButtonActive: {
    backgroundColor: 'rgba(255, 20, 147, 0.3)',
  },
  folderEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  folderLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  galleryContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  galleryContent: {
    paddingVertical: 10,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  galleryItem: {
    width: (width - 50) / 2,
    height: 150,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  favoriteText: {
    fontSize: 16,
  },
  itemOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  itemTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
    marginTop: 50,
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
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  closeButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  fullImage: {
    width: width,
    height: '70%',
  },
  imageInfo: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    borderRadius: 15,
    padding: 15,
  },
  imageTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  imageDate: {
    color: '#d1d5db',
    fontSize: 14,
  },
});

export default GalleryScreen;