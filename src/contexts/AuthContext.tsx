import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { STORAGE_KEYS } from "@/src/constants/storageKeys";

import {
  AuthContextType,
  AuthUser,
  UpdateProfileInput,
} from "@/src/types/auth";

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    onboardingCompleted,
    setOnboardingCompleted,
  ] = useState(false);

  const [pendingPhone, setPendingPhone] =
    useState<string | null>(null);

  useEffect(() => {
    restoreSession();
  }, []);

    const restoreSession = async () => {
  try {
    const [
      onboardingValue,
      token,
      userValue,
    ] = await Promise.all([
      AsyncStorage.getItem(
        STORAGE_KEYS.ONBOARDING_COMPLETED
      ),

      AsyncStorage.getItem(
        STORAGE_KEYS.AUTH_TOKEN
      ),

      AsyncStorage.getItem(
        STORAGE_KEYS.AUTH_USER
      ),
    ]);

    setOnboardingCompleted(
      onboardingValue === "true"
    );

    if (token && userValue) {
      const storedUser: AuthUser =
        JSON.parse(userValue);

      setUser(storedUser);
    }

    // Minimum splash duration
    await new Promise((resolve) =>
      setTimeout(resolve, 1800)
    );
  } catch (error) {
    console.error(
      "RESTORE AUTH SESSION ERROR:",
      error
    );
  } finally {
    setIsLoading(false);
  }
    };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ONBOARDING_COMPLETED,
        "true"
      );

      setOnboardingCompleted(true);
    } catch (error) {
      console.error(
        "COMPLETE ONBOARDING ERROR:",
        error
      );

      throw error;
    }
  };

  const login = async (phone: string) => {
    setPendingPhone(phone);

    console.log(
      "OTP SENT TO:",
      phone
    );
  };

  const verifyOtp = async (
    otp: string
  ): Promise<boolean> => {
    try {
      // DEMO OTP
      if (otp !== "123456") {
        return false;
      }

      if (!pendingPhone) {
        return false;
      }

      const authUser: AuthUser = {
        id: `user-${Date.now()}`,
        name: "LabourMate User",
        phone: pendingPhone,
      };

      const demoToken =
        `demo-token-${Date.now()}`;

      await Promise.all([
        AsyncStorage.setItem(
          STORAGE_KEYS.AUTH_TOKEN,
          demoToken
        ),

        AsyncStorage.setItem(
          STORAGE_KEYS.AUTH_USER,
          JSON.stringify(authUser)
        ),
      ]);

      setUser(authUser);

      setPendingPhone(null);

      return true;
    } catch (error) {
      console.error(
        "VERIFY OTP ERROR:",
        error
      );

      return false;
    }
  };

  const updateProfile = async (
    input: UpdateProfileInput
    ) => {
    try {
        if (!user) {
        throw new Error(
            "Authenticated user not found"
        );
        }

        const updatedUser: AuthUser = {
        ...user,
        name: input.name.trim(),
        };

        await AsyncStorage.setItem(
        STORAGE_KEYS.AUTH_USER,
        JSON.stringify(updatedUser)
        );

        setUser(updatedUser);
    } catch (error) {
        console.error(
        "UPDATE PROFILE ERROR:",
        error
        );

        throw error;
    }
};

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(
          STORAGE_KEYS.AUTH_TOKEN
        ),

        AsyncStorage.removeItem(
          STORAGE_KEYS.AUTH_USER
        ),
      ]);

      setUser(null);

      setPendingPhone(null);
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );

      throw error;
    }
  };
  
  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    onboardingCompleted,
    completeOnboarding,
    login,
    verifyOtp,
    updateProfile,
    logout,
    };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}