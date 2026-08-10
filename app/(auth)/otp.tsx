import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/contexts/AuthContext";

const OTP_LENGTH = 6;
const RESEND_TIME = 30;

export default function OtpScreen() {
  const {
    verifyOtp,
    login,
  } = useAuth();

  const params = useLocalSearchParams<{
    phone?: string;
  }>();

  const phone = params.phone ?? "";

  const inputRefs = useRef<
    Array<TextInput | null>
  >([]);

  const [otp, setOtp] = useState<string[]>(
    Array(OTP_LENGTH).fill("")
  );

  const [timer, setTimer] =
    useState(RESEND_TIME);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const otpValue = otp.join("");

  const isOtpComplete =
    otpValue.length === OTP_LENGTH;

  useEffect(() => {
    if (timer <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimer((value) => value - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 400);

    return () => clearTimeout(timeout);
  }, []);

  const handleOtpChange = (
    value: string,
    index: number
  ) => {
    setError("");

    const cleanValue = value.replace(
      /\D/g,
      ""
    );

    // Handle OTP paste
    if (cleanValue.length > 1) {
      const pastedOtp = cleanValue
        .slice(0, OTP_LENGTH)
        .split("");

      const newOtp = Array(
        OTP_LENGTH
      ).fill("");

      pastedOtp.forEach(
        (digit, digitIndex) => {
          newOtp[digitIndex] = digit;
        }
      );

      setOtp(newOtp);

      const focusIndex = Math.min(
        pastedOtp.length,
        OTP_LENGTH - 1
      );

      inputRefs.current[
        focusIndex
      ]?.focus();

      return;
    }

    const newOtp = [...otp];

    newOtp[index] = cleanValue;

    setOtp(newOtp);

    if (
      cleanValue &&
      index < OTP_LENGTH - 1
    ) {
      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  const handleKeyPress = (
    key: string,
    index: number
  ) => {
    if (
      key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    if (!isOtpComplete) {
      setError(
        "Please enter the complete 6-digit OTP."
      );

      return;
    }

    try {
      Keyboard.dismiss();

      setLoading(true);
      setError("");

      const success =
        await verifyOtp(otpValue);

      if (!success) {
        setError(
          "Invalid OTP. Please enter the correct verification code."
        );

        setOtp(
          Array(OTP_LENGTH).fill("")
        );

        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 150);

        return;
      }

      router.replace("/(tabs)");
    } catch (error) {
      console.error(
        "VERIFY OTP ERROR:",
        error
      );

      Alert.alert(
        "Verification Failed",
        "Unable to verify OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) {
      return;
    }

    try {
      setError("");

      await login(phone);

      setOtp(
        Array(OTP_LENGTH).fill("")
      );

      setTimer(RESEND_TIME);

      inputRefs.current[0]?.focus();

      Alert.alert(
        "OTP Sent",
        "A new verification code has been sent to your mobile number."
      );
    } catch (error) {
      console.error(
        "RESEND OTP ERROR:",
        error
      );

      Alert.alert(
        "Unable to Send OTP",
        "Please try again."
      );
    }
  };

  const handleChangeNumber = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8FAFC"
      />

      <Pressable
        style={styles.container}
        onPress={Keyboard.dismiss}
      >
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleChangeNumber}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>

            <View style={styles.brand}>
              <View style={styles.brandIcon}>
                <Ionicons
                  name="people"
                  size={18}
                  color={Colors.white}
                />
              </View>

              <Text style={styles.brandName}>
                LabourMate
              </Text>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.illustration}>
              <View style={styles.largeCircle}>
                <View style={styles.messageIcon}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={48}
                    color={Colors.primary}
                  />
                </View>
              </View>

              <View style={styles.lockBadge}>
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color="#16A34A"
                />
              </View>
            </View>

            <View style={styles.formContent}>
              <Text style={styles.title}>
                Verify Your Number
              </Text>

              <Text style={styles.subtitle}>
                We've sent a 6-digit verification
                code to
              </Text>

              <View style={styles.phoneRow}>
                <Text style={styles.phoneText}>
                  +91 {formatPhone(phone)}
                </Text>

                <TouchableOpacity
                  onPress={handleChangeNumber}
                >
                  <Text style={styles.changeText}>
                    Change
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] =
                        ref;
                    }}
                    value={digit}
                    onChangeText={(value) =>
                      handleOtpChange(
                        value,
                        index
                      )
                    }
                    onKeyPress={({ nativeEvent }) =>
                      handleKeyPress(
                        nativeEvent.key,
                        index
                      )
                    }
                    keyboardType="number-pad"
                    maxLength={
                      index === 0
                        ? OTP_LENGTH
                        : 1
                    }
                    selectTextOnFocus
                    style={[
                      styles.otpInput,

                      digit &&
                        styles.otpInputFilled,

                      error &&
                        styles.otpInputError,
                    ]}
                  />
                ))}
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={15}
                    color="#DC2626"
                  />

                  <Text style={styles.errorText}>
                    {error}
                  </Text>
                </View>
              ) : (
                <View style={styles.helperContainer}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={15}
                    color="#16A34A"
                  />

                  <Text style={styles.helperText}>
                    Enter the verification code
                    received via SMS.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.verifyButton,

                  !isOtpComplete &&
                    styles.verifyButtonDisabled,
                ]}
                disabled={
                  !isOtpComplete || loading
                }
                activeOpacity={0.85}
                onPress={handleVerifyOtp}
              >
                <Text style={styles.verifyText}>
                  {loading
                    ? "Verifying..."
                    : "Verify & Continue"}
                </Text>

                {!loading && (
                  <View style={styles.buttonIcon}>
                    <Ionicons
                      name="arrow-forward"
                      size={19}
                      color={Colors.primary}
                    />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <Text style={styles.resendLabel}>
                  Didn't receive the code?
                </Text>

                {timer > 0 ? (
                  <Text style={styles.timerText}>
                    Resend in 00:
                    {String(timer).padStart(
                      2,
                      "0"
                    )}
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleResendOtp}
                  >
                    <Text style={styles.resendText}>
                      Resend OTP
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.demoContainer}>
                <Ionicons
                  name="code-slash-outline"
                  size={16}
                  color="#D97706"
                />

                <View style={styles.demoContent}>
                  <Text style={styles.demoLabel}>
                    DEVELOPMENT MODE
                  </Text>

                  <Text style={styles.demoText}>
                    Use OTP{" "}
                    <Text style={styles.demoOtp}>
                      123456
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </SafeAreaView>
  );
}

function formatPhone(phone: string) {
  if (phone.length !== 10) {
    return phone;
  }

  return `${phone.slice(
    0,
    5
  )} ${phone.slice(5)}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  keyboardContainer: {
    flex: 1,
  },

  header: {
    height: 70,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  brand: {
    marginLeft: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  brandIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  brandName: {
    marginLeft: 9,
    fontSize: 16,
    fontWeight: "900",
    color: Colors.textPrimary,
  },

  content: {
    flex: 1,
  },

  illustration: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },

  largeCircle: {
    width: 185,
    height: 185,
    borderRadius: 93,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  messageIcon: {
    width: 105,
    height: 105,
    borderRadius: 35,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 7,
  },

  lockBadge: {
    position: "absolute",
    right: "29%",
    bottom: 32,
    width: 49,
    height: 49,
    borderRadius: 16,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  formContent: {
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.textPrimary,
    letterSpacing: -0.7,
  },

  subtitle: {
    marginTop: 9,
    fontSize: 12,
    color: Colors.textSecondary,
  },

  phoneRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },

  phoneText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  changeText: {
    marginLeft: 12,
    fontSize: 10,
    fontWeight: "800",
    color: Colors.primary,
  },

  otpContainer: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 7,
  },

  otpInput: {
    flex: 1,
    height: 57,
    maxWidth: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: "#EFF6FF",
  },

  otpInputError: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },

  helperContainer: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  helperText: {
    marginLeft: 7,
    fontSize: 9,
    color: Colors.textSecondary,
  },

  errorContainer: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  errorText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 9,
    lineHeight: 14,
    color: "#DC2626",
  },

  verifyButton: {
    marginTop: 26,
    height: 59,
    paddingLeft: 22,
    paddingRight: 8,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 7,
  },

  verifyButtonDisabled: {
    opacity: 0.45,
  },

  verifyText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.white,
  },

  buttonIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  resendContainer: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  resendLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },

  timerText: {
    marginLeft: 6,
    fontSize: 10,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  resendText: {
    marginLeft: 6,
    fontSize: 10,
    fontWeight: "800",
    color: Colors.primary,
  },

  demoContainer: {
    marginTop: 25,
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#FFFBEB",
    flexDirection: "row",
    alignItems: "center",
  },

  demoContent: {
    marginLeft: 10,
  },

  demoLabel: {
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#D97706",
  },

  demoText: {
    marginTop: 3,
    fontSize: 9,
    color: Colors.textSecondary,
  },

  demoOtp: {
    fontWeight: "900",
    color: "#D97706",
  },
});