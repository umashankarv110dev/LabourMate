import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { getActiveSites } from "@/src/repositories/siteRepository";
import {
  getWorkerById,
  updateWorker,
} from "@/src/repositories/workerRepository";
import { Site } from "@/src/types/site";

const workerTypes = [
  "Mason",
  "Helper",
  "Painter",
  "Electrician",
  "Carpenter",
];

export default function EditWorkerScreen() {
  const db = useSQLiteContext();

  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [workerType, setWorkerType] =
    useState("Mason");

  const [paymentType, setPaymentType] =
    useState<"daily" | "monthly">("daily");

  const [wage, setWage] = useState("");
  const [address, setAddress] = useState("");
  const [joiningDate, setJoiningDate] =
    useState("");

  const [sites, setSites] = useState<Site[]>([]);

  const [siteId, setSiteId] = useState<
    string | undefined
  >();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [worker, siteData] =
        await Promise.all([
          getWorkerById(db, id),
          getActiveSites(db),
        ]);

      setSites(siteData);

      if (!worker) {
        Alert.alert(
          "Error",
          "Worker not found"
        );

        router.back();

        return;
      }

      setName(worker.name);
      setPhone(worker.phone || "");
      setWorkerType(worker.worker_type);
      setPaymentType(worker.payment_type);
      setWage(String(worker.wage));
      setSiteId(worker.site_id || undefined);
      setJoiningDate(worker.joining_date || "");
      setAddress(worker.address || "");
    } catch (error) {
      console.error(
        "LOAD EDIT WORKER ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to load worker"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
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
        "Please enter valid wage"
      );

      return;
    }

    try {
      setSaving(true);

      await updateWorker(db, id, {
        name,
        phone,
        workerType,
        paymentType,
        wage: wageAmount,
        siteId,
        joiningDate,
        address,
      });

      Alert.alert(
        "Success",
        "Worker updated successfully",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error(
        "UPDATE WORKER ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to update worker"
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
          style={styles.back}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Edit Worker
        </Text>

        <View style={styles.space} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AppInput
          label="Full Name *"
          icon="person-outline"
          value={name}
          onChangeText={setName}
        />

        <AppInput
          label="Mobile Number"
          icon="call-outline"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={10}
        />

        <Text style={styles.label}>
          Worker Type
        </Text>

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

        <Text style={styles.label}>
          Payment Type
        </Text>

        <View style={styles.paymentRow}>
          {(["daily", "monthly"] as const).map(
            (item) => {
              const selected =
                paymentType === item;

              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.paymentOption,
                    selected &&
                      styles.selectedPayment,
                  ]}
                  onPress={() =>
                    setPaymentType(item)
                  }
                >
                  <Ionicons
                    name={
                      selected
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={20}
                    color={
                      selected
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
              );
            }
          )}
        </View>

        <AppInput
          label={
            paymentType === "daily"
              ? "Daily Wage *"
              : "Monthly Salary *"
          }
          icon="cash-outline"
          value={wage}
          onChangeText={setWage}
          keyboardType="numeric"
        />

        <Text style={styles.label}>
          Select Site
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.siteList}
        >
          <TouchableOpacity
            style={[
              styles.siteOption,
              !siteId && styles.selectedSite,
            ]}
            onPress={() => setSiteId(undefined)}
          >
            <Text
              style={[
                styles.siteText,
                !siteId &&
                  styles.selectedSiteText,
              ]}
            >
              No Site
            </Text>
          </TouchableOpacity>

          {sites.map((site) => {
            const selected =
              site.id === siteId;

            return (
              <TouchableOpacity
                key={site.id}
                style={[
                  styles.siteOption,
                  selected &&
                    styles.selectedSite,
                ]}
                onPress={() =>
                  setSiteId(site.id)
                }
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

        <AppInput
          label="Joining Date"
          icon="calendar-outline"
          value={joiningDate}
          onChangeText={setJoiningDate}
          placeholder="YYYY-MM-DD"
        />

        <AppInput
          label="Address"
          icon="location-outline"
          value={address}
          onChangeText={setAddress}
          multiline
        />

        <AppButton
          title="Update Worker"
          icon="checkmark-circle-outline"
          loading={saving}
          onPress={handleUpdate}
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

  back: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  space: {
    width: 44,
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    padding: 20,
    paddingBottom: 50,
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
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },

  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
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
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  selectedPayment: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
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
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },

  selectedSite: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },

  siteText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },

  selectedSiteText: {
    color: Colors.white,
  },
});