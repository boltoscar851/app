# Nuestro Amor - App Móvil para Parejas 💕

Una aplicación móvil privada desarrollada con React Native y Expo que permite a las parejas fortalecer su vínculo afectivo a través de reglas compartidas, actividades interactivas y herramientas de conexión.

## 🚀 Características Principales

## 🚀 Características Principales

### 📱 Aplicación Móvil Nativa

- Desarrollada con **React Native** y **Expo**
- Compatible con **Android** e **iOS**
- Interfaz moderna, romántica y **responsive**
- Animaciones fluidas, gradientes dinámicos y efectos visuales

### 💖 Reglas del Amor

- 29 reglas personalizadas para la relación
- Navegación intuitiva entre reglas con barra de progreso visual
- Regla de oro especial (#30)

### 🎯 Widgets Agregados

- **DaysTogetherWidget** – Contador de días juntos  
- **NextEventWidget** – Próximo evento importante con cuenta regresiva  
- **MessagesWidget** – Estadísticas de mensajes enviados  
- **PhotosWidget** – Contador de fotos compartidas  
- **DistanceWidget** – Distancia actual entre la pareja  
- **ActivitiesWidget** – Actividades completadas vs pendientes  
- **DiaryWidget** – Últimas entradas del diario y actividad reciente  
- **WishlistWidget** – Progreso de deseos cumplidos  

### 🎮 Funcionalidades Nuevas

- **Chat Mejorado**  
  - Notas de voz con grabación y reproducción  
  - Stickers románticos por categorías (Amor, Felicidad, Animales, etc.)  
  - Reproductor de voz con barra de progreso  
  - Interfaz mejorada con múltiples opciones de envío  

- **Ruleta Sorpresa**  
  - Modal de sorpresas secretas: solo quien gira ve el resultado  
  - Notificación misteriosa para la pareja con el resultado  
  - Animaciones especiales con emojis giratorios  

- **Pantalla Principal Renovada**  
  - Grid de widgets interactivos con datos en tiempo real  
  - Widget principal destacado (días juntos)  
  - Widgets secundarios en cuadrícula 2x2  
  - Acciones rápidas reorganizadas  
  - Widget de sorpresa integrado  

### 🎨 Diseño Romántico

- Gradientes animados de fondo  
- Corazones flotantes y efectos de brillo (sparkles)  
- Colores románticos (rosa, púrpura, dorado)  
- Animaciones de entrada y transiciones suaves  

---

### 🔮 Funcionalidades Futuras

- Diario de pareja con fotos y videos  
- Galería colaborativa  
- Calendario de eventos importantes  
- Chat privado con stickers románticos  
- Ruleta de actividades (normal y sorpresa)  
- Retos semanales  
- Lista de deseos compartida  
- Sistema premium con códigos especiales  

---

## 🔧 Mejoras Técnicas

- Gestión de permisos para micrófono y ubicación  
- Componentes reutilizables para widgets  
- Integración con **Supabase** para datos en tiempo real  
- Animaciones fluidas y efectos visuales optimizados  
- Diseño adaptable a diferentes tamaños de pantalla  

## 📱 Experiencia de Usuario

- Interfaz más rica y dinámica  
- Feedback háptico en todas las interacciones  
- Actualización automática de datos en tiempo real  
- Navegación intuitiva entre funcionalidades  
- Personalización visual con gradientes y efectos  

## 🛠️ Tecnologías Utilizadas

- **React Native** - Framework principal
- **Expo** - Plataforma de desarrollo
- **TypeScript** - Tipado estático
- **React Navigation** - Navegación entre pantallas
- **Expo Linear Gradient** - Gradientes
- **Expo Blur** - Efectos de desenfoque
- **Expo Haptics** - Retroalimentación táctil
- **React Native Reanimated** - Animaciones avanzadas
- **Supabase** - Base de datos y autenticación
- **PostgreSQL** - Base de datos relacional

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn
- Expo CLI
- EAS CLI (para builds de producción)
- Cuenta de Supabase

### Instalación
```bash
# Instalar dependencias
npm install

# Instalar Expo CLI globalmente (si no lo tienes)
npm install -g @expo/cli

# Instalar EAS CLI globalmente (para builds)
npm install -g eas-cli
```

### Configuración de Supabase
```bash
# Copiar el archivo de configuración
# Editar el archivo .env que ya existe en el proyecto

# Reemplazar en .env con tus credenciales reales de Supabase:
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto-real.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-real
```

**IMPORTANTE**: 
1. Configura tus credenciales reales de Supabase en el archivo `.env`
2. Las variables se cargan automáticamente usando `expo-constants`
3. Para builds de producción, las variables se incluyen en el bundle de forma segura

### Desarrollo
```bash
# Iniciar el servidor de desarrollo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios

# Ejecutar en web
npm run web
```

## 🏗️ Build y Distribución

### Configurar EAS Build
```bash
# Inicializar EAS en el proyecto
eas build:configure

# Login en Expo
eas login
```

### Generar APK para Android
```bash
# Build de preview (APK)
eas build --platform android --profile preview

# Build de producción
eas build --platform android --profile production
```

### Build para iOS
```bash
# Build para iOS
eas build --platform ios --profile production
```

## 📱 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── FloatingHearts.tsx
│   ├── SparkleEffects.tsx
│   ├── RuleCard.tsx
│   └── ProgressBar.tsx
├── screens/            # Pantallas principales
│   ├── HomeScreen.tsx
│   └── RulesScreen.tsx
├── data/               # Datos de la aplicación
│   └── rules.ts
└── types/              # Tipos TypeScript
    └── navigation.ts
```

## 🎯 Roadmap de Desarrollo

### Fase 1 - Reglas del Amor ✅
- [x] Pantalla de inicio romántica
- [x] Visualización de reglas
- [x] Navegación entre reglas
- [x] Efectos visuales y animaciones

### Fase 2 - Funcionalidades Básicas
- [x] Sistema de autenticación para parejas
- [x] Perfil de usuario personalizable
- [x] Configuración de la aplicación

### Fase 3 - Herramientas de Conexión ✅
- [x] Chat privado con mensajes en tiempo real
- [x] Diario de pareja con estados de ánimo
- [x] Calendario de eventos especiales
- [ ] Galería colaborativa (próximamente)

### Fase 4 - Actividades y Juegos ✅
- [x] Ruleta de actividades con categorías
- [x] Retos semanales personalizados
- [x] Lista de deseos compartida con prioridades
- [x] Sistema de actividades completadas

### Fase 5 - Sistema Premium ✅
- [x] Códigos premium con diferentes tipos
- [x] Funcionalidades exclusivas por suscripción
- [x] Temas personalizables (gratuitos y premium)
- [x] Sistema de configuración de pareja
- [x] Gestión de características premium

## 🔐 Seguridad y Privacidad

- Cifrado extremo a extremo para datos sensibles
- Almacenamiento local seguro
- Sin recopilación de datos innecesarios
- Privacidad total entre parejas

## 📄 Licencia

Este proyecto es privado y está destinado exclusivamente para uso personal de Oscar y Yuritzy.

## 💕 Créditos

Desarrollado con amor para Oscar y Yuritzy 💖

---

**Regla de Oro (#30)**: Amarnos por siempre 💗🤍
