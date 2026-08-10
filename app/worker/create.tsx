import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import AppButton from "@/src/components/AppButton";
import AppInput from "@/src/components/AppInput";

import { Colors } from "@/src/constants/colors";

import {
  getActiveSites,
} from "@/src/repositories/siteRepository";

import {
  createWorker,
} from "@/src/repositories/workerRepository";

import { Site } from "@/src/types/site";

const workerTypes = [
  "Mason",
  "Helper",
  "Painter",
  "Electrician",
  "Carpenter",
];

export default function CreateWorkerScreen() {
  const db = useSQLiteContext();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [workerType, setWorkerType] =
    useState("Mason");

  const [paymentType, setPaymentType] =
    useState<"daily" | "monthly">("daily");

  const [wage, setWage] = useState("");
  const [address, setAddress] = useState("");

  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState<string>();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    const data = await getActiveSites(db);

    setSites(data);

    if (data.length > 0) {
      setSiteId(data[0].id);
    }
  };

  const saveWorker = async () => {
    if (!name.trim()) {
      Alert.alert(
        "Required",
        "Please enter worker name"
      );

      return;
    }

    const wageAmount = Number(wage);

    if (!wage || wageAmount <= 0) {
      Alert.alert(
        "Invalid Wage",
        "Please enter valid wage amount"
      );

      return;
    }

    try {
      setLoading(true);

      await createWorker(db, {
        name,
        phone,
        workerType,
        paymentType,
        wage: wageAmount,
        siteId,
        address,
        joiningDate: new Date()
          .toISOString()
          .split("T")[0],
      });

      Alert.alert(
        "Success",
        "Worker added successfully",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("SAVE WORKER ERROR:", error);

      Alert.alert(
        "Error",
        "Unable to save worker"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Add Worker
        </Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.photo}>
          <Ionicons
            name="camera-outline"
            size={28}
            color={Colors.primary}
          />
        </View>

        <Text style={styles.photoText}>
          Add Worker Photo
        </Text>

        <AppInput
          label="Full Name *"
          icon="person-outline"
          placeholder="Enter worker name"
          value={name}
          onChangeText={setName}
        />

        <AppInput
          label="Mobile Number"
          icon="call-outline"
          placeholder="Enter mobile number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={10}
        />

        <Text style={styles.label}>Worker Type</Text>

        <View style={styles.options}>
          {workerTypes.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.option,
                workerType === item &&
                  styles.selectedOption,
              ]}
              onPress={() => setWorkerType(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  workerType === item &&
                    styles.selectedOptionText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Payment Type</Text>

        <View style={styles.paymentRow}>
          {(["daily", "monthly"] as const).map(
            (item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.paymentOption,
                  paymentType === item &&
                    styles.selectedPayment,
                ]}
                onPress={() => setPaymentType(item)}
              >
                <Ionicons
                  name={
                    paymentType === item
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={
                    paymentType === item
                      ? Colors.primary
                      : Colors.textLight
                  }
                />

                <Text style={styles.paymentText}>
                  {item === "daily"
                    ? "Daily"
                    : "Monthly"}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <AppInput
          label={
            paymentType === "daily"
              ? "Daily Wage *"
              : "Monthly Salary *"
          }
          icon="cash-outline"
          placeholder="Enter amount"
          value={wage}
          onChangeText={setWage}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Select Site</Text>

        {sites.length === 0 ? (
          <TouchableOpacity
            style={styles.noSite}
            onPress={() => router.push("/site/create")}
          >
            <Ionicons
              name="add-circle-outline"
              size={22}
              color={Colors.primary}
            />

            <Text style={styles.noSiteText}>
              No site found. Create Site
            </Text>
          </TouchableOpacity>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.siteList}
          >
            {sites.map((site) => {
              const selected = siteId === site.id;

              return (
                <TouchableOpacity
                  key={site.id}
                  style={[
                    styles.siteOption,
                    selected &&
                      styles.selectedSiteOption,
                  ]}
                  onPress={() => setSiteId(site.id)}
                >
                  <Text
                    style={[
                      styles.siteText,
                      selected &&
                        styles.selectedSiteText,
                    ]}
                  >
                    {site.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <AppInput
          label="Address"
          icon="location-outline"
          placeholder="Enter worker address"
          value={address}
          onChangeText={setAddress}
          multiline
          style={styles.addressInput}
        />

        <AppButton
          title="Save Worker"
          icon="checkmark-circle-outline"
          loading={loading}
          onPress={saveWorker}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    height: 65,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  headerSpace: {
    width: 44,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  photo: {
    alignSelf: "center",
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  photoText: {
    marginTop: 9,
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "700",
    color: Colors.primary,
  },

  label: {
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  options: {
    marginBottom: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  option: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  selectedOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  optionText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },

  selectedOptionText: {
    color: Colors.white,
  },

  paymentRow: {
    marginBottom: 22,
    flexDirection: "row",
    gap: 12,
  },

  paymentOption: {
    flex: 1,
    height: 55,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  selectedPayment: {
    borderColor: Colors.primary,
  },

  paymentText: {
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  siteList: {
    marginBottom: 22,
  },

  siteOption: {
    marginRight: 9,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  selectedSiteOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  siteText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },

  selectedSiteText: {
    color: Colors.white,
  },

  noSite: {
    marginBottom: 22,
    padding: 17,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  noSiteText: {
    fontWeight: "700",
    color: Colors.primary,
  },

  addressInput: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 14,
  },
});