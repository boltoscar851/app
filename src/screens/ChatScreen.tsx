import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { authService, Message } from '../lib/supabase';
import FloatingHearts from '../components/FloatingHearts';
import StickerPicker from '../components/StickerPicker';
import VoiceNoteRecorder from '../components/VoiceNoteRecorder';
import VoiceMessagePlayer from '../components/VoiceMessagePlayer';

const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, userProfile, couple } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showStickers, setShowStickers] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (couple?.id) {
      loadMessages();
      
      // Suscribirse a mensajes en tiempo real
      const subscription = authService.subscribeToMessages(couple.id, (payload) => {
        if (payload.new) {
          const newMsg = payload.new as Message;
          setMessages(prev => [newMsg, ...prev]);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [couple?.id]);

  const loadMessages = async () => {
    if (!couple?.id) return;
    
    try {
      const data = await authService.getMessages(couple.id);
      setMessages(data);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los mensajes');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, messageType: 'text' | 'image' | 'sticker' = 'text') => {
    if (!content.trim() || !couple?.id || !user?.id) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await authService.sendMessage(couple.id, user.id, content.trim(), messageType);
      if (messageType === 'text') {
        setNewMessage('');
      }
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    }
  };

  const sendSticker = (sticker: string) => {
    sendMessage(sticker, 'sticker');
  };

  const sendVoiceNote = (uri: string) => {
    // En una implementación real, subirías el archivo de audio a un servicio de almacenamiento
    // y enviarías la URL. Por ahora, simularemos con un mensaje de texto
    sendMessage(`🎤 Nota de voz: ${uri}`, 'text');
    setShowVoiceRecorder(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === user?.id;
    
    // Check if it's a voice message
    if (item.content.startsWith('🎤 Nota de voz:')) {
      const uri = item.content.replace('🎤 Nota de voz: ', '');
      return (
        <View style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.partnerMessage
        ]}>
          <VoiceMessagePlayer
            uri={uri}
            duration={30} // Simulated duration
            senderName={item.sender_name}
            isMyMessage={isMyMessage}
          />
        </View>
      );
    }
    
    // Check if it's a sticker
    const isSticker = item.message_type === 'sticker' || 
                     (item.content.length <= 2 && /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(item.content));
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.partnerMessage
      ]}>
        <BlurView 
          intensity={20} 
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myBubble : styles.partnerBubble,
            isSticker && styles.stickerBubble
          ]}
        >
          <Text style={[
            styles.messageText,
            isSticker && styles.stickerText
          ]}>
            {item.content}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(item.created_at).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </BlurView>
      </View>
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
          
          <Text style={styles.headerTitle}>💕 Chat Privado</Text>
          
          <View style={styles.headerRight}>
            <Text style={styles.coupleStatus}>🟢 En línea</Text>
          </View>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatContainer}
        >
          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            inverted
            showsVerticalScrollIndicator={false}
          />

          {/* Input Container */}
          <BlurView intensity={20} style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Escribe un mensaje de amor..."
                placeholderTextColor="#999"
                multiline
                maxLength={500}
              />
              
              <View style={styles.inputActions}>
                {/* Voice Note Button */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowVoiceRecorder(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionButtonText}>🎤</Text>
                </TouchableOpacity>
                
                {/* Sticker Button */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowStickers(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionButtonText}>😊</Text>
                </TouchableOpacity>
                
                {/* Send Button */}
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    !newMessage.trim() && styles.sendButtonDisabled
                  ]}
                  onPress={() => sendMessage(newMessage)}
                  disabled={!newMessage.trim()}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={newMessage.trim() ? ['#ff1493', '#8b008b'] : ['#666', '#444']}
                    style={styles.sendButtonGradient}
                  >
                    <Text style={styles.sendButtonText}>💕</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </KeyboardAvoidingView>

        {/* Voice Recorder Modal */}
        <Modal
          visible={showVoiceRecorder}
          animationType="fade"
          transparent
          onRequestClose={() => setShowVoiceRecorder(false)}
        >
          <View style={styles.modalOverlay}>
            <VoiceNoteRecorder
              onRecordingComplete={sendVoiceNote}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          </View>
        </Modal>

        {/* Sticker Picker */}
        <StickerPicker
          visible={showStickers}
          onClose={() => setShowStickers(false)}
          onStickerSelect={sendSticker}
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
  headerRight: {
    alignItems: 'flex-end',
  },
  coupleStatus: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingVertical: 20,
  },
  messageContainer: {
    marginBottom: 15,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  partnerMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
  },
  myBubble: {
    backgroundColor: 'rgba(255, 20, 147, 0.3)',
    borderColor: '#ff1493',
  },
  partnerBubble: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: '#8b5cf6',
  },
  stickerBubble: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    padding: 8,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 5,
  },
  stickerText: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 0,
  },
  messageTime: {
    color: '#d1d5db',
    fontSize: 12,
    textAlign: 'right',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 20, 147, 0.3)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
  inputActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  actionButtonText: {
    fontSize: 18,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});

export default ChatScreen;