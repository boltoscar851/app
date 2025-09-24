import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

interface StickerPickerProps {
  visible: boolean;
  onClose: () => void;
  onStickerSelect: (sticker: string) => void;
}

const stickerCategories = [
  {
    name: 'Amor',
    emoji: '💕',
    stickers: ['💕', '💖', '💗', '💓', '💘', '💝', '💞', '💟', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '❣️', '💋', '😍', '🥰', '😘', '😗', '☺️', '😊']
  },
  {
    name: 'Felicidad',
    emoji: '😊',
    stickers: ['😊', '😄', '😃', '😀', '😁', '😆', '😂', '🤣', '🥲', '☺️', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '🤗', '🤩', '🥳', '😋']
  },
  {
    name: 'Animales',
    emoji: '🐱',
    stickers: ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥']
  },
  {
    name: 'Comida',
    emoji: '🍕',
    stickers: ['🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🥗', '🍿', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌶️', '🥕']
  },
  {
    name: 'Actividades',
    emoji: '🎉',
    stickers: ['🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁', '🍾', '🥂', '🍻', '🍺', '🍷', '🥃', '🍸', '🍹', '🍶', '☕', '🍵', '🧃', '🥤', '🧋', '🍼', '🍯', '🍪']
  },
  {
    name: 'Naturaleza',
    emoji: '🌸',
    stickers: ['🌸', '🌺', '🌻', '🌷', '🌹', '🥀', '🌾', '🌿', '🍀', '🍃', '🌱', '🌲', '🌳', '🌴', '🌵', '🌶️', '🍄', '🌰', '🌍', '🌎', '🌏', '🌕', '🌖', '🌗', '🌘']
  }
];

const StickerPicker: React.FC<StickerPickerProps> = ({
  visible,
  onClose,
  onStickerSelect,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState(0);

  const handleStickerSelect = (sticker: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStickerSelect(sticker);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
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
            
            <Text style={styles.title}>💕 Stickers Románticos</Text>
            
            <View style={styles.headerSpacer} />
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
            contentContainerStyle={styles.categoryTabsContent}
          >
            {stickerCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryTab,
                  selectedCategory === index && styles.categoryTabActive
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(index);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Stickers Grid */}
          <ScrollView
            style={styles.stickersContainer}
            contentContainerStyle={styles.stickersContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.stickersGrid}>
              {stickerCategories[selectedCategory].stickers.map((sticker, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.stickerButton}
                  onPress={() => handleStickerSelect(sticker)}
                  activeOpacity={0.7}
                >
                  <BlurView intensity={20} style={styles.stickerBlur}>
                    <Text style={styles.stickerText}>{sticker}</Text>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 20, 147, 0.3)',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff69b4',
    textShadowColor: '#ff1493',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerSpacer: {
    width: 40,
  },
  categoryTabs: {
    paddingVertical: 15,
  },
  categoryTabsContent: {
    paddingHorizontal: 20,
  },
  categoryTab: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#374151',
  },
  categoryTabActive: {
    backgroundColor: 'rgba(255, 20, 147, 0.3)',
    borderColor: '#ff1493',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  categoryName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  stickersContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stickersContent: {
    paddingVertical: 10,
  },
  stickersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stickerButton: {
    width: '18%',
    aspectRatio: 1,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  stickerBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  stickerText: {
    fontSize: 28,
  },
});

export default StickerPicker;