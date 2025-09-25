import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

// Loading Screen Component
function LoadingScreen() {
  return (
    <LinearGradient
      colors={['#000000', '#1a0033', '#330066', '#1a0033', '#000000']}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <View style={{ alignItems: 'center' }}>
        <Text style={{ 
          fontSize: 32, 
          fontWeight: 'bold', 
          color: '#ff69b4', 
          marginBottom: 30,
          textAlign: 'center'
        }}>
          💕 Nuestro Amor 💕
        </Text>
        <ActivityIndicator size="large" color="#ff69b4" />
        <Text style={{ 
          color: '#ff69b4', 
          fontSize: 16, 
          marginTop: 20,
          textAlign: 'center'
        }}>
          Cargando...
        </Text>
      </View>
    </LinearGradient>
  );
}

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
    // Don't show alert in production to prevent crashes
    console.warn('App crashed:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <LinearGradient
          colors={['#000000', '#1a0033', '#330066', '#1a0033', '#000000']}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Text style={{ color: '#ff69b4', fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
              Ha ocurrido un error en la aplicación.{'\n'}
              Por favor, reinicia la app.
            </Text>
            {__DEV__ && (
              <Text style={{ color: '#d1d5db', fontSize: 14, textAlign: 'center' }}>
                {this.state.error?.message}
              </Text>
            )}
          </View>
        </LinearGradient>
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
    return <LoadingScreen />;
  }

  return user ? <AuthenticatedApp /> : <AuthScreen />;
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({});
  const [appIsReady, setAppIsReady] = React.useState(false);

  React.useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Minimum loading time
      } catch (e) {
        console.warn('Error during app preparation:', e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  React.useEffect(() => {
    if (appIsReady && (fontsLoaded || fontError)) {
      // Hide the splash screen once the app is ready and fonts are loaded
      const hideSplash = async () => {
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          console.warn('Error hiding splash screen:', error);
        }
      };
      
      // Small delay to ensure smooth transition
      setTimeout(hideSplash, 500);
    }
  }, [appIsReady, fontsLoaded, fontError]);

  if (!appIsReady || (!fontsLoaded && !fontError)) {
    return null; // Keep splash screen visible
  }

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