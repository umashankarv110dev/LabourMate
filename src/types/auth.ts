export type AuthUser = {
  id: string;
  name: string;
  phone: string;
};

export type UpdateProfileInput = {
  name: string;
};

export type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onboardingCompleted: boolean;
  
  completeOnboarding: () => Promise<void>;
  login: (
    phone: string
  ) => Promise<void>;

  verifyOtp: (
    otp: string
  ) => Promise<boolean>;

  updateProfile: (
    input: UpdateProfileInput
  ) => Promise<void>;

  logout: () => Promise<void>;
};