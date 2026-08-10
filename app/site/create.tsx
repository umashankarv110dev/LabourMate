import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";

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

import { createSite } from "@/src/repositories/siteRepository";

export default function CreateSiteScreen() {
  const db = useSQLiteContext();

  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(
        "Required",
        "Please enter site name"
      );

      return;
    }

    try {
      setLoading(true);

      await createSite(db, {
        name,
        clientName,
        address,
        startDate,
        expectedEndDate: endDate,
      });

      Alert.alert(
        "Success",
        "Site created successfully",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error(error);

      Alert.alert(
        "Error",
        "Unable to create site"
      );
    } finally {
      setLoading(false);
    }
  };

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

        <Text style={styles.title}>Add Site</Text>

        <View style={styles.space} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <AppInput
          label="Site Name *"
          icon="business-outline"
          placeholder="Enter site name"
          value={name}
          onChangeText={setName}
        />

        <AppInput
          label="Client Name"
          icon="person-outline"
          placeholder="Enter client name"
          value={clientName}
          onChangeText={setClientName}
        />

        <AppInput
          label="Site Address"
          icon="location-outline"
          placeholder="Enter site address"
          value={address}
          onChangeText={setAddress}
          multiline
        />

        <AppInput
          label="Start Date"
          icon="calendar-outline"
          placeholder="2026-07-13"
          value={startDate}
          onChangeText={setStartDate}
        />

        <AppInput
          label="Expected End Date"
          icon="calendar-outline"
          placeholder="2026-12-31"
          value={endDate}
          onChangeText={setEndDate}
        />

        <AppButton
          title="Create Site"
          icon="checkmark-circle-outline"
          loading={loading}
          onPress={handleSave}
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

  content: {
    padding: 20,
    paddingBottom: 40,
  },
});