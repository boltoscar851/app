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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { authService, Message } from '../lib/supabase';
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

const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, userProfile, couple } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [showSurpriseRoulette, setShowSurpriseRoulette] = useState(false);

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

  const sendMessage = async () => {
    if (!newMessage.trim() || !couple?.id || !user?.id) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await authService.sendMessage(couple.id, user.id, newMessage.trim());
      setNewMessage('');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.partnerMessage
      ]}>
        <BlurView 
          intensity={20} 
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myBubble : styles.partnerBubble
          ]}
        >
          <Text style={styles.messageText}>{item.content}</Text>
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

          {/* Input */}
          <BlurView intensity={20} style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Escribe un mensaje de amor..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                !newMessage.trim() && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
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
          </BlurView>
        </KeyboardAvoidingView>
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
  messageText: {
    color: 'white',
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