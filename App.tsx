import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, Alert } from 'react-native';
import { Platform } from 'react-native';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import RulesScreen from './src/screens/RulesScreen';
import HomeScreen from './src/screens/HomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChatScreen from './src/screens/ChatScreen';
import DiaryScreen from './src/screens/DiaryScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ActivitiesScreen from './src/screens/ActivitiesScreen';
import ChallengesScreen from './src/screens/ChallengesScreen';
import WishlistScreen from './src/screens/WishlistScreen';
import GalleryScreen from './src/screens/GalleryScreen';
import DailyQuestionsScreen from './src/screens/DailyQuestionsScreen';
import CountersScreen from './src/screens/CountersScreen';
import { RootStackParamList } from './src/types/navigation';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error:', error, errorInfo);
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Error de la aplicación',
        `Ha ocurrido un error: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
          <Text style={{ color: '#ff69b4', fontSize: 18, textAlign: 'center', margin: 20 }}>
            Ha ocurrido un error en la aplicación.{'\n'}
            Por favor, reinicia la app.
          </Text>
          <Text style={{ color: '#d1d5db', fontSize: 14, textAlign: 'center', margin: 20 }}>
            {this.state.error?.message}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function AuthenticatedApp() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#ff1493',
          borderTopWidth: 2,
        },
        tabBarActiveTintColor: '#ff69b4',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>💬</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{
          title: 'Galería',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📸</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Diary"
        component={DiaryScreen}
        options={{
          title: 'Diario',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📖</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          title: 'Eventos',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📅</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function HomeStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Rules" component={RulesScreen} />
      <Stack.Screen name="DailyQuestions" component={DailyQuestionsScreen} />
      <Stack.Screen name="Counters" component={CountersScreen} />
      <Stack.Screen name="Activities" component={ActivitiesStackNavigator} />
    </Stack.Navigator>
  );
}

function ActivitiesStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ActivitiesMain"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen name="ActivitiesMain" component={ActivitiesScreen} />
      <Stack.Screen name="Challenges" component={ChallengesScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <Text style={{ color: '#ff69b4', fontSize: 18 }}>Cargando...</Text>
      </View>
    );
  }

  return user ? <AuthenticatedApp /> : <AuthScreen />;
}

export default function App() {
  const [fontsLoaded] = useFonts({});

  React.useEffect(() => {
    // Hide splash screen when fonts are loaded or after timeout
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(console.warn);
    }, 2000);

    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  // Hide splash screen when fonts are loaded
  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(console.warn);
    }
  }, [fontsLoaded]);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </ErrorBoundary>
  );
}