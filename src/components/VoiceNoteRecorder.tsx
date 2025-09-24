import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

interface VoiceNoteRecorderProps {
  onRecordingComplete: (uri: string) => void;
  onCancel: () => void;
}

const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  onRecordingComplete,
  onCancel,
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        const permission = await requestPermission();
        if (permission.status !== 'granted') {
          Alert.alert('Permiso requerido', 'Necesitamos acceso al micrófono para grabar notas de voz');
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      Alert.alert('Error', 'No se pudo iniciar la grabación');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      const uri = recording.getURI();
      if (uri) {
        onRecordingComplete(uri);
      }
      
      setRecording(null);
      setRecordingDuration(0);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      Alert.alert('Error', 'No se pudo completar la grabación');
    }
  };

  const cancelRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
      } catch (error) {
        console.error('Error canceling recording:', error);
      }
    }
    
    setRecording(null);
    setIsRecording(false);
    setRecordingDuration(0);
    onCancel();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (Platform.OS === 'web') {
    return (
      <BlurView intensity={20} style={styles.container}>
        <Text style={styles.webMessage}>
          Las notas de voz no están disponibles en la versión web
        </Text>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cerrar</Text>
        </TouchableOpacity>
      </BlurView>
    );
  }

  return (
    <BlurView intensity={20} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎤 Nota de Voz</Text>
        
        {isRecording && (
          <View style={styles.recordingInfo}>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Grabando...</Text>
            </View>
            <Text style={styles.duration}>{formatDuration(recordingDuration)}</Text>
          </View>
        )}

        <View style={styles.controls}>
          {!isRecording ? (
            <TouchableOpacity
              style={styles.recordButton}
              onPress={startRecording}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#dc2626', '#991b1b']}
                style={styles.recordGradient}
              >
                <Text style={styles.recordIcon}>🎤</Text>
                <Text style={styles.recordText}>Grabar</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.recordingControls}>
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopRecording}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.stopGradient}
                >
                  <Text style={styles.stopIcon}>⏹️</Text>
                  <Text style={styles.stopText}>Enviar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={cancelRecording}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff1493',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 20,
  },
  recordingInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#dc2626',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  duration: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'monospace',
  },
  controls: {
    marginBottom: 20,
  },
  recordButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  recordGradient: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  recordIcon: {
    fontSize: 24,
  },
  recordText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recordingControls: {
    flexDirection: 'row',
    gap: 15,
  },
  stopButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  stopGradient: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  stopIcon: {
    fontSize: 20,
  },
  stopText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'rgba(107, 114, 128, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cancelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  webMessage: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
});

export default VoiceNoteRecorder;