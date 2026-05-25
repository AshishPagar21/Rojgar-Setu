import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== "undefined" && window.localStorage) {
      // Web environment
      window.localStorage.setItem(key, value);
    } else {
      // Native environment
      await AsyncStorage.setItem(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (typeof window !== "undefined" && window.localStorage) {
      // Web environment
      return window.localStorage.getItem(key);
    } else {
      // Native environment
      return await AsyncStorage.getItem(key);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (typeof window !== "undefined" && window.localStorage) {
      // Web environment
      window.localStorage.removeItem(key);
    } else {
      // Native environment
      await AsyncStorage.removeItem(key);
    }
  },

  async clear(): Promise<void> {
    if (typeof window !== "undefined" && window.localStorage) {
      // Web environment
      window.localStorage.clear();
    } else {
      // Native environment
      await AsyncStorage.clear();
    }
  },
};

// Auth-specific storage functions
export const authStorage = {
  async setToken(token: string): Promise<void> {
    await storage.setItem("authToken", token);
  },

  async getToken(): Promise<string | null> {
    return await storage.getItem("authToken");
  },

  async setRefreshToken(token: string): Promise<void> {
    await storage.setItem("refreshToken", token);
  },

  async getRefreshToken(): Promise<string | null> {
    return await storage.getItem("refreshToken");
  },

  async clearAuth(): Promise<void> {
    await storage.removeItem("authToken");
    await storage.removeItem("refreshToken");
    await storage.removeItem("user");
  },

  async setUser(user: any): Promise<void> {
    await storage.setItem("user", JSON.stringify(user));
  },

  async getUser(): Promise<any> {
    const user = await storage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};
