import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../contexts/AuthContext';
import FloatingHearts from '../components/FloatingHearts';
import SparkleEffects from '../components/SparkleEffects';

const { width } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const { user, userProfile, couple, signOut, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.display_name || '');

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await signOut();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Error al cerrar sesión');
            }
          },
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Aquí implementarías la actualización del perfil
      // Por ahora solo simulamos
      setIsEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al actualizar el perfil');
    }
  };

  return (
    <LinearGradient
      colors={['#000000', '#1a0033', '#330066', '#1a0033', '#000000']}
      style={styles.container}
    >
      <FloatingHearts />
      <SparkleEffects />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>👤 Mi Perfil</Text>
          </View>

          {/* Profile Card */}
          <BlurView intensity={20} style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {userProfile?.display_name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
            </View>

            <View style={styles.profileInfo}>
              {isEditing ? (
                <TextInput
                  style={styles.nameInput}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Tu nombre"
                  placeholderTextColor="#999"
                />
              ) : (
                <Text style={styles.userName}>{userProfile?.display_name || 'Sin nombre'}</Text>
              )}
              
              <Text style={styles.userEmail}>{user?.email}</Text>
              
              {couple && (
                <View style={styles.coupleInfo}>
                  <Text style={styles.coupleLabel}>💕 Pareja:</Text>
                  <Text style={styles.coupleName}>{couple.name}</Text>
                </View>
              )}
            </View>

            <View style={styles.actionButtons}>
              {isEditing ? (
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsEditing(false);
                      setDisplayName(userProfile?.display_name || '');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveProfile}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#10b981', '#059669']}
                      style={styles.saveButtonGradient}
                    >
                      <Text style={styles.saveButtonText}>Guardar</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIsEditing(true);
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#1d4ed8']}
                    style={styles.editButtonGradient}
                  >
                    <Text style={styles.editButtonText}>✏️ Editar Perfil</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </BlurView>

          {/* Couple Info Card */}
          {couple && (
            <BlurView intensity={20} style={styles.coupleCard}>
              <Text style={styles.cardTitle}>👑 Información de la Pareja</Text>
              
              <View style={styles.coupleDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Nombre:</Text>
                  <Text style={styles.detailValue}>{couple.name}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Creada:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(couple.created_at).toLocaleDateString('es-ES')}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Estado:</Text>
                  <Text style={[styles.detailValue, styles.activeStatus]}>
                    {couple.is_active ? '💚 Activa' : '💔 Inactiva'}
                  </Text>
                </View>
                
                {couple.special_code && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Código Premium:</Text>
                    <Text style={[styles.detailValue, styles.premiumCode]}>
                      ✨ {couple.special_code}
                    </Text>
                  </View>
                )}
              </View>
            </BlurView>
          )}

          {/* Settings Card */}
          <BlurView intensity={20} style={styles.settingsCard}>
            <Text style={styles.cardTitle}>⚙️ Configuración</Text>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Próximamente', 'Esta función estará disponible pronto');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.settingText}>🔔 Notificaciones</Text>
              <Text style={styles.settingArrow}>→</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Próximamente', 'Esta función estará disponible pronto');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.settingText}>🎨 Tema</Text>
              <Text style={styles.settingArrow}>→</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Próximamente', 'Esta función estará disponible pronto');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.settingText}>🔒 Privacidad</Text>
              <Text style={styles.settingArrow}>→</Text>
            </TouchableOpacity>
          </BlurView>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#dc2626', '#991b1b']}
              style={styles.signOutGradient}
            >
              <Text style={styles.signOutText}>🚪 Cerrar Sesión</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff69b4',
    textShadowColor: '#ff1493',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  profileCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ff1493',
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ff69b4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ff1493',
    shadowColor: '#ff1493',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 25,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#374151',
    minWidth: 200,
  },
  userEmail: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 15,
  },
  coupleInfo: {
    alignItems: 'center',
  },
  coupleLabel: {
    fontSize: 16,
    color: '#ff69b4',
    fontWeight: '600',
  },
  coupleName: {
    fontSize: 18,
    color: '#fbbf24',
    fontWeight: 'bold',
    marginTop: 4,
  },
  actionButtons: {
    width: '100%',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  editButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  editButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(107, 114, 128, 0.8)',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  coupleCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  settingsCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#6b7280',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 15,
    textAlign: 'center',
  },
  coupleDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: '#d1d5db',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  activeStatus: {
    color: '#10b981',
  },
  premiumCode: {
    color: '#fbbf24',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(107, 114, 128, 0.3)',
  },
  settingText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  settingArrow: {
    fontSize: 18,
    color: '#6b7280',
  },
  signOutButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 10,
  },
  signOutGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  signOutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;