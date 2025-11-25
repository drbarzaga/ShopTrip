/**
 * Migration script para agregar tabla de tokens FCM
 * Ejecutar manualmente: npx tsx src/db/migrations/add-fcm-tokens.ts
 */

import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function addFCMTokensTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS fcm_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        device_info TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS fcm_tokens_user_id_idx ON fcm_tokens(user_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS fcm_tokens_token_idx ON fcm_tokens(token);
    `);

    console.log("FCM tokens table created successfully");
  } catch (error) {
    console.error("Error creating FCM tokens table:", error);
    throw error;
  }
}




