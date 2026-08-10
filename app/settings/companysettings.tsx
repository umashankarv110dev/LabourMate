import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import AppCard from "../../src/components/common/AppCard";
import AppButton from "../../src/components/common/AppButton";
import AppInput from "../../src/components/common/AppInput";
import ImagePickerField from "../../src/components/settings/ImagePickerField";

import { Company } from "@/src/types/companybill";
import { Colors } from "@/src/constants/colors";
import {
  getData,
  saveData,
  StorageKeys,
} from "@/src/services/storage";
import { LinearGradient } from "expo-linear-gradient";

const defaultCompany: Company = {
  companyName: "",
  addressLine1: "",
  addressLine2: "",
  mobile: "",
  email: "",
  gstNumber: "",
  logo: "",
  signature: "",
  stamp: "",
};

export default function CompanyScreen() {
  const insets = useSafeAreaInsets();

  const [company, setCompany] =
    useState<Company>(defaultCompany);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    loadCompany();
  }, []);

  const updateField = (
    key: keyof Company,
    value: string
  ) => {
    setCompany((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const loadCompany = async () => {
    try {
      const data = await getData(
        StorageKeys.COMPANY
      );

      if (data) {
        setCompany(data);
      }
    } catch (error) {
      console.log(
        "Load Company Error:",
        error
      );
    }
  };

  const saveCompany = async () => {
    if (!company.companyName.trim()) {
      Alert.alert(
        "Company Name Required",
        "Please enter your company name."
      );
      return;
    }

    if (!company.mobile.trim()) {
      Alert.alert(
        "Mobile Number Required",
        "Please enter your mobile number."
      );
      return;
    }

    try {
      setLoading(true);

      await saveData(
        StorageKeys.COMPANY,
        company
      );

      Alert.alert(
        "Saved Successfully",
        "Your company details have been saved successfully."
      );
    } catch (error) {
      console.log(
        "Save Company Error:",
        error
      );

      Alert.alert(
        "Save Failed",
        "Unable to save company details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetCompany = () => {
    Alert.alert(
      "Reset Company Details",
      "Are you sure you want to clear all company information?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setCompany({
              ...defaultCompany,
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* HEADER */}
    
            <LinearGradient
              colors={["#2563EB", "#3B82F6", "#60A5FA"]}
              style={styles.header}
            >
                
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerEyebrow}>
                BUSINESS SETTINGS
              </Text>

              <Text style={styles.headerTitle}>
                Company Profile
              </Text>

              <Text style={styles.headerSubtitle}>
                Manage your business information
                for quotations and bills.
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Ionicons
                name="business-outline"
                size={32}
                color="#FFFFFF"
              />
            </View>
          </View>

          
          </LinearGradient>

          
          {/* ================================================= */}
          {/* COMPANY PROFILE */}
          {/* ================================================= */}
              <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={
                  Platform.OS === "ios"
                    ? "padding"
                    : undefined
                }
              >
          <AppCard style={styles.profileCard}>
            <View style={styles.profileTop}>
              <View style={styles.profileAvatar}>
                {company.logo ? (
                  <View style={styles.logoPreview}>
                    {/* Logo itself is already handled by
                        ImagePickerField. This area remains
                        intentionally clean. */}

                    <Ionicons
                      name="business"
                      size={34}
                      color={Colors.primary}
                    />
                  </View>
                ) : (
                  <Ionicons
                    name="business"
                    size={38}
                    color={Colors.primary}
                  />
                )}
              </View>

              <View style={styles.profileInfo}>
                <Text
                  style={styles.profileCompanyName}
                  numberOfLines={1}
                >
                  {company.companyName.trim()
                    ? company.companyName
                    : "Your Company"}
                </Text>

                <View style={styles.profileStatus}>
                  <View
                    style={styles.statusDot}
                  />

                  <Text
                    style={styles.profileStatusText}
                  >
                    Business Profile
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.profileDivider} />

            <View style={styles.profileFooter}>
              <View style={styles.profileMeta}>
                <Ionicons
                  name="call-outline"
                  size={17}
                  color={Colors.textSecondary}
                />

                <Text
                  style={styles.profileMetaText}
                  numberOfLines={1}
                >
                  {company.mobile.trim()
                    ? company.mobile
                    : "Mobile not added"}
                </Text>
              </View>

              <View style={styles.profileMeta}>
                <Ionicons
                  name="document-text-outline"
                  size={17}
                  color={Colors.textSecondary}
                />

                <Text
                  style={styles.profileMetaText}
                  numberOfLines={1}
                >
                  {company.gstNumber.trim()
                    ? "GST Added"
                    : "GST Optional"}
                </Text>
              </View>
            </View>
          </AppCard>

          {/* ================================================= */}
          {/* LOGO */}
          {/* ================================================= */}

          <View style={styles.sectionHeading}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="image-outline"
                size={20}
                color={Colors.primary}
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Company Logo
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Add your business logo
              </Text>
            </View>
          </View>

          <AppCard style={styles.formCard}>
            <ImagePickerField
              title="Company Logo"
              value={company.logo}
              onChange={(uri) =>
                updateField(
                  "logo",
                  uri
                )
              }
            />
          </AppCard>

          {/* ================================================= */}
          {/* COMPANY INFORMATION */}
          {/* ================================================= */}

          <View style={styles.sectionHeading}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="business-outline"
                size={20}
                color={Colors.primary}
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Company Information
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Basic business details
              </Text>
            </View>
          </View>

          <AppCard style={styles.formCard}>
            <AppInput
              leftIcon="business-outline"
              placeholder="Company Name"
              value={company.companyName}
              onChangeText={(text) =>
                updateField(
                  "companyName",
                  text
                )
              }
              autoCapitalize="words"
            />

            <AppInput
              leftIcon="location-outline"
              placeholder="Address Line 1"
              value={company.addressLine1}
              onChangeText={(text) =>
                updateField(
                  "addressLine1",
                  text
                )
              }
              autoCapitalize="sentences"
            />

            <AppInput
              leftIcon="location-outline"
              placeholder="Address Line 2"
              value={company.addressLine2}
              onChangeText={(text) =>
                updateField(
                  "addressLine2",
                  text
                )
              }
              autoCapitalize="sentences"
            />

            <AppInput
              leftIcon="call-outline"
              placeholder="Mobile Number"
              keyboardType="phone-pad"
              value={company.mobile}
              onChangeText={(text) =>
                updateField(
                  "mobile",
                  text
                )
              }
            />

            <AppInput
              leftIcon="mail-outline"
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={company.email}
              onChangeText={(text) =>
                updateField(
                  "email",
                  text
                )
              }
            />

            <AppInput
              leftIcon="document-text-outline"
              placeholder="GST Number"
              autoCapitalize="characters"
              value={company.gstNumber}
              onChangeText={(text) =>
                updateField(
                  "gstNumber",
                  text.toUpperCase()
                )
              }
            />

            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={Colors.primary}
              />

              <Text
                style={styles.infoText}
              >
                GST Number is optional. Add it if
                your business is GST registered.
              </Text>
            </View>
          </AppCard>

          {/* ================================================= */}
          {/* SIGNATURE */}
          {/* ================================================= */}

          <View style={styles.sectionHeading}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="create-outline"
                size={20}
                color={Colors.primary}
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Authorized Signature
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Used on your quotations and bills
              </Text>
            </View>
          </View>

          <AppCard style={styles.formCard}>
            <ImagePickerField
              title="Authorized Signature"
              value={company.signature}
              onChange={(uri) =>
                updateField(
                  "signature",
                  uri
                )
              }
            />
          </AppCard>

          {/* ================================================= */}
          {/* STAMP */}
          {/* ================================================= */}

          <View style={styles.sectionHeading}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={Colors.primary}
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Company Stamp
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Add your official business stamp
              </Text>
            </View>
          </View>

          <AppCard style={styles.formStampCard}>
            <ImagePickerField
              title="Company Stamp"
              value={company.stamp}
              onChange={(uri) =>
                updateField(
                  "stamp",
                  uri
                )
              }
            />
          </AppCard>

          {/* ================================================= */}
          {/* SECURITY / DOCUMENT INFO */}
          {/* ================================================= */}

          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Ionicons
                name="sparkles-outline"
                size={21}
                color={Colors.primary}
              />
            </View>

            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>
                Professional Documents
              </Text>

              <Text style={styles.tipText}>
                Your company logo, signature and
                stamp will be available when
                generating professional quotations
                and bills.
              </Text>
            </View>
          </View>

          <View
            style={{
              height: 20,
            }}
          />

          {/* ================================================= */}
        {/* FIXED BOTTOM ACTION BAR */}
        {/* ================================================= */}

        <View
          style={[
            styles.footer,
            {
              paddingBottom:
                Math.max(insets.bottom, 12),
            },
          ]}
        >
          <AppButton
            title="Save Company Details"
            loading={loading}
            onPress={saveCompany}
          />

          <AppButton
            title="Reset Form"
            color={Colors.danger}
            onPress={resetCompany}
          />
        </View>


              </KeyboardAvoidingView>
        
        </ScrollView>
      </View>


    // <SafeAreaView
    //   style={styles.container}
    //   edges={["top", "left", "right"]}
    // >
    //   <StatusBar
    //     barStyle="light-content"
    //     backgroundColor={Colors.primary}
    //   />

    //   <KeyboardAvoidingView
    //     style={styles.keyboardContainer}
    //     behavior={
    //       Platform.OS === "ios"
    //         ? "padding"
    //         : undefined
    //     }
    //   >
    //     {/* ================================================= */}
    //     {/* HEADER */}
    //     {/* ================================================= */}

    //     <View style={styles.header}>
    //     </View>

    //     {/* ================================================= */}
    //     {/* CONTENT */}
    //     {/* ================================================= */}

    //     <ScrollView
    //       showsVerticalScrollIndicator={false}
    //       keyboardShouldPersistTaps="handled"
    //       contentContainerStyle={[
    //         styles.content,
    //         {
    //           paddingBottom:
    //             150 + insets.bottom,
    //         },
    //       ]}
    //     >
    //     </ScrollView>

        
    //   </KeyboardAvoidingView>
    // </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* ================================================= */
  /* CONTAINER */
  /* ================================================= */

  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },


  /* ================================================= */
  /* HEADER */
  /* ================================================= */
  header: {
    paddingTop: 50,
    paddingHorizontal: 22,
    paddingBottom: 30,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },

  keyboardContainer: {
    flex: 1,
  },

  content: {
    paddingTop: 0,
    paddingHorizontal: 0,
  },


  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 15,
  },

  headerEyebrow: {
    color: "#BFDBFE",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 6,
  },

  headerSubtitle: {
    color: "#E0ECFF",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
  },

  headerIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,

    backgroundColor:
      "rgba(255,255,255,0.16)",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.22)",
  },

  /* ================================================= */
  /* PROFILE CARD */
  /* ================================================= */

  profileCard: {
    marginHorizontal: 18,
    marginTop: 30,

    borderRadius: 22,
    padding: 18,

    backgroundColor: Colors.white,
  },

  profileTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileAvatar: {
    width: 68,
    height: 68,
    borderRadius: 20,

    backgroundColor:
      Colors.primaryLight,

    justifyContent: "center",
    alignItems: "center",

    overflow: "hidden",
  },

  logoPreview: {
    width: "100%",
    height: "100%",

    justifyContent: "center",
    alignItems: "center",
  },

  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },

  profileCompanyName: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  profileStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 7,
  },

  profileStatusText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },

  profileDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },

  profileFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  profileMeta: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  profileMetaText: {
    marginLeft: 7,
    fontSize: 12,
    color: Colors.textSecondary,
    flexShrink: 1,
  },

  /* ================================================= */
  /* SECTION HEADER */
  /* ================================================= */

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",

    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 8,
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,

    backgroundColor:
      Colors.primaryLight,

    justifyContent: "center",
    alignItems: "center",

    marginRight: 11,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  /* ================================================= */
  /* FORM CARD */
  /* ================================================= */

  formCard: {
    marginHorizontal: 18,
    borderRadius: 20,
    padding: 15,
    backgroundColor: Colors.white,
  },

  formStampCard: {
    marginHorizontal: 18,
    borderRadius: 20,
    padding: 15,
    backgroundColor: Colors.white,
    marginBottom: 50,
  },

  /* ================================================= */
  /* INFO BOX */
  /* ================================================= */

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",

    backgroundColor:
      "#EFF6FF",

    borderRadius: 12,

    padding: 12,

    marginTop: 8,
  },

  infoText: {
    flex: 1,

    marginLeft: 8,

    color: "#475569",
    fontSize: 12,
    lineHeight: 18,
  },

  /* ================================================= */
  /* PROFESSIONAL TIP */
  /* ================================================= */

  tipCard: {
    flexDirection: "row",

    marginHorizontal: 18,
    marginTop: 22,

    padding: 15,

    borderRadius: 18,

    backgroundColor:
      "#EFF6FF",

    borderWidth: 1,
    borderColor:
      "#DBEAFE",
  },

  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,

    backgroundColor:
      Colors.white,

    justifyContent: "center",
    alignItems: "center",
  },

  tipContent: {
    flex: 1,
    marginLeft: 12,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  tipText: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  /* ================================================= */
  /* FIXED FOOTER */
  /* ================================================= */

  footer: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: Colors.white,

    paddingHorizontal: 18,
    paddingTop: 10,

    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,

    elevation: 18,
  },
});