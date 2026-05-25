import { storage } from "../../services/storage";
import type { AuthProfile, User } from "../../types";
import { STORAGE_KEYS } from "../../utils/constants";

const getToken = async (): Promise<string | null> => {
  return storage.getItem(STORAGE_KEYS.token);
};

const getUser = async (): Promise<User | null> => {
  const value = await storage.getItem(STORAGE_KEYS.user);
  return value ? (JSON.parse(value) as User) : null;
};

const getProfile = async (): Promise<AuthProfile | null> => {
  const value = await storage.getItem(STORAGE_KEYS.profile);
  return value ? (JSON.parse(value) as AuthProfile) : null;
};

const setAuth = async (
  token: string,
  user: User,
  profile: AuthProfile,
): Promise<void> => {
  await storage.setItem(STORAGE_KEYS.token, token);
  await storage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  await storage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
};

const clearAuth = async (): Promise<void> => {
  await storage.removeItem(STORAGE_KEYS.token);
  await storage.removeItem(STORAGE_KEYS.user);
  await storage.removeItem(STORAGE_KEYS.profile);
};

export const authStorage = {
  getToken,
  getUser,
  getProfile,
  setAuth,
  clearAuth,
};
