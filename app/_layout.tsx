import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SQLiteProvider } from "expo-sqlite";
import { CompanyProvider } from "@/src/contexts/CompanyContext";

import {
  DATABASE_NAME,
  initializeDatabase,
} from "@/src/database/database";

import { AuthProvider } from "@/src/contexts/AuthContext";

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName={DATABASE_NAME}
      onInit={initializeDatabase}
    >
      <AuthProvider>
        <CompanyProvider>
          <StatusBar style="dark" />

          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </CompanyProvider>
      </AuthProvider>
    </SQLiteProvider>
  );
}