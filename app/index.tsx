import { Redirect } from "expo-router";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/contexts/AuthContext";

export default function StartupScreen() {
  const {
    isLoading,
    isAuthenticated,
    onboardingCompleted,
  } = useAuth();

  if (isLoading) {
    return <SplashLoader />;
  }

  if (!onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
  }

function SplashLoader() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require(
            "../assets/images/icon.png"
          )}
          style={styles.logo}
        />

        <Text style={styles.appName}>
          LabourMate
        </Text>

        <Text style={styles.tagline}>
          Smart Labour Management
        </Text>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator
          size="small"
          color={Colors.primary}
        />

        <Text style={styles.loadingText}>
          Preparing your workspace
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  logoContainer: {
    width: 92,
    height: 92,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
  },

  logo: {
    width: 110,
    height: 110,
    resizeMode: "contain",
  },

  appName: {
    marginTop: 24,
    fontSize: 31,
    fontWeight: "900",
    color: Colors.textPrimary,
    letterSpacing: -0.8,
  },

  tagline: {
    marginTop: 7,
    fontSize: 12,
    color: Colors.textSecondary,
  },

  footer: {
    paddingBottom: 45,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 11,
    fontSize: 9,
    color: Colors.textSecondary,
  },
});