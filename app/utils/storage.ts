
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Web fallback using localStorage
const webStorage = {
  async getItemAsync(key: string): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.warn('localStorage getItem failed:', error);
      return null;
    }
  },

  async setItemAsync(key: string, value: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('localStorage setItem failed:', error);
      throw error;
    }
  },

  async deleteItemAsync(key: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('localStorage removeItem failed:', error);
      throw error;
    }
  }
};

// Native storage using SecureStore with chunking for large data
const nativeStorage = {
  async getItemAsync(key: string): Promise<string | null> {
    try {
      // Check if this is chunked data
      const chunkInfo = await SecureStore.getItemAsync(`${key}_chunks`);
      if (chunkInfo) {
        const chunkCount = parseInt(chunkInfo, 10);
        let reconstructed = '';
        
        for (let i = 0; i < chunkCount; i++) {
          const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
          if (chunk) {
            reconstructed += chunk;
          }
        }
        return reconstructed;
      }
      
      // Regular single value
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn('SecureStore getItem failed:', error);
      return null;
    }
  },

  async setItemAsync(key: string, value: string): Promise<void> {
    try {
      // If value is larger than 2000 bytes, chunk it
      if (value.length > 2000) {
        const chunkSize = 2000;
        const chunks = [];
        
        for (let i = 0; i < value.length; i += chunkSize) {
          chunks.push(value.slice(i, i + chunkSize));
        }
        
        // Store chunk count
        await SecureStore.setItemAsync(`${key}_chunks`, chunks.length.toString());
        
        // Store each chunk
        for (let i = 0; i < chunks.length; i++) {
          await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunks[i]);
        }
        
        // Clean up old single value if it exists
        try {
          await SecureStore.deleteItemAsync(key);
        } catch (e) {
          // Ignore if key doesn't exist
        }
      } else {
        // Store as single value and clean up any chunks
        await this.deleteChunks(key);
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.warn('SecureStore setItem failed:', error);
      throw error;
    }
  },

  async deleteItemAsync(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
      await this.deleteChunks(key);
    } catch (error) {
      console.warn('SecureStore deleteItem failed:', error);
      throw error;
    }
  },

  async deleteChunks(key: string): Promise<void> {
    try {
      const chunkInfo = await SecureStore.getItemAsync(`${key}_chunks`);
      if (chunkInfo) {
        const chunkCount = parseInt(chunkInfo, 10);
        
        // Delete all chunks
        for (let i = 0; i < chunkCount; i++) {
          try {
            await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
          } catch (e) {
            // Ignore if chunk doesn't exist
          }
        }
        
        // Delete chunk info
        await SecureStore.deleteItemAsync(`${key}_chunks`);
      }
    } catch (error) {
      // Ignore errors during cleanup
    }
  }
};

// Unified storage interface
export const storage = Platform.OS === 'web' ? webStorage : nativeStorage;

// Legacy localStorage-like interface for backwards compatibility
export const legacyStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await storage.setItemAsync(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
      throw error;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await storage.getItemAsync(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await storage.deleteItemAsync(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.clear();
        }
      } else {
        // For native, we'd need to manually clear known keys
        // This is a simplified implementation
        console.warn('Clear all not implemented for native SecureStore');
      }
    } catch (error) {
      console.error('Storage clear error:', error);
      throw error;
    }
  }
};

export const storageKeys = {
  USER_ROLE: 'userRole',
  THEME: 'theme',
  LANGUAGE: 'language',
  ONBOARDING_COMPLETED: 'onboardingCompleted',
  SESSION_HISTORY: 'sessionHistory',
  TEMP_CAMERA_DOCUMENT: 'temp_camera_document',
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  SHARIAA_LANGUAGE: 'shariaa_language',
  SHARIAA_SESSIONS: 'shariaa_sessions',
  SHARIAA_SESSION_HISTORY: 'shariaa_session_history',
  SESSION_INTERACTIONS: 'shariaa_session_interactions',
  CURRENT_SESSION_ID: 'current_session_id',
  CURRENT_ANALYSIS_TERMS: 'current_analysis_terms',
  CURRENT_SESSION_DETAILS: 'current_session_details'
};
