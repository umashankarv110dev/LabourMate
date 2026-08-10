import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";

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

export default function LoginScreen() {
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidPhone = phone.length === 10;

  const handlePhoneChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");

    setPhone(cleanValue.slice(0, 10));
  };

  const handleSendOtp = async () => {
    if (!isValidPhone) {
      Alert.alert(
        "Invalid Mobile Number",
        "Please enter a valid 10-digit mobile number."
      );

      return;
    }

    try {
      Keyboard.dismiss();

      setLoading(true);

      await login(phone);

      router.push({
        pathname: "/(auth)/otp",
        params: {
          phone,
        },
      });
    } catch (error) {
      console.error("SEND OTP ERROR:", error);

      Alert.alert(
        "Unable to Send OTP",
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
            <View style={styles.brand}>
              <View style={styles.brandIcon}>
                <Ionicons
                  name="people"
                  size={23}
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
                <View style={styles.phoneIconContainer}>
                  <Ionicons
                    name="phone-portrait-outline"
                    size={48}
                    color={Colors.primary}
                  />
                </View>
              </View>

              <View style={styles.securityBadge}>
                <Ionicons
                  name="shield-checkmark"
                  size={21}
                  color="#16A34A"
                />
              </View>
            </View>

            <View style={styles.formContent}>
              <Text style={styles.title}>
                Welcome Back
              </Text>

              <Text style={styles.subtitle}>
                Enter your mobile number to securely
                access your LabourMate workspace.
              </Text>

              <Text style={styles.inputLabel}>
                MOBILE NUMBER
              </Text>

              <View
                style={[
                  styles.phoneContainer,
                  isValidPhone &&
                    styles.phoneContainerValid,
                ]}
              >
                <View style={styles.countryContainer}>
                  <Text style={styles.flag}>🇮🇳</Text>

                  <Text style={styles.countryCode}>
                    +91
                  </Text>
                </View>

                <View style={styles.inputDivider} />

                <TextInput
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder="Enter mobile number"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="number-pad"
                  maxLength={10}
                  style={styles.phoneInput}
                  autoFocus={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSendOtp}
                />

                {isValidPhone && (
                  <Ionicons
                    name="checkmark-circle"
                    size={21}
                    color="#16A34A"
                  />
                )}
              </View>

              <Text style={styles.helperText}>
                We'll send a 6-digit verification code
                to this number.
              </Text>

              <TouchableOpacity
                style={[
                  styles.otpButton,
                  !isValidPhone &&
                    styles.otpButtonDisabled,
                ]}
                disabled={!isValidPhone || loading}
                activeOpacity={0.85}
                onPress={handleSendOtp}
              >
                <Text style={styles.otpButtonText}>
                  {loading
                    ? "Sending OTP..."
                    : "Send OTP"}
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

              <View style={styles.secureContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={15}
                  color={Colors.textSecondary}
                />

                <Text style={styles.secureText}>
                  Your information is securely stored
                  and protected.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.termsText}>
              By continuing, you agree to our{" "}
              <Text style={styles.termsLink}>
                Terms of Service
              </Text>{" "}
              and{" "}
              <Text style={styles.termsLink}>
                Privacy Policy
              </Text>
              .
            </Text>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </SafeAreaView>
  );
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
    justifyContent: "center",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  brandName: {
    marginLeft: 11,
    fontSize: 18,
    fontWeight: "900",
    color: Colors.textPrimary,
  },

  content: {
    flex: 1,
  },

  illustration: {
    height: 230,
    alignItems: "center",
    justifyContent: "center",
  },

  largeCircle: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  phoneIconContainer: {
    width: 105,
    height: 105,
    borderRadius: 35,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 7,
  },

  securityBadge: {
    position: "absolute",
    right: "29%",
    bottom: 35,
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  formContent: {
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 29,
    fontWeight: "900",
    color: Colors.textPrimary,
    letterSpacing: -0.7,
  },

  subtitle: {
    marginTop: 9,
    maxWidth: 340,
    fontSize: 12,
    lineHeight: 20,
    color: Colors.textSecondary,
  },

  inputLabel: {
    marginTop: 27,
    marginBottom: 9,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    color: Colors.textSecondary,
  },

  phoneContainer: {
    height: 59,
    paddingHorizontal: 15,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
  },

  phoneContainerValid: {
    borderColor: "#86EFAC",
  },

  countryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  flag: {
    fontSize: 20,
  },

  countryCode: {
    marginLeft: 7,
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  inputDivider: {
    width: 1,
    height: 25,
    marginHorizontal: 13,
    backgroundColor: Colors.border,
  },

  phoneInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },

  helperText: {
    marginTop: 9,
    fontSize: 9,
    color: Colors.textSecondary,
  },

  otpButton: {
    marginTop: 25,
    height: 59,
    paddingLeft: 22,
    paddingRight: 8,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 7,
  },

  otpButtonDisabled: {
    opacity: 0.45,
  },

  otpButtonText: {
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

  secureContainer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  secureText: {
    marginLeft: 7,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  footer: {
    paddingHorizontal: 35,
    paddingBottom: 18,
  },

  termsText: {
    fontSize: 8,
    lineHeight: 14,
    textAlign: "center",
    color: Colors.textSecondary,
  },

  termsLink: {
    fontWeight: "800",
    color: Colors.primary,
  },
});