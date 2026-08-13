import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useSQLiteContext,
} from "expo-sqlite";

import { Colors } from "@/src/constants/colors";

import {
  useCompany,
} from "@/src/contexts/CompanyContext";

import {
  getCompany,
  saveCompany,
} from "@/src/repositories/companyRepository";

import ImagePickerField from "@/src/components/settings/ImagePickerField";


// =====================================================
// COMPANY SCREEN
// =====================================================

export default function CompanyScreen() {
  const db = useSQLiteContext();

  const {
    refreshCompany,
  } = useCompany();

  // ===================================================
  // FORM STATE
  // ===================================================

  const [name, setName] =
    useState("");

  const [ownerName, setOwnerName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [gstNumber, setGstNumber] =
    useState("");

  // ===================================================
  // BRANDING
  // ===================================================

  const [logo, setLogo] =
    useState<string | null>(null);

  const [signature, setSignature] =
    useState<string | null>(null);

  const [stamp, setStamp] =
    useState<string | null>(null);

  // ===================================================
  // STATUS
  // ===================================================

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);


  // ===================================================
  // LOAD COMPANY
  // ===================================================

  const loadCompany = async () => {
    try {
      setLoading(true);

      const company =
        await getCompany(db);

      if (company) {
        setName(
          company.name ?? ""
        );

        setOwnerName(
          company.owner_name ?? ""
        );

        setPhone(
          company.phone ?? ""
        );

        setEmail(
          company.email ?? ""
        );

        setAddress(
          company.address ?? ""
        );

        setGstNumber(
          company.gst_number ?? ""
        );

        setLogo(
          company.logo ?? null
        );

        setSignature(
          company.signature ?? null
        );

        setStamp(
          company.stamp ?? null
        );
      } else {
        // Clear fields when no company exists
        setName("");
        setOwnerName("");
        setPhone("");
        setEmail("");
        setAddress("");
        setGstNumber("");
        setLogo(null);
        setSignature(null);
        setStamp(null);
      }
    } catch (error) {
      console.error(
        "LOAD COMPANY ERROR:",
        error
      );

      Alert.alert(
        "Unable to Load",
        "Company information could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  };


  // ===================================================
  // RELOAD WHEN SCREEN GETS FOCUS
  // ===================================================

  useFocusEffect(
    useCallback(() => {
      loadCompany();
    }, [])
  );


  // ===================================================
  // SAVE
  // ===================================================

  const handleSave = async () => {
    const cleanName =
      name.trim();

    const cleanOwner =
      ownerName.trim();

    const cleanPhone =
      phone.trim();

    const cleanEmail =
      email.trim();

    const cleanAddress =
      address.trim();

    const cleanGST =
      gstNumber
        .trim()
        .toUpperCase();


    // -------------------------------------------------
    // COMPANY NAME
    // -------------------------------------------------

    if (cleanName.length < 2) {
      Alert.alert(
        "Company Name Required",
        "Please enter a valid company name."
      );

      return;
    }


    // -------------------------------------------------
    // PHONE
    // -------------------------------------------------

    if (
      cleanPhone.length > 0 &&
      cleanPhone.length !== 10
    ) {
      Alert.alert(
        "Invalid Phone Number",
        "Please enter a valid 10-digit mobile number."
      );

      return;
    }


    // -------------------------------------------------
    // EMAIL
    // -------------------------------------------------

    if (
      cleanEmail.length > 0 &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid business email address."
      );

      return;
    }


    // -------------------------------------------------
    // GST
    // -------------------------------------------------

    if (
      cleanGST.length > 0 &&
      cleanGST.length !== 15
    ) {
      Alert.alert(
        "Invalid GST Number",
        "GST number should contain 15 characters."
      );

      return;
    }


    // -------------------------------------------------
    // SAVE
    // -------------------------------------------------

    try {
      setSaving(true);

      await saveCompany(db, {
        name: cleanName,

        owner_name:
          cleanOwner,

        phone:
          cleanPhone,

        email:
          cleanEmail,

        address:
          cleanAddress,

        gst_number:
          cleanGST,

        logo:
          logo || null,

        signature:
          signature || null,

        stamp:
          stamp || null,
      });


      // ------------------------------------------------
      // REFRESH GLOBAL COMPANY
      // ------------------------------------------------

      await refreshCompany();


      Alert.alert(
        "Company Saved",
        "Your company profile has been updated successfully.",
        [
          {
            text: "Done",
            onPress: () =>
              router.back(),
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
        "Unable to save company profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };


  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View style={styles.loader}>

          <ActivityIndicator
            size="large"
            color={
              Colors.primary
            }
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Loading company profile...
          </Text>

        </View>
      </SafeAreaView>
    );
  }


  // ===================================================
  // SCREEN
  // ===================================================

  return (
    <SafeAreaView
      style={styles.container}
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={
              Colors.textPrimary
            }
          />
        </TouchableOpacity>


        <View
          style={
            styles.headerContent
          }
        >

          <Text
            style={
              styles.headerTitle
            }
          >
            Company Profile
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Manage your business information
          </Text>

        </View>


        <View
          style={
            styles.headerIcon
          }
        >
          <Ionicons
            name="business-outline"
            size={21}
            color={
              Colors.primary
            }
          />
        </View>

      </View>


      {/* ================================================= */}
      {/* FORM */}
      {/* ================================================= */}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.content
          }
        >


          {/* ================================================= */}
          {/* PROFILE SUMMARY */}
          {/* ================================================= */}

          <View
            style={
              styles.profileCard
            }
          >

            <View
              style={
                styles.profileTop
              }
            >

              {/* LOGO PREVIEW */}

              <View
                style={
                  styles.profileLogo
                }
              >

                {logo ? (
                  <ImagePreview
                    uri={logo}
                  />
                ) : (
                  <Ionicons
                    name="business-outline"
                    size={34}
                    color={
                      Colors.primary
                    }
                  />
                )}

              </View>


              {/* COMPANY DETAILS */}

              <View
                style={
                  styles.profileInfo
                }
              >

                <Text
                  style={
                    styles.profileName
                  }
                  numberOfLines={2}
                >
                  {name.trim()
                    ? name.trim()
                    : "Your Company"}
                </Text>


                <View
                  style={
                    styles.profileStatus
                  }
                >

                  <View
                    style={
                      styles.statusDot
                    }
                  />

                  <Text
                    style={
                      styles.statusText
                    }
                  >
                    Business Profile
                  </Text>

                </View>


                {ownerName.trim() ? (
                  <Text
                    style={
                      styles.ownerText
                    }
                    numberOfLines={1}
                  >
                    Owner:{" "}
                    {ownerName.trim()}
                  </Text>
                ) : null}

              </View>

            </View>


            {/* DIVIDER */}

            <View
              style={
                styles.profileDivider
              }
            />


            {/* CONTACT */}

            <View
              style={
                styles.profileMetaRow
              }
            >

              <ProfileMeta
                icon="call-outline"
                text={
                  phone.trim()
                    ? phone.trim()
                    : "Mobile not added"
                }
              />

              <ProfileMeta
                icon="mail-outline"
                text={
                  email.trim()
                    ? email.trim()
                    : "Email not added"
                }
              />

            </View>

          </View>


          {/* ================================================= */}
          {/* BUSINESS INFORMATION */}
          {/* ================================================= */}

          <SectionHeader
            icon="business-outline"
            title="Business Information"
            subtitle="Basic details about your business"
          />


          <View
            style={styles.card}
          >

            <CompanyInput
              label="COMPANY NAME"
              icon="business-outline"
              placeholder="Enter company name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              required
            />


            <CompanyInput
              label="OWNER NAME"
              icon="person-outline"
              placeholder="Enter owner name"
              value={ownerName}
              onChangeText={setOwnerName}
              autoCapitalize="words"
            />


            <CompanyInput
              label="PHONE NUMBER"
              icon="call-outline"
              placeholder="Enter 10-digit mobile number"
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
              label="EMAIL ADDRESS"
              icon="mail-outline"
              placeholder="Enter business email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />


            <CompanyInput
              label="BUSINESS ADDRESS"
              icon="location-outline"
              placeholder="Enter complete business address"
              value={address}
              onChangeText={setAddress}
              multiline
            />


            <CompanyInput
              label="GST NUMBER"
              icon="document-text-outline"
              placeholder="Enter 15-digit GST number"
              value={gstNumber}
              onChangeText={(value) =>
                setGstNumber(
                  value
                    .replace(/\s/g, "")
                    .toUpperCase()
                    .slice(0, 15)
                )
              }
              autoCapitalize="characters"
            />


            {/* GST INFO */}

            <View
              style={
                styles.helperBox
              }
            >

              <Ionicons
                name="information-circle-outline"
                size={18}
                color={
                  Colors.primary
                }
              />

              <Text
                style={
                  styles.helperText
                }
              >
                GST number is optional.
                Add it if your business
                is GST registered.
              </Text>

            </View>

          </View>


          {/* ================================================= */}
          {/* BRANDING */}
          {/* ================================================= */}

          <SectionHeader
            icon="color-palette-outline"
            title="Business Branding"
            subtitle="Add your logo, signature and official stamp"
          />


          <View
            style={
              styles.brandingCard
            }
          >

            {/* LOGO */}

            <ImagePickerField
              title="Company Logo"
              subtitle="Displayed on quotations, bills and reports"
              value={logo}
              onChange={setLogo}
              icon="business-outline"
            />


            {/* SIGNATURE */}

            <ImagePickerField
              title="Authorized Signature"
              subtitle="Displayed on official documents"
              value={signature}
              onChange={setSignature}
              icon="create-outline"
            />


            {/* STAMP */}

            <ImagePickerField
              title="Company Stamp"
              subtitle="Displayed on quotations and bills"
              value={stamp}
              onChange={setStamp}
              icon="shield-checkmark-outline"
            />

          </View>


          {/* ================================================= */}
          {/* PROFESSIONAL DOCUMENT INFO */}
          {/* ================================================= */}

          <View
            style={
              styles.infoCard
            }
          >

            <View
              style={
                styles.infoIcon
              }
            >
              <Ionicons
                name="sparkles-outline"
                size={20}
                color={
                  Colors.primary
                }
              />
            </View>


            <View
              style={
                styles.infoContent
              }
            >

              <Text
                style={
                  styles.infoTitle
                }
              >
                Professional Documents
              </Text>

              <Text
                style={
                  styles.infoText
                }
              >
                Your company information,
                logo, signature and stamp
                will be available for
                quotations, bills and
                professional documents.
              </Text>

            </View>

          </View>


          {/* ================================================= */}
          {/* SAVE */}
          {/* ================================================= */}

          <TouchableOpacity
            style={[
              styles.saveButton,
              saving &&
                styles.disabledButton,
            ]}
            activeOpacity={0.85}
            disabled={saving}
            onPress={handleSave}
          >

            {saving ? (
              <>

                <ActivityIndicator
                  size="small"
                  color={
                    Colors.white
                  }
                />

                <Text
                  style={
                    styles.saveText
                  }
                >
                  Saving Company...
                </Text>

              </>
            ) : (
              <>

                <View
                  style={
                    styles.saveIcon
                  }
                >
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={
                      Colors.primary
                    }
                  />
                </View>


                <Text
                  style={
                    styles.saveText
                  }
                >
                  Save Company Profile
                </Text>


                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={
                    Colors.white
                  }
                />

              </>
            )}

          </TouchableOpacity>


          <View
            style={
              styles.bottomSpace
            }
          />

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}


// =====================================================
// IMAGE PREVIEW
// =====================================================

function ImagePreview({
  uri,
}: {
  uri: string;
}) {
  const {
    Image,
  } = require("react-native");

  return (
    <Image
      source={{ uri }}
      style={
        styles.profileLogoImage
      }
    />
  );
}


// =====================================================
// PROFILE META
// =====================================================

function ProfileMeta({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View
      style={
        styles.profileMeta
      }
    >

      <View
        style={
          styles.profileMetaIcon
        }
      >
        <Ionicons
          name={icon}
          size={15}
          color={
            Colors.primary
          }
        />
      </View>

      <Text
        style={
          styles.profileMetaText
        }
        numberOfLines={1}
      >
        {text}
      </Text>

    </View>
  );
}


// =====================================================
// SECTION HEADER
// =====================================================

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View
      style={
        styles.sectionHeader
      }
    >

      <View
        style={
          styles.sectionIcon
        }
      >
        <Ionicons
          name={icon}
          size={19}
          color={
            Colors.primary
          }
        />
      </View>


      <View
        style={
          styles.sectionText
        }
      >

        <Text
          style={
            styles.sectionTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.sectionSubtitle
          }
        >
          {subtitle}
        </Text>

      </View>

    </View>
  );
}


// =====================================================
// COMPANY INPUT
// =====================================================

function CompanyInput({
  label,
  icon,
  required,
  ...props
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  required?: boolean;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View
      style={
        styles.inputGroup
      }
    >

      <View
        style={
          styles.labelRow
        }
      >

        <Text
          style={
            styles.label
          }
        >
          {label}
        </Text>

        {required ? (
          <Text
            style={
              styles.required
            }
          >
            REQUIRED
          </Text>
        ) : null}

      </View>


      <View
        style={[
          styles.inputContainer,
          props.multiline &&
            styles.multilineContainer,
        ]}
      >

        <View
          style={
            styles.inputIcon
          }
        >
          <Ionicons
            name={icon}
            size={18}
            color={
              Colors.primary
            }
          />
        </View>


        <TextInput
          {...props}
          placeholderTextColor={
            Colors.textLight
          }
          style={[
            styles.input,
            props.multiline &&
              styles.multilineInput,
          ]}
          textAlignVertical={
            props.multiline
              ? "top"
              : "center"
          }
        />

      </View>

    </View>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        "#F6F8FC",
    },

    flex: {
      flex: 1,
    },

    loader: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    loadingText: {
      marginTop: 12,
      fontSize: 13,
      color:
        Colors.textSecondary,
    },


    // =================================================
    // HEADER
    // =================================================

    header: {
      minHeight: 70,
      paddingHorizontal: 17,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        Colors.white,
      borderBottomWidth: 1,
      borderBottomColor:
        Colors.border,
    },

    backButton: {
      width: 43,
      height: 43,
      borderRadius: 14,
      backgroundColor:
        "#F1F5F9",
      alignItems: "center",
      justifyContent: "center",
    },

    headerContent: {
      flex: 1,
      marginLeft: 12,
    },

    headerTitle: {
      fontSize: 19,
      fontWeight: "800",
      color:
        Colors.textPrimary,
    },

    headerSubtitle: {
      marginTop: 3,
      fontSize: 10,
      color:
        Colors.textSecondary,
    },

    headerIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },


    // =================================================
    // CONTENT
    // =================================================

    content: {
      paddingHorizontal: 16,
      paddingTop: 15,
      paddingBottom: 30,
    },


    // =================================================
    // PROFILE
    // =================================================

    profileCard: {
      backgroundColor:
        Colors.white,
      borderRadius: 21,
      padding: 17,
      borderWidth: 1,
      borderColor:
        "#E8ECF2",
    },

    profileTop: {
      flexDirection: "row",
      alignItems: "center",
    },

    profileLogo: {
      width: 76,
      height: 76,
      borderRadius: 21,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },

    profileLogoImage: {
      width: "100%",
      height: "100%",
      resizeMode: "contain",
    },

    profileInfo: {
      flex: 1,
      marginLeft: 14,
    },

    profileName: {
      fontSize: 19,
      fontWeight: "800",
      color:
        Colors.textPrimary,
    },

    profileStatus: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
    },

    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor:
        Colors.success,
      marginRight: 6,
    },

    statusText: {
      fontSize: 11,
      fontWeight: "600",
      color:
        Colors.textSecondary,
    },

    ownerText: {
      marginTop: 6,
      fontSize: 11,
      color:
        Colors.textSecondary,
    },

    profileDivider: {
      height: 1,
      backgroundColor:
        Colors.border,
      marginVertical: 14,
    },

    profileMetaRow: {
      flexDirection: "row",
    },

    profileMeta: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingRight: 8,
    },

    profileMetaIcon: {
      width: 29,
      height: 29,
      borderRadius: 9,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    profileMetaText: {
      flex: 1,
      marginLeft: 7,
      fontSize: 10,
      color:
        Colors.textSecondary,
    },


    // =================================================
    // SECTION
    // =================================================

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 23,
      marginBottom: 9,
    },

    sectionIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    sectionText: {
      marginLeft: 11,
    },

    sectionTitle: {
      fontSize: 15,
      fontWeight: "800",
      color:
        Colors.textPrimary,
    },

    sectionSubtitle: {
      marginTop: 2,
      fontSize: 10,
      color:
        Colors.textSecondary,
    },


    // =================================================
    // FORM
    // =================================================

    card: {
      backgroundColor:
        Colors.white,
      borderRadius: 20,
      padding: 17,
      borderWidth: 1,
      borderColor:
        "#E8ECF2",
    },

    inputGroup: {
      marginBottom: 16,
    },

    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 7,
    },

    label: {
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.7,
      color:
        Colors.textSecondary,
    },

    required: {
      fontSize: 7,
      fontWeight: "800",
      color:
        Colors.primary,
    },

    inputContainer: {
      minHeight: 55,
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        Colors.border,
      backgroundColor:
        "#FCFDFE",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
    },

    multilineContainer: {
      minHeight: 100,
      alignItems:
        "flex-start",
      paddingTop: 10,
    },

    inputIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    input: {
      flex: 1,
      marginLeft: 10,
      fontSize: 13,
      color:
        Colors.textPrimary,
    },

    multilineInput: {
      minHeight: 78,
      paddingTop: 7,
    },


    // =================================================
    // HELPER
    // =================================================

    helperBox: {
      flexDirection: "row",
      alignItems:
        "flex-start",
      backgroundColor:
        "#EFF6FF",
      borderRadius: 12,
      padding: 11,
      marginTop: -3,
    },

    helperText: {
      flex: 1,
      marginLeft: 8,
      fontSize: 10,
      lineHeight: 15,
      color:
        Colors.textSecondary,
    },


    // =================================================
    // BRANDING
    // =================================================

    brandingCard: {
      backgroundColor:
        Colors.white,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor:
        "#E8ECF2",
    },


    // =================================================
    // INFO
    // =================================================

    infoCard: {
      marginTop: 16,
      padding: 15,
      borderRadius: 17,
      backgroundColor:
        "#EFF6FF",
      borderWidth: 1,
      borderColor:
        "#DBEAFE",
      flexDirection: "row",
      alignItems:
        "flex-start",
    },

    infoIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor:
        Colors.white,
      alignItems: "center",
      justifyContent: "center",
    },

    infoContent: {
      flex: 1,
      marginLeft: 10,
    },

    infoTitle: {
      fontSize: 13,
      fontWeight: "800",
      color:
        Colors.textPrimary,
    },

    infoText: {
      marginTop: 4,
      fontSize: 10,
      lineHeight: 16,
      color:
        Colors.textSecondary,
    },


    // =================================================
    // SAVE
    // =================================================

    saveButton: {
      marginTop: 20,
      minHeight: 58,
      borderRadius: 18,
      backgroundColor:
        Colors.primary,
      paddingHorizontal: 8,
      paddingRight: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      elevation: 5,
    },

    saveIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        Colors.white,
      alignItems: "center",
      justifyContent: "center",
    },

    saveText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "800",
      color:
        Colors.white,
    },

    disabledButton: {
      opacity: 0.55,
    },

    bottomSpace: {
      height: 20,
    },

  });