import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";

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

export default function ProfileScreen() {
  const {
    user,
    updateProfile,
  } = useAuth();

  const [name, setName] = useState("");
  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user]);

  const cleanName = name.trim();

  const isValid =
    cleanName.length >= 3;

  const hasChanges =
    cleanName !== (user?.name ?? "");

  const handleSave = async () => {
    if (!isValid) {
      Alert.alert(
        "Invalid Name",
        "Please enter at least 3 characters."
      );

      return;
    }

    try {
      Keyboard.dismiss();

      setLoading(true);

      await updateProfile({
        name: cleanName,
      });

      Alert.alert(
        "Profile Updated",
        "Your profile has been updated successfully.",
        [
          {
            text: "Done",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error(
        "SAVE PROFILE ERROR:",
        error
      );

      Alert.alert(
        "Update Failed",
        "Unable to update your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F6F8FC"
      />

      <Pressable
        style={styles.container}
        onPress={Keyboard.dismiss}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <Text style={styles.title}>
                My Profile
              </Text>

              <Text style={styles.subtitle}>
                Manage your account information
              </Text>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(cleanName)}
                </Text>
              </View>

              <Text style={styles.profileName}>
                {cleanName || "LabourMate User"}
              </Text>

              <Text style={styles.profilePhone}>
                +91 {formatPhone(user?.phone ?? "")}
              </Text>

              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="#16A34A"
                />

                <Text style={styles.verifiedText}>
                  Verified Mobile Number
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              PERSONAL INFORMATION
            </Text>

            <View style={styles.formCard}>
              <Text style={styles.label}>
                FULL NAME
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  isValid &&
                    styles.inputContainerValid,
                ]}
              >
                <View style={styles.inputIcon}>
                  <Ionicons
                    name="person-outline"
                    size={19}
                    color={Colors.primary}
                  />
                </View>

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor={
                    Colors.textLight
                  }
                  style={styles.input}
                  autoCapitalize="words"
                  maxLength={50}
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />

                {isValid && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#16A34A"
                  />
                )}
              </View>

              <Text style={styles.label}>
                MOBILE NUMBER
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  styles.disabledInput,
                ]}
              >
                <View style={styles.inputIcon}>
                  <Ionicons
                    name="call-outline"
                    size={19}
                    color={Colors.textSecondary}
                  />
                </View>

                <Text style={styles.phoneValue}>
                  +91 {formatPhone(user?.phone ?? "")}
                </Text>

                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color={Colors.textLight}
                />
              </View>

              <Text style={styles.phoneHelper}>
                Mobile number cannot be changed
                currently.
              </Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={21}
                  color="#2563EB"
                />
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>
                  Account Security
                </Text>

                <Text style={styles.infoText}>
                  Your profile information is stored
                  securely on this device.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!isValid ||
                  !hasChanges ||
                  loading) &&
                  styles.saveButtonDisabled,
              ]}
              disabled={
                !isValid ||
                !hasChanges ||
                loading
              }
              activeOpacity={0.85}
              onPress={handleSave}
            >
              <Text style={styles.saveText}>
                {loading
                  ? "Saving Changes..."
                  : "Save Changes"}
              </Text>

              {!loading && (
                <View style={styles.saveIcon}>
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={Colors.primary}
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </SafeAreaView>
  );
}

function getInitials(name: string) {
  if (!name.trim()) {
    return "LM";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((item) => item.charAt(0))
    .join("")
    .toUpperCase();
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
    backgroundColor: "#F6F8FC",
  },

  header: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  headerContent: {
    flex: 1,
    marginLeft: 13,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 9,
    color: Colors.textSecondary,
  },

  content: {
    flex: 1,
    paddingHorizontal: 18,
  },

  profileCard: {
    marginTop: 5,
    paddingVertical: 25,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor:
      "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 25,
    fontWeight: "900",
    color: Colors.white,
  },

  profileName: {
    marginTop: 13,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.white,
  },

  profilePhone: {
    marginTop: 5,
    fontSize: 9,
    color: "#BFDBFE",
  },

  verifiedBadge: {
    marginTop: 11,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
  },

  verifiedText: {
    marginLeft: 5,
    fontSize: 7,
    fontWeight: "700",
    color: "#16A34A",
  },

  sectionTitle: {
    marginTop: 25,
    marginBottom: 9,
    marginLeft: 4,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    color: Colors.textSecondary,
  },

  formCard: {
    padding: 17,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  label: {
    marginBottom: 8,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: Colors.textSecondary,
  },

  inputContainer: {
    height: 57,
    marginBottom: 20,
    paddingHorizontal: 13,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
  },

  inputContainerValid: {
    borderColor: "#86EFAC",
  },

  disabledInput: {
    marginBottom: 0,
    backgroundColor: "#F8FAFC",
  },

  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  input: {
    flex: 1,
    marginHorizontal: 11,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },

  phoneValue: {
    flex: 1,
    marginHorizontal: 11,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },

  phoneHelper: {
    marginTop: 8,
    fontSize: 8,
    color: Colors.textLight,
  },

  infoCard: {
    marginTop: 15,
    padding: 15,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,
    marginLeft: 11,
  },

  infoTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  infoText: {
    marginTop: 4,
    fontSize: 8,
    lineHeight: 13,
    color: Colors.textSecondary,
  },

  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
  },

  saveButton: {
    height: 59,
    paddingLeft: 22,
    paddingRight: 8,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 6,
  },

  saveButtonDisabled: {
    opacity: 0.45,
  },

  saveText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.white,
  },

  saveIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});