import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { firebaseService } from '../../lib/firebase';

interface MessagesWidgetProps {
  onPress?: () => void;
}

const MessagesWidget: React.FC<MessagesWidgetProps> = ({ onPress }) => {
  const { couple } = useAuth();
  const [messageCount, setMessageCount] = useState(0);
  const [lastMessage, setLastMessage] = useState<string>('');

  useEffect(() => {
    if (couple?.id) {
      loadMessages();
    }
  }, [couple?.id]);

  const loadMessages = async () => {
    if (!couple?.id) return;
    
    try {
      const messages = await firebaseService.getMessages(couple.id, 100);
      setMessageCount(messages.length);
      
      if (messages.length > 0) {
        setLastMessage(messages[0].content);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#8b5cf6', '#7c3aed', '#6d28d9']}
        style={styles.gradient}
      >
        <BlurView intensity={20} style={styles.content}>
          <Text style={styles.emoji}>💬</Text>
          <Text style={styles.number}>{messageCount}</Text>
          <Text style={styles.label}>Mensajes</Text>
          {lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              "{lastMessage}"
            </Text>
          )}
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  gradient: {
    borderRadius: 20,
  },
  content: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
    textShadowColor: '#8b5cf6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  number: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default MessagesWidget;