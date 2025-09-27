import React, { useState, useEffect } from 'react';
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
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../contexts/AuthContext';
import { firebaseService } from '../lib/firebase';
import FloatingHearts from '../components/FloatingHearts';
import SparkleEffects from '../components/SparkleEffects';

const { width } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const { user, userProfile, couple, signOut, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.display_name || '');
  const [showPremium, setShowPremium] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [premiumCode, setPremiumCode] = useState('');
  const [premiumStatus, setPremiumStatus] = useState<any>(null);
  const [themes, setThemes] = useState<any[]>([]);
  const [coupleSettings, setCoupleSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (couple?.id) {
      loadPremiumData();
    }
  }, [couple?.id]);

  const loadPremiumData = async () => {
    if (!couple?.id) return;
    
    try {
      // Simular datos premium para Firebase
      setPremiumStatus({ is_premium: false, features: {} });
      setThemes([
        { id: '1', display_name: 'Tema Clásico', colors: { gradient: ['#ff1493', '#8b008b'] }, is_premium: false },
        { id: '2', display_name: 'Tema Dorado', colors: { gradient: ['#fbbf24', '#f59e0b'] }, is_premium: true },
      ]);
      setCoupleSettings({ theme_id: '1' });
    } catch (error) {
      console.error('Error loading premium data:', error);
    }
  };

  const activatePremiumCode = async () => {
    if (!premiumCode.trim() || !couple?.id) {
      Alert.alert('Error', 'Por favor ingresa un código válido');
      return;
    }

    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Simular activación de código premium
      const result = { success: true, message: 'Código premium activado correctamente' };
      
      if (result.success) {
        Alert.alert('¡Éxito!', result.message);
        setPremiumCode('');
        setShowPremium(false);
        loadPremiumData();
        refreshProfile();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al activar el código');
    } finally {
      setLoading(false);
    }
  };

  const selectTheme = async (themeId: string) => {
    if (!couple?.id) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Simular cambio de tema
      setCoupleSettings({ ...coupleSettings, theme_id: themeId });
      
      setShowThemes(false);
      loadPremiumData();
      Alert.alert('¡Tema aplicado!', 'El nuevo tema se ha aplicado correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al cambiar el tema');
    }
  };

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
      
      if (!user) return;
      
      await firebaseService.updateUserProfile(user.id, { display_name: displayName });
      
      await refreshProfile();
      setIsEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al actualizar el perfil');
    }
  };

  const isPremium = premiumStatus?.is_premium || false;
  const premiumFeatures = premiumStatus?.features || {};

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
              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>👑 PREMIUM</Text>
                </View>
              )}
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

          {/* Premium Status Card */}
          <BlurView intensity={20} style={[
            styles.premiumCard,
            isPremium ? styles.premiumCardActive : styles.premiumCardInactive
          ]}>
            <View style={styles.premiumHeader}>
              <Text style={styles.premiumTitle}>
                {isPremium ? '👑 Estado Premium' : '💎 Hazte Premium'}
              </Text>
              {!isPremium && (
                <TouchableOpacity
                  style={styles.activateButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowPremium(true);
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#fbbf24', '#f59e0b']}
                    style={styles.activateButtonGradient}
                  >
                    <Text style={styles.activateButtonText}>Activar Código</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            {isPremium ? (
              <View style={styles.premiumFeatures}>
                <Text style={styles.premiumStatusText}>¡Tienes acceso premium! 🎉</Text>
                
                <View style={styles.featuresList}>
                  {premiumFeatures.custom_rules?.enabled && (
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>📝</Text>
                      <Text style={styles.featureText}>Reglas personalizadas</Text>
                    </View>
                  )}
                  {premiumFeatures.premium_themes?.enabled && (
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>🎨</Text>
                      <Text style={styles.featureText}>Temas premium</Text>
                    </View>
                  )}
                  {premiumFeatures.advanced_activities?.enabled && (
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>🎯</Text>
                      <Text style={styles.featureText}>Actividades avanzadas</Text>
                    </View>
                  )}
                  {premiumFeatures.unlimited_storage?.enabled && (
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>☁️</Text>
                      <Text style={styles.featureText}>Almacenamiento ilimitado</Text>
                    </View>
                  )}
                </View>

                {premiumStatus?.expires_at && (
                  <Text style={styles.expirationText}>
                    Expira: {new Date(premiumStatus.expires_at).toLocaleDateString('es-ES')}
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.premiumBenefits}>
                <Text style={styles.benefitsTitle}>Beneficios Premium:</Text>
                <View style={styles.benefitsList}>
                  <Text style={styles.benefitItem}>📝 Reglas personalizadas</Text>
                  <Text style={styles.benefitItem}>🎨 Temas exclusivos</Text>
                  <Text style={styles.benefitItem}>🎯 Actividades avanzadas</Text>
                  <Text style={styles.benefitItem}>☁️ Almacenamiento ilimitado</Text>
                  <Text style={styles.benefitItem}>💫 Funciones especiales</Text>
                </View>
              </View>
            )}
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
                setShowThemes(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.settingText}>🎨 Temas</Text>
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

        {/* Premium Code Modal */}
        <Modal
          visible={showPremium}
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
                  onPress={() => setShowPremium(false)}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                
                <Text style={styles.modalTitle}>👑 Activar Premium</Text>
                
                <View style={styles.modalHeaderSpacer} />
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.premiumModalContent}>
                  <Text style={styles.premiumModalTitle}>¡Desbloquea funciones premium!</Text>
                  
                  <View style={styles.premiumBenefitsModal}>
                    <View style={styles.benefitItemModal}>
                      <Text style={styles.benefitIconModal}>📝</Text>
                      <Text style={styles.benefitTextModal}>Reglas personalizadas para vuestra relación</Text>
                    </View>
                    
                    <View style={styles.benefitItemModal}>
                      <Text style={styles.benefitIconModal}>🎨</Text>
                      <Text style={styles.benefitTextModal}>Temas exclusivos y personalizables</Text>
                    </View>
                    
                    <View style={styles.benefitItemModal}>
                      <Text style={styles.benefitIconModal}>🎯</Text>
                      <Text style={styles.benefitTextModal}>Actividades y retos avanzados</Text>
                    </View>
                    
                    <View style={styles.benefitItemModal}>
                      <Text style={styles.benefitIconModal}>☁️</Text>
                      <Text style={styles.benefitTextModal}>Almacenamiento ilimitado de fotos</Text>
                    </View>
                  </View>

                  <Text style={styles.codeInputLabel}>Código Premium:</Text>
                  <TextInput
                    style={styles.codeInput}
                    value={premiumCode}
                    onChangeText={setPremiumCode}
                    placeholder="Ingresa tu código premium"
                    placeholderTextColor="#999"
                    autoCapitalize="characters"
                  />

                  <TouchableOpacity
                    style={[styles.activateCodeButton, loading && styles.activateCodeButtonDisabled]}
                    onPress={activatePremiumCode}
                    disabled={loading || !premiumCode.trim()}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={loading ? ['#666', '#444'] : ['#fbbf24', '#f59e0b']}
                      style={styles.activateCodeGradient}
                    >
                      <Text style={styles.activateCodeText}>
                        {loading ? '⏳ Activando...' : '✨ Activar Premium'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>

        {/* Themes Modal */}
        <Modal
          visible={showThemes}
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
                  onPress={() => setShowThemes(false)}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                
                <Text style={styles.modalTitle}>🎨 Seleccionar Tema</Text>
                
                <View style={styles.modalHeaderSpacer} />
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.themesGrid}>
                  {themes.map((theme) => {
                    const isSelected = coupleSettings?.theme_id === theme.id;
                    const canUse = !theme.is_premium || isPremium;
                    
                    return (
                      <TouchableOpacity
                        key={theme.id}
                        style={[
                          styles.themeCard,
                          isSelected && styles.themeCardSelected,
                          !canUse && styles.themeCardDisabled
                        ]}
                        onPress={() => canUse ? selectTheme(theme.id) : Alert.alert('Premium Requerido', 'Este tema requiere una suscripción premium')}
                        activeOpacity={0.8}
                        disabled={!canUse}
                      >
                        <View style={styles.themePreview}>
                          <LinearGradient
                            colors={theme.colors?.gradient || ['#ff1493', '#8b008b']}
                            style={styles.themeGradient}
                          />
                        </View>
                        
                        <View style={styles.themeInfo}>
                          <Text style={styles.themeName}>{theme.display_name}</Text>
                          {theme.is_premium && (
                            <Text style={styles.themePremiumBadge}>👑 Premium</Text>
                          )}
                          {isSelected && (
                            <Text style={styles.themeSelectedBadge}>✅ Seleccionado</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
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
    alignItems: 'center',
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
  premiumBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    marginTop: 8,
  },
  premiumBadgeText: {
    color: '#92400e',
    fontSize: 12,
    fontWeight: 'bold',
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
  premiumCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
  },
  premiumCardActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: '#fbbf24',
  },
  premiumCardInactive: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderColor: '#6b7280',
  },
  premiumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  activateButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  activateButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activateButtonText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: 'bold',
  },
  premiumFeatures: {
    alignItems: 'center',
  },
  premiumStatusText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  featuresList: {
    width: '100%',
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  expirationText: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 15,
    textAlign: 'center',
  },
  premiumBenefits: {
    alignItems: 'center',
  },
  benefitsTitle: {
    fontSize: 16,
    color: '#d1d5db',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  benefitsList: {
    gap: 5,
  },
  benefitItem: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
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
  modalHeaderSpacer: {
    width: 80,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  premiumModalContent: {
    alignItems: 'center',
  },
  premiumModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fbbf24',
    textAlign: 'center',
    marginBottom: 30,
  },
  premiumBenefitsModal: {
    width: '100%',
    marginBottom: 30,
    gap: 15,
  },
  benefitItemModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
  },
  benefitIconModal: {
    fontSize: 24,
  },
  benefitTextModal: {
    fontSize: 16,
    color: 'white',
    flex: 1,
  },
  codeInputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  codeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
    width: '100%',
    marginBottom: 30,
    textAlign: 'center',
  },
  activateCodeButton: {
    borderRadius: 25,
    overflow: 'hidden',
    width: '100%',
  },
  activateCodeButtonDisabled: {
    opacity: 0.7,
  },
  activateCodeGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  activateCodeText: {
    color: '#92400e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  themesGrid: {
    gap: 15,
  },
  themeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 2,
    borderColor: '#374151',
  },
  themeCardSelected: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  themeCardDisabled: {
    opacity: 0.5,
  },
  themePreview: {
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  themeGradient: {
    flex: 1,
  },
  themeInfo: {
    alignItems: 'center',
  },
  themeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  themePremiumBadge: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: 'bold',
  },
  themeSelectedBadge: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;