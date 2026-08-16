import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KEY_DB_NAME = 'spendnova_sec_db';
const KEY_STORE_NAME = 'sec_keys';
const KEY_NAME = 'master_aes_key';

let cachedKey: CryptoKey | null = null;

/**
 * Retrieves or opens an IndexedDB database for secure key storage in Web browser.
 */
const openKeyDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }
    const request = indexedDB.open(KEY_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(KEY_STORE_NAME)) {
        db.createObjectStore(KEY_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Gets or generates a 256-bit AES-GCM CryptoKey for browser storage encryption.
 */
const getOrCreateMasterKey = async (): Promise<CryptoKey | null> => {
  if (cachedKey) return cachedKey;

  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return null;
  }

  try {
    const db = await openKeyDatabase();
    const existingRawKey = await new Promise<ArrayBuffer | null>((resolve, reject) => {
      const tx = db.transaction(KEY_STORE_NAME, 'readonly');
      const store = tx.objectStore(KEY_STORE_NAME);
      const req = store.get(KEY_NAME);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (existingRawKey) {
      const key = await window.crypto.subtle.importKey(
        'raw',
        existingRawKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      cachedKey = key;
      return key;
    }

    const key = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const exportedRaw = await window.crypto.subtle.exportKey('raw', key);

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(KEY_STORE_NAME, 'readwrite');
      const store = tx.objectStore(KEY_STORE_NAME);
      const req = store.put(exportedRaw, KEY_NAME);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    cachedKey = key;
    return key;
  } catch (error) {
    console.warn('Web Crypto Key initialization fallback:', error);
    return null;
  }
};

/**
 * Helper to convert string to Uint8Array
 */
const encodeText = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

/**
 * Helper to convert Uint8Array to string
 */
const decodeText = (buf: ArrayBuffer): string => {
  return new TextDecoder().decode(buf);
};

/**
 * SecureStorage interface providing encrypted getItem / setItem for browser local storage.
 */
export const SecureStorage = {
  async getItem(key: string): Promise<string | null> {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;

    if (Platform.OS !== 'web') {
      return raw;
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.__enc === true && parsed.iv && parsed.data) {
        const cryptoKey = await getOrCreateMasterKey();
        if (!cryptoKey) return raw; // Fallback if Web Crypto is unavailable

        const iv = new Uint8Array(parsed.iv);
        const data = new Uint8Array(parsed.data);

        const decryptedBuffer = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          cryptoKey,
          data as unknown as BufferSource
        );
        return decodeText(decryptedBuffer);
      }
    } catch {
      // Raw string is not an encrypted JSON envelope (legacy unencrypted data)
    }

    // Transparently upgrade legacy plain text to encrypted format in background
    void this.setItem(key, raw);
    return raw;
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS !== 'web') {
      await AsyncStorage.setItem(key, value);
      return;
    }

    try {
      const cryptoKey = await getOrCreateMasterKey();
      if (!cryptoKey) {
        await AsyncStorage.setItem(key, value);
        return;
      }

      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encoded = encodeText(value);

      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encoded as unknown as BufferSource
      );

      const payload = JSON.stringify({
        __enc: true,
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encryptedBuffer)),
      });

      await AsyncStorage.setItem(key, payload);
    } catch (e) {
      console.error('Failed to encrypt storage item, storing standard:', e);
      await AsyncStorage.setItem(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },
};
