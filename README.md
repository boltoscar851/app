# Nuestro Amor - App Móvil para Parejas 💕

Una aplicación móvil privada desarrollada con React Native y Expo que permite a las parejas fortalecer su vínculo afectivo a través de reglas compartidas, actividades interactivas y herramientas de conexión.

## 🚀 Características Principales

### 📱 Aplicación Móvil Nativa
- Desarrollada con React Native y Expo
- Compatible con Android e iOS
- Interfaz moderna y romántica
- Animaciones fluidas y efectos visuales

### 💖 Reglas del Amor
- 29 reglas personalizadas para la relación
- Navegación intuitiva entre reglas
- Barra de progreso visual
- Regla de oro especial (#30)

### 🎨 Diseño Romántico
- Gradientes animados de fondo
- Corazones flotantes
- Efectos de brillo (sparkles)
- Colores románticos (rosa, púrpura, dorado)
- Animaciones de entrada y transiciones

### 🔮 Funcionalidades Futuras
- Diario de pareja con fotos y videos
- Galería colaborativa
- Calendario de eventos importantes
- Chat privado con stickers románticos
- Ruleta de actividades (normal y sorpresa)
- Retos semanales
- Lista de deseos compartida
- Sistema premium con códigos especiales

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
cp .env.example .env

# Editar .env con tus credenciales de Supabase
# EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
# EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

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

### Fase 4 - Actividades y Juegos
- [ ] Ruleta de actividades
- [ ] Retos semanales
- [ ] Preguntas del día
- [ ] Lista de deseos compartida

### Fase 5 - Sistema Premium
- [ ] Códigos premium
- [ ] Funcionalidades exclusivas
- [ ] Temas personalizables
- [ ] Almacenamiento en la nube

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