import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../contexts/AuthContext';
import FloatingHearts from '../components/FloatingHearts';
import SparkleEffects from '../components/SparkleEffects';

const { width } = Dimensions.get('window');

type AuthMode = 'signin' | 'signup' | 'join';

const AuthScreen: React.FC = () => {
  const { signIn, signUpCouple, joinCouple, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signup');
  
  // Estados para iniciar sesión
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados para crear pareja
  const [coupleName, setCoupleName] = useState('');
  const [email1, setEmail1] = useState('');
  const [password1, setPassword1] = useState('');
  const [name1, setName1] = useState('');
  const [email2, setEmail2] = useState('');
  const [password2, setPassword2] = useState('');
  const [name2, setName2] = useState('');
  
  // Estados para unirse a pareja
  const [joinEmail, setJoinEmail] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinName, setJoinName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al iniciar sesión');
    }
  };

  const handleSignUpCouple = async () => {
    if (!coupleName || !email1 || !password1 || !name1) {
      Alert.alert('Error', 'Por favor completa los campos del primer usuario y el nombre de la pareja');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await signUpCouple(email1, password1, name1, '', '', '', coupleName);
      
      Alert.alert(
        '¡Usuario creado!',
        `Tu cuenta ha sido creada exitosamente.\n\nCódigo de invitación para tu pareja: ${result.inviteCode}\n\nComparte este código con tu pareja para que se una a la relación.`,
        [{ 
          text: 'Copiar código', 
          onPress: () => {
            // En una app real, aquí copiarías al clipboard
            console.log('Código copiado:', result.inviteCode);
          }
        }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al crear la cuenta');
    }
  };

  const handleJoinCouple = async () => {
    if (!joinEmail || !joinPassword || !joinName || !inviteCode) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await joinCouple(joinEmail, joinPassword, joinName, inviteCode);
      Alert.alert('¡Bienvenido!', 'Te has unido exitosamente a la pareja');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al unirse a la pareja');
    }
  };

  const switchMode = (newMode: AuthMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(newMode);
  };

  const renderSignIn = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>💕 Iniciar Sesión</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSignIn}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#ff1493', '#8b008b']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderSignUp = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.formTitle}>👑 Crear Cuenta</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nombre de la relación (ej: Oscar y Yuritzy)"
        placeholderTextColor="#999"
        value={coupleName}
        onChangeText={setCoupleName}
      />
      
      <Text style={styles.sectionTitle}>💖 Tus Datos</Text>
      <TextInput
        style={styles.input}
        placeholder="Tu nombre"
        placeholderTextColor="#999"
        value={name1}
        onChangeText={setName1}
      />
      <TextInput
        style={styles.input}
        placeholder="Tu email"
        placeholderTextColor="#999"
        value={email1}
        onChangeText={setEmail1}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Tu contraseña"
        placeholderTextColor="#999"
        value={password1}
        onChangeText={setPassword1}
        secureTextEntry
      />
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ Siguiente paso</Text>
        <Text style={styles.infoText}>
          Después de crear tu cuenta, recibirás un código de invitación para compartir con tu pareja.
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSignUpCouple}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#ff1493', '#8b008b']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creando...' : 'Crear Cuenta'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderJoin = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>💞 Unirse a Pareja</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Tu nombre"
        placeholderTextColor="#999"
        value={joinName}
        onChangeText={setJoinName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Tu email"
        placeholderTextColor="#999"
        value={joinEmail}
        onChangeText={setJoinEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Tu contraseña"
        placeholderTextColor="#999"
        value={joinPassword}
        onChangeText={setJoinPassword}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Código de invitación"
        placeholderTextColor="#999"
        value={inviteCode}
        onChangeText={setInviteCode}
      />
      
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleJoinCouple}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#ff1493', '#8b008b']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Uniéndose...' : 'Unirse a Pareja'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#000000', '#1a0033', '#330066', '#1a0033', '#000000']}
      style={styles.container}
    >
      <FloatingHearts />
      <SparkleEffects />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.appTitle}>💕 Nuestro Amor 💕</Text>
            <Text style={styles.subtitle}>Aplicación privada para parejas</Text>
          </View>

          <BlurView intensity={20} style={styles.authCard}>
            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, mode === 'signin' && styles.activeTab]}
                onPress={() => switchMode('signin')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, mode === 'signin' && styles.activeTabText]}>
                  Iniciar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.tab, mode === 'signup' && styles.activeTab]}
                onPress={() => switchMode('signup')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, mode === 'signup' && styles.activeTabText]}>
                  Crear
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.tab, mode === 'join' && styles.activeTab]}
                onPress={() => switchMode('join')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, mode === 'join' && styles.activeTabText]}>
                  Unirse
                </Text>
              </TouchableOpacity>
            </View>

            {/* Forms */}
            {mode === 'signin' && renderSignIn()}
            {mode === 'signup' && renderSignUp()}
            {mode === 'join' && renderJoin()}
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff69b4',
    textAlign: 'center',
    textShadowColor: '#ff1493',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ff69b4',
    textAlign: 'center',
    opacity: 0.8,
  },
  authCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#ff1493',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#ff1493',
  },
  tabText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  formContainer: {
    maxHeight: 400,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff69b4',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#ff1493',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#60a5fa',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  primaryButton: {
    marginTop: 10,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#ff1493',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AuthScreen;