/**
 * IndexedDB wrapper para almacenamiento offline
 * Almacena viajes, items y acciones pendientes de sincronización
 */

const DB_NAME = "shop-trip-offline";
const DB_VERSION = 1;

interface OfflineTrip {
  id: string;
  name: string;
  slug: string;
  destination: string | null;
  startDate: string | null;
  endDate: string | null;
  userId: string;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

interface OfflineTripItem {
  id: string;
  tripId: string;
  name: string;
  description: string | null;
  price: number | null;
  quantity: number;
  purchased: boolean;
  purchasedBy: string | null;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

interface PendingAction {
  id: string;
  type: "create_trip" | "update_trip" | "delete_trip" | "create_item" | "update_item" | "delete_item" | "toggle_purchased";
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

class OfflineDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB"));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store para viajes offline
        if (!db.objectStoreNames.contains("trips")) {
          const tripStore = db.createObjectStore("trips", { keyPath: "id" });
          tripStore.createIndex("userId", "userId", { unique: false });
          tripStore.createIndex("synced", "synced", { unique: false });
          tripStore.createIndex("slug", "slug", { unique: true });
        }

        // Store para items offline
        if (!db.objectStoreNames.contains("items")) {
          const itemStore = db.createObjectStore("items", { keyPath: "id" });
          itemStore.createIndex("tripId", "tripId", { unique: false });
          itemStore.createIndex("synced", "synced", { unique: false });
        }

        // Store para acciones pendientes
        if (!db.objectStoreNames.contains("pendingActions")) {
          const actionStore = db.createObjectStore("pendingActions", {
            keyPath: "id",
          });
          actionStore.createIndex("timestamp", "timestamp", { unique: false });
          actionStore.createIndex("type", "type", { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db;
  }

  // Trips
  async saveTrip(trip: Omit<OfflineTrip, "synced">): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["trips"], "readwrite");
      const store = transaction.objectStore("trips");
      const tripWithSync = { ...trip, synced: false };
      const request = store.put(tripWithSync);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTrips(userId: string): Promise<OfflineTrip[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["trips"], "readonly");
      const store = transaction.objectStore("trips");
      const index = store.index("userId");
      const request = index.getAll(userId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getTrip(id: string): Promise<OfflineTrip | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["trips"], "readonly");
      const store = transaction.objectStore("trips");
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getTripBySlug(slug: string, userId: string): Promise<OfflineTrip | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["trips"], "readonly");
      const store = transaction.objectStore("trips");
      const index = store.index("slug");
      const request = index.get(slug);

      request.onsuccess = () => {
        const trip = request.result;
        if (trip && trip.userId === userId) {
          resolve(trip);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async markTripSynced(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["trips"], "readwrite");
      const store = transaction.objectStore("trips");
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const trip = getRequest.result;
        if (trip) {
          trip.synced = true;
          const putRequest = store.put(trip);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteTrip(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["trips"], "readwrite");
      const store = transaction.objectStore("trips");
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Items
  async saveItem(item: Omit<OfflineTripItem, "synced">): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["items"], "readwrite");
      const store = transaction.objectStore("items");
      const itemWithSync = { ...item, synced: false };
      const request = store.put(itemWithSync);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getItems(tripId: string): Promise<OfflineTripItem[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["items"], "readonly");
      const store = transaction.objectStore("items");
      const index = store.index("tripId");
      const request = index.getAll(tripId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async markItemSynced(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["items"], "readwrite");
      const store = transaction.objectStore("items");
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.synced = true;
          const putRequest = store.put(item);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteItem(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["items"], "readwrite");
      const store = transaction.objectStore("items");
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Pending Actions
  async addPendingAction(action: Omit<PendingAction, "id" | "timestamp" | "retries">): Promise<string> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["pendingActions"], "readwrite");
      const store = transaction.objectStore("pendingActions");
      const actionWithMeta: PendingAction = {
        ...action,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        retries: 0,
      };
      const request = store.add(actionWithMeta);

      request.onsuccess = () => resolve(actionWithMeta.id);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingActions(): Promise<PendingAction[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["pendingActions"], "readonly");
      const store = transaction.objectStore("pendingActions");
      const index = store.index("timestamp");
      const request = index.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async removePendingAction(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["pendingActions"], "readwrite");
      const store = transaction.objectStore("pendingActions");
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async incrementActionRetries(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["pendingActions"], "readwrite");
      const store = transaction.objectStore("pendingActions");
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const action = getRequest.result;
        if (action) {
          action.retries += 1;
          const putRequest = store.put(action);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }
}

export const offlineDB = new OfflineDB();
export type { OfflineTrip, OfflineTripItem, PendingAction };

