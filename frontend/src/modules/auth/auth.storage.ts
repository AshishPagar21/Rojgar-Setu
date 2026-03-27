import type { AuthProfile, User } from "../../types/common.types";
import { storage } from "../../services/storage";
import { STORAGE_KEYS } from "../../utils/constants";

const getToken = (): string | null => storage.get<string>(STORAGE_KEYS.token);
const getUser = (): User | null => storage.get<User>(STORAGE_KEYS.user);
const getProfile = (): AuthProfile | null =>
  storage.get<AuthProfile>(STORAGE_KEYS.profile);

const setAuth = (token: string, user: User, profile: AuthProfile): void => {
  storage.set(STORAGE_KEYS.token, token);
  storage.set(STORAGE_KEYS.user, user);
  storage.set(STORAGE_KEYS.profile, profile);
};

const clearAuth = (): void => {
  storage.remove(STORAGE_KEYS.token);
  storage.remove(STORAGE_KEYS.user);
  storage.remove(STORAGE_KEYS.profile);
};

export const authStorage = {
  getToken,
  getUser,
  getProfile,
  setAuth,
  clearAuth,
};
