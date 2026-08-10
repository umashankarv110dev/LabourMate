import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCompany } from "@/src/contexts/CompanyContext";

import {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";

import {
  getCompany,
  saveCompany,
} from "@/src/repositories/companyRepository";

export default function CompanyScreen() {
  const db = useSQLiteContext();

  const [name, setName] = useState("");
  const [ownerName, setOwnerName] =
    useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] =
    useState("");
  const [logo, setLogo] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

    const { refreshCompany } = useCompany();
  const loadCompany = async () => {
    try {
      setLoading(true);

      const company = await getCompany(db);

      if (company) {
        setName(company.name);
        setOwnerName(company.owner_name ?? "");
        setPhone(company.phone ?? "");
        setAddress(company.address ?? "");
        setLogo(company.logo);
      }
    } catch (error) {
      console.error(
        "LOAD COMPANY ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCompany();
    }, [])
  );

  const pickLogo = async () => {
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

    if (!result.canceled) {
      setLogo(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (name.trim().length < 2) {
      Alert.alert(
        "Company Name Required",
        "Please enter a valid company name."
      );

      return;
    }

    if (
      phone.length > 0 &&
      phone.length !== 10
    ) {
      Alert.alert(
        "Invalid Phone",
        "Please enter a valid 10-digit mobile number."
      );

      return;
    }

    try {
      setSaving(true);

      await saveCompany(db, {
        name,
        owner_name: ownerName,
        phone,
        address,
        logo,
      });
        await refreshCompany();

      Alert.alert(
        "Company Saved",
        "Company profile updated successfully.",
        [
          {
            text: "Done",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error(
        "SAVE COMPANY ERROR:",
        error
      );

      Alert.alert(
        "Save Failed",
        "Unable to save company profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color={Colors.primary}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
            Company Profile
          </Text>

          <Text style={styles.subtitle}>
            Manage your business information
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoCard}>
            <TouchableOpacity
              style={styles.logoContainer}
              activeOpacity={0.8}
              onPress={pickLogo}
            >
              {logo ? (
                <Image
                  source={{ uri: logo }}
                  style={styles.logo}
                />
              ) : (
                <Ionicons
                  name="business-outline"
                  size={38}
                  color={Colors.primary}
                />
              )}

              <View style={styles.cameraButton}>
                <Ionicons
                  name="camera"
                  size={15}
                  color={Colors.white}
                />
              </View>
            </TouchableOpacity>

            <Text style={styles.logoTitle}>
              Company Logo
            </Text>

            <Text style={styles.logoSubtitle}>
              Tap to upload your business logo
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            BUSINESS INFORMATION
          </Text>

          <View style={styles.formCard}>
            <CompanyInput
              label="COMPANY NAME"
              icon="business-outline"
              placeholder="Enter company name"
              value={name}
              onChangeText={setName}
            />

            <CompanyInput
              label="OWNER NAME"
              icon="person-outline"
              placeholder="Enter owner name"
              value={ownerName}
              onChangeText={setOwnerName}
            />

            <CompanyInput
              label="PHONE NUMBER"
              icon="call-outline"
              placeholder="Enter mobile number"
              value={phone}
              onChangeText={(value) =>
                setPhone(
                  value
                    .replace(/\D/g, "")
                    .slice(0, 10)
                )
              }
              keyboardType="number-pad"
            />

            <CompanyInput
              label="BUSINESS ADDRESS"
              icon="location-outline"
              placeholder="Enter company address"
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </View>

          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color={Colors.primary}
            />

            <Text style={styles.infoText}>
              Company details can later be used in
              reports, payment receipts and exported
              documents.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              saving && styles.disabledButton,
            ]}
            disabled={saving}
            activeOpacity={0.85}
            onPress={handleSave}
          >
            <Text style={styles.saveText}>
              {saving
                ? "Saving Company..."
                : "Save Company Profile"}
            </Text>

            {!saving && (
              <View style={styles.saveIcon}>
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={Colors.primary}
                />
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CompanyInput({
  label,
  icon,
  ...props
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,
          props.multiline &&
            styles.multilineContainer,
        ]}
      >
        <View style={styles.inputIcon}>
          <Ionicons
            name={icon}
            size={19}
            color={Colors.primary}
          />
        </View>

        <TextInput
          {...props}
          placeholderTextColor={Colors.textLight}
          style={[
            styles.input,
            props.multiline &&
              styles.multilineInput,
          ]}
          textAlignVertical={
            props.multiline ? "top" : "center"
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },

  flex: {
    flex: 1,
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    paddingHorizontal: 18,
    paddingBottom: 45,
  },

  logoCard: {
    paddingVertical: 24,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: "center",
  },

  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
  },

  cameraButton: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  logoTitle: {
    marginTop: 13,
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  logoSubtitle: {
    marginTop: 4,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  sectionTitle: {
    marginTop: 24,
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

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    marginBottom: 8,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: Colors.textSecondary,
  },

  inputContainer: {
    minHeight: 57,
    paddingHorizontal: 13,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
  },

  multilineContainer: {
    minHeight: 105,
    alignItems: "flex-start",
    paddingTop: 11,
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
    color: Colors.textPrimary,
  },

  multilineInput: {
    minHeight: 75,
    paddingTop: 8,
  },

  infoCard: {
    marginTop: 15,
    padding: 15,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
  },

  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 8,
    lineHeight: 14,
    color: Colors.textSecondary,
  },

  saveButton: {
    marginTop: 20,
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

  disabledButton: {
    opacity: 0.5,
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