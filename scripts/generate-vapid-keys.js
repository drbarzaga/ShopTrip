#!/usr/bin/env node

/**
 * Script para generar VAPID keys para Web Push
 * Ejecutar: node scripts/generate-vapid-keys.js
 */

const webpush = require("web-push");

const vapidKeys = webpush.generateVAPIDKeys();

console.log("\n=== VAPID Keys Generated ===\n");
console.log("Public Key (NEXT_PUBLIC_VAPID_PUBLIC_KEY):");
console.log(vapidKeys.publicKey);
console.log("\nPrivate Key (VAPID_PRIVATE_KEY):");
console.log(vapidKeys.privateKey);
console.log("\nEmail (VAPID_EMAIL):");
console.log("mailto:your-email@example.com");
console.log("\n=== Add these to your .env file ===\n");





