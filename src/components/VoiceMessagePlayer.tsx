import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

interface VoiceMessagePlayerProps {
  uri: string;
  duration?: number;
  senderName?: string;
  isMyMessage?: boolean;
}

const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  uri,
  duration = 0,
  senderName,
  isMyMessage = false,
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playPauseSound = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        setIsLoading(true);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true }
        );
        
        setSound(newSound);
        setIsPlaying(true);
        
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis || 0);
            
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPosition(0);
            }
          }
        });
        
        setIsLoading(false);
      }
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      Alert.alert('Error', 'No se pudo reproducir la nota de voz');
      setIsLoading(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (position / (duration * 1000)) * 100 : 0;

  return (
    <BlurView intensity={20} style={[
      styles.container,
      isMyMessage ? styles.myMessage : styles.partnerMessage
    ]}>
      <TouchableOpacity
        style={styles.playButton}
        onPress={playPauseSound}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isMyMessage ? ['#ff1493', '#8b008b'] : ['#8b5cf6', '#7c3aed']}
          style={styles.playButtonGradient}
        >
          <Text style={styles.playIcon}>
            {isLoading ? '⏳' : isPlaying ? '⏸️' : '▶️'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.waveformContainer}>
        <View style={styles.waveform}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {formatTime(position)} / {formatTime(duration * 1000)}
          </Text>
        </View>
      </View>

      <View style={styles.voiceIcon}>
        <Text style={styles.voiceEmoji}>🎤</Text>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    minWidth: 200,
  },
  myMessage: {
    backgroundColor: 'rgba(255, 20, 147, 0.3)',
    borderColor: '#ff1493',
  },
  partnerMessage: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: '#8b5cf6',
  },
  playButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  playButtonGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 16,
  },
  waveformContainer: {
    flex: 1,
  },
  waveform: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ff69b4',
    borderRadius: 2,
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'monospace',
  },
  voiceIcon: {
    opacity: 0.6,
  },
  voiceEmoji: {
    fontSize: 16,
  },
});

export default VoiceMessagePlayer;