import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";

const SETTINGS_KEYS = {
  notifications: "@labourmate/notifications",
  attendanceReminder: "@labourmate/attendance_reminder",
  paymentReminder: "@labourmate/payment_reminder",
};

export default function SettingsScreen() {
  const [notifications, setNotifications] =
    useState(true);

  const [
    attendanceReminder,
    setAttendanceReminder,
  ] = useState(true);

  const [
    paymentReminder,
    setPaymentReminder,
  ] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [
        notificationValue,
        attendanceValue,
        paymentValue,
      ] = await Promise.all([
        AsyncStorage.getItem(
          SETTINGS_KEYS.notifications
        ),

        AsyncStorage.getItem(
          SETTINGS_KEYS.attendanceReminder
        ),

        AsyncStorage.getItem(
          SETTINGS_KEYS.paymentReminder
        ),
      ]);

      if (notificationValue !== null) {
        setNotifications(
          notificationValue === "true"
        );
      }

      if (attendanceValue !== null) {
        setAttendanceReminder(
          attendanceValue === "true"
        );
      }

      if (paymentValue !== null) {
        setPaymentReminder(
          paymentValue === "true"
        );
      }
    } catch (error) {
      console.error(
        "LOAD SETTINGS ERROR:",
        error
      );
    }
  };

  const updateSetting = async (
    key: string,
    value: boolean,
    setter: (value: boolean) => void
  ) => {
    try {
      setter(value);

      await AsyncStorage.setItem(
        key,
        String(value)
      );
    } catch (error) {
      console.error(
        "UPDATE SETTING ERROR:",
        error
      );
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "Restore all app settings to their default values?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await Promise.all([
              AsyncStorage.removeItem(
                SETTINGS_KEYS.notifications
              ),

              AsyncStorage.removeItem(
                SETTINGS_KEYS.attendanceReminder
              ),

              AsyncStorage.removeItem(
                SETTINGS_KEYS.paymentReminder
              ),
            ]);

            setNotifications(true);
            setAttendanceReminder(true);
            setPaymentReminder(true);

            Alert.alert(
              "Settings Reset",
              "Default settings have been restored."
            );
          },
        },
      ]
    );
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

        <View style={styles.headerContent}>
          <Text style={styles.title}>
            App Settings
          </Text>

          <Text style={styles.subtitle}>
            Manage LabourMate preferences
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <SectionTitle title="NOTIFICATIONS" />

        <View style={styles.card}>
          <SettingSwitch
            icon="notifications-outline"
            title="Notifications"
            subtitle="Allow LabourMate notifications"
            value={notifications}
            onValueChange={(value) =>
              updateSetting(
                SETTINGS_KEYS.notifications,
                value,
                setNotifications
              )
            }
          />

          <Divider />

          <SettingSwitch
            icon="calendar-outline"
            title="Attendance Reminder"
            subtitle="Remind me to mark daily attendance"
            value={attendanceReminder}
            disabled={!notifications}
            onValueChange={(value) =>
              updateSetting(
                SETTINGS_KEYS.attendanceReminder,
                value,
                setAttendanceReminder
              )
            }
          />

          <Divider />

          <SettingSwitch
            icon="wallet-outline"
            title="Payment Reminder"
            subtitle="Remind me about pending payments"
            value={paymentReminder}
            disabled={!notifications}
            onValueChange={(value) =>
              updateSetting(
                SETTINGS_KEYS.paymentReminder,
                value,
                setPaymentReminder
              )
            }
          />
        </View>

        <SectionTitle title="GENERAL" />

        <View style={styles.card}>
          <SettingItem
            icon="language-outline"
            title="Language"
            subtitle="English"
            onPress={() =>
              Alert.alert(
                "Language",
                "Hindi and Marathi language support will be added later."
              )
            }
          />

          <Divider />

          <SettingItem
            icon="cash-outline"
            title="Currency"
            subtitle="Indian Rupee (₹)"
            onPress={() =>
              Alert.alert(
                "Currency",
                "LabourMate currently uses Indian Rupee (₹)."
              )
            }
          />

          <Divider />

          <SettingItem
            icon="calendar-number-outline"
            title="Date Format"
            subtitle="DD/MM/YYYY"
            onPress={() =>
              Alert.alert(
                "Date Format",
                "Current date format is DD/MM/YYYY."
              )
            }
          />
        </View>

        <SectionTitle title="DATA & STORAGE" />

        <View style={styles.card}>
          <SettingItem
            icon="cloud-upload-outline"
            title="Backup & Restore"
            subtitle="Protect your LabourMate data"
            onPress={() =>
              router.push("/settings/backup")
            }
          />

          <Divider />

          <SettingItem
            icon="download-outline"
            title="Export Data"
            subtitle="Export workers and records"
            onPress={() =>
              router.push("/settings/export")
            }
          />
        </View>

        <SectionTitle title="RESET" />

        <View style={styles.card}>
          <SettingItem
            icon="refresh-outline"
            title="Reset App Settings"
            subtitle="Restore default preferences"
            danger
            onPress={handleResetSettings}
          />
        </View>

        <Text style={styles.footerText}>
          Settings are stored securely on your device.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingSwitch({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View
      style={[
        styles.settingItem,
        disabled && styles.disabledItem,
      ]}
    >
      <View style={styles.settingIcon}>
        <Ionicons
          name={icon}
          size={21}
          color={Colors.primary}
        />
      </View>

      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>
          {title}
        </Text>

        <Text style={styles.settingSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: "#CBD5E1",
          true: "#93C5FD",
        }}
        thumbColor={
          value ? Colors.primary : "#F8FAFC"
        }
      />
    </View>
  );
}

function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View
        style={[
          styles.settingIcon,
          danger && styles.dangerIcon,
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={
            danger ? "#DC2626" : Colors.primary
          }
        />
      </View>

      <View style={styles.settingContent}>
        <Text
          style={[
            styles.settingTitle,
            danger && styles.dangerText,
          ]}
        >
          {title}
        </Text>

        <Text style={styles.settingSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={17}
        color={Colors.textLight}
      />
    </TouchableOpacity>
  );
}

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <Text style={styles.sectionTitle}>
      {title}
    </Text>
  );
}

function Divider() {
  return <View style={styles.divider} />;
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

  backButton: {
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

  sectionTitle: {
    marginTop: 18,
    marginBottom: 9,
    marginLeft: 4,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    color: Colors.textSecondary,
  },

  card: {
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  settingItem: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
  },

  disabledItem: {
    opacity: 0.45,
  },

  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  dangerIcon: {
    backgroundColor: "#FEF2F2",
  },

  settingContent: {
    flex: 1,
    marginLeft: 12,
  },

  settingTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  settingSubtitle: {
    marginTop: 4,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  dangerText: {
    color: "#DC2626",
  },

  divider: {
    height: 1,
    marginLeft: 56,
    backgroundColor: Colors.border,
  },

  footerText: {
    marginTop: 25,
    fontSize: 8,
    textAlign: "center",
    color: Colors.textLight,
  },
});