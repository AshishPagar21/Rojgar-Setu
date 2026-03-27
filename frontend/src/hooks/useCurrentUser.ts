import { useAuth } from "./useAuth";

export const useCurrentUser = () => {
  const { user, profile } = useAuth();

  return {
    user,
    profile,
  };
};
