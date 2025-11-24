/**
 * Script de diagnóstico para OneSignal
 * Copia y pega este código en la consola del navegador para diagnosticar problemas
 */

async function diagnoseOneSignal() {
  console.log("=== DIAGNÓSTICO DE ONESIGNAL ===\n");
  
  // Verificar que OneSignal esté disponible
  if (typeof window.OneSignal === "undefined") {
    console.error("❌ OneSignal no está disponible. ¿Está cargado el SDK?");
    return;
  }
  
  console.log("✅ OneSignal SDK está disponible\n");
  
  try {
    // Verificar soporte de push
    const isPushSupported = await window.OneSignal.Notifications.isPushSupported();
    console.log(`Push soportado: ${isPushSupported ? "✅ Sí" : "❌ No"}`);
    
    // Verificar permisos
    const permission = await window.OneSignal.Notifications.permission;
    console.log(`Permisos de notificaciones: ${permission}`);
    
    // Verificar si está optado
    const isOptedIn = await window.OneSignal.User.PushSubscription.optedIn;
    console.log(`Optado en OneSignal: ${isOptedIn ? "✅ Sí" : "❌ No"}`);
    
    // Obtener Player ID
    const playerId = window.OneSignal.User.PushSubscription.id;
    console.log(`Player ID: ${playerId || "❌ No disponible"}`);
    
    // Verificar Service Worker
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        console.log(`Service Worker registrado: ✅ Sí`);
        console.log(`Service Worker scope: ${registration.scope}`);
      } else {
        console.log(`Service Worker registrado: ❌ No`);
      }
    }
    
    console.log("\n=== PRUEBA DE NOTIFICACIÓN ===");
    console.log("Para probar, ejecuta: window.OneSignal.sendSelfNotification()");
    
  } catch (error) {
    console.error("❌ Error durante el diagnóstico:", error);
  }
}

// Ejecutar diagnóstico
diagnoseOneSignal();

