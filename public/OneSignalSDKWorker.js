// OneSignal Service Worker
// Este archivo es requerido por OneSignal SDK
// OneSignal descargará automáticamente su propio Service Worker, pero necesitamos este archivo
// para evitar errores 404 durante la inicialización

// Importar el SDK de OneSignal para Service Workers
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js');

// OneSignal manejará automáticamente los eventos de push desde aquí
