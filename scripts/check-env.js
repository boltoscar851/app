#!/usr/bin/env node

/**
 * Script para verificar que las variables de entorno estén configuradas correctamente
 * antes de hacer builds de producción
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '..', '.env');
const REQUIRED_VARS = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY'
];

console.log('🔍 Verificando configuración de variables de entorno...\n');

// Verificar si existe el archivo .env
if (!fs.existsSync(ENV_FILE)) {
  console.error('❌ Error: No se encontró el archivo .env');
  console.log('💡 Solución: Copia .env.example a .env y configura tus credenciales de Supabase');
  process.exit(1);
}

// Leer el archivo .env
const envContent = fs.readFileSync(ENV_FILE, 'utf8');
const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

const envVars = {};
envLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

// Verificar variables requeridas
let allConfigured = true;

REQUIRED_VARS.forEach(varName => {
  const value = envVars[varName];
  
  if (!value) {
    console.error(`❌ ${varName}: No configurada`);
    allConfigured = false;
  } else if (value.includes('your-') || value.includes('placeholder')) {
    console.error(`❌ ${varName}: Contiene valor de placeholder`);
    console.log(`   Valor actual: ${value}`);
    allConfigured = false;
  } else {
    console.log(`✅ ${varName}: Configurada correctamente`);
  }
});

console.log('\n' + '='.repeat(50));

if (allConfigured) {
  console.log('✅ ¡Todas las variables de entorno están configuradas correctamente!');
  console.log('🚀 Puedes proceder con el build de producción');
} else {
  console.error('❌ Hay variables de entorno sin configurar o con valores incorrectos');
  console.log('\n💡 Para configurar Supabase:');
  console.log('1. Ve a https://supabase.com/dashboard');
  console.log('2. Selecciona tu proyecto');
  console.log('3. Ve a Settings > API');
  console.log('4. Copia tu Project URL y anon/public key');
  console.log('5. Reemplaza los valores en el archivo .env');
  process.exit(1);
}

console.log('\n📱 Para hacer el build:');
console.log('   eas build --platform android --profile preview');
console.log('   eas build --platform android --profile production');