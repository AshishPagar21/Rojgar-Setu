import Constants from "expo-constants";
import { Platform } from "react-native";
import axios, { AxiosError, AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const resolveApiBaseUrl = () => {
  // Prefer environment variable injected by Expo (`EXPO_PUBLIC_API_BASE_URL`)
  const configuredUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    // fall back to app config extras (Expo) if available
    Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL ||
    Constants.manifest2?.extra?.EXPO_PUBLIC_API_BASE_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  // Default to backend running on port 5000 (local development)
  if (Platform.OS === "web") {
    return "http://localhost:5000/api";
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host) {
      return `http://${host}:5000/api`;
    }
  }

  // Android emulator localhost mapping
  return "http://10.0.2.2:5000/api";
};

const API_BASE_URL = resolveApiBaseUrl();

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          try {
            await AsyncStorage.removeItem("authToken");
            await AsyncStorage.removeItem("refreshToken");
          } catch {
            // ignore storage cleanup errors
          }
        }

        return Promise.reject(error);
      },
    );
  }

  async get<T>(url: string, config?: any) {
    return this.client.get<T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: any) {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T>(url: string, config?: any) {
    return this.client.delete<T>(url, config);
  }

  setAuthToken(token: string) {
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.client.defaults.headers.common["Authorization"];
  }
}

export const apiClient = new APIClient();
