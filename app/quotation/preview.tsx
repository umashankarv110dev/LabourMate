import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useLocalSearchParams,
  router,
} from "expo-router";

import AppButton from "../../src/components/common/AppButton";

import CustomerSection from "../../src/components/preview/CustomerSection";
import ItemsTable from "../../src/components/preview/ItemsTable";
import NotesSection from "../../src/components/preview/NotesSection";
import FooterSection from "../../src/components/preview/FooterSection";

import {
  calculateGrandTotal,
} from "../../src/utils/calculation";

import {
  generatePDF,
  sharePDF,
} from "@/src/services/pdf";

import {
  saveQuotation,
  updateQuotation,
} from "@/src/services/quotationStorage";

import { Colors } from "@/src/constants/colors";

import { Ionicons } from "@expo/vector-icons";

export default function PreviewScreen() {
  const { quotation, mode } =
    useLocalSearchParams();

  if (!quotation) {
    return null;
  }

  let data: any;

  try {
    data = JSON.parse(
      quotation as string
    );
  } catch (error) {
    console.error(
      "Quotation JSON error:",
      error
    );

    return null;
  }

  const company = data?.company ?? {};

  const items = Array.isArray(data?.items)
    ? data.items
    : [];

  const grandTotal =
    calculateGrandTotal(items);

  const companyName =
    company.name ||
    company.companyName ||
    "Company Name";

  const ownerName =
    company.owner_name ||
    "";

  const phone =
    company.phone ||
    company.mobile ||
    "";

  const email =
    company.email ||
    "";

  const address =
    company.address ||
    "";

  const gstNumber =
    company.gst_number ||
    company.gstNumber ||
    "";

  const logo =
    company.logo ||
    null;

  const signature =
    company.signature ||
    null;

  const stamp =
    company.stamp ||
    null;

  // =====================================================
  // DOWNLOAD PDF
  // =====================================================

  const download = async () => {
    try {
      const uri =
        await generatePDF(data);

      Alert.alert(
        "PDF Ready",
        "Quotation PDF generated successfully."
      );
    } catch (error) {
      console.error(
        "PDF ERROR:",
        error
      );

      Alert.alert(
        "PDF Error",
        "Unable to generate PDF."
      );
    }
  };

  // =====================================================
  // SHARE PDF
  // =====================================================

  const share = async () => {
    try {
      await sharePDF(data);
    } catch (error) {
      console.error(
        "SHARE ERROR:",
        error
      );

      Alert.alert(
        "Share Error",
        "Unable to share PDF."
      );
    }
  };

  // =====================================================
  // SAVE
  // =====================================================

  const saveCurrentQuotation =
    async () => {
      try {
        if (mode === "edit") {
          await updateQuotation(data);

          Alert.alert(
            "Quotation Updated",
            "Quotation updated successfully.",
            [
              {
                text: "OK",
                onPress: () =>
                  router.replace(
                    "/quotation/history"
                  ),
              },
            ]
          );

          return;
        }

        const result =
          await saveQuotation(data);

        if (!result) {
          Alert.alert(
            "Already Saved",
            "This quotation already exists."
          );

          return;
        }

        Alert.alert(
          "Quotation Saved",
          "Quotation saved successfully.",
          [
            {
              text: "OK",
              onPress: () =>
                router.replace(
                  "/quotation/history"
                ),
            },
          ]
        );
      } catch (error) {
        console.error(
          "SAVE ERROR:",
          error
        );

        Alert.alert(
          "Save Error",
          "Something went wrong while saving."
        );
      }
    };

  // =====================================================
  // EDIT
  // =====================================================

  const editQuotation = () => {
    router.back();
  };

  return (
    <View style={styles.screen}>
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.backIcon}>
            <Ionicons
              name="document-text-outline"
              size={21}
              color={Colors.primary}
            />
          </View>

          <View>
            <Text style={styles.topTitle}>
              Quotation Preview
            </Text>

            <Text style={styles.topSubtitle}>
              Review before saving or sharing
            </Text>
          </View>
        </View>

        <View style={styles.previewBadge}>
          <Ionicons
            name="eye-outline"
            size={15}
            color={Colors.primary}
          />

          <Text style={styles.previewBadgeText}>
            Preview
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================= */}
        {/* DOCUMENT */}
        {/* ================================================= */}

        <View style={styles.document}>
          {/* ================================================= */}
          {/* COMPANY HEADER */}
          {/* ================================================= */}

          <View style={styles.companyCard}>
            <View style={styles.companyTop}>
              {/* LOGO */}

              <View style={styles.logoBox}>
                {logo ? (
                  <Image
                    source={{ uri: logo }}
                    style={styles.logo}
                  />
                ) : (
                  <Ionicons
                    name="business-outline"
                    size={32}
                    color={Colors.primary}
                  />
                )}
              </View>

              {/* COMPANY */}

              <View style={styles.companyMain}>
                <Text
                  style={styles.companyName}
                  numberOfLines={2}
                >
                  {companyName}
                </Text>

                {ownerName ? (
                  <Text style={styles.ownerName}>
                    {ownerName}
                  </Text>
                ) : null}

                {gstNumber ? (
                  <View style={styles.gstRow}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={13}
                      color={Colors.primary}
                    />

                    <Text style={styles.gstText}>
                      GSTIN: {gstNumber}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* CONTACT DETAILS */}

            <View style={styles.companyDivider} />

            <View style={styles.contactGrid}>
              {phone ? (
                <ContactItem
                  icon="call-outline"
                  label="Mobile"
                  value={phone}
                />
              ) : null}

              {email ? (
                <ContactItem
                  icon="mail-outline"
                  label="Email"
                  value={email}
                />
              ) : null}

              {address ? (
                <ContactItem
                  icon="location-outline"
                  label="Address"
                  value={address}
                  fullWidth
                />
              ) : null}
            </View>
          </View>

          {/* ================================================= */}
          {/* DOCUMENT META */}
          {/* ================================================= */}

          <View style={styles.metaCard}>
            <View>
              <Text style={styles.metaLabel}>
                QUOTATION NO.
              </Text>

              <Text style={styles.metaValue}>
                {data.quotationNo || "-"}
              </Text>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaRight}>
              <Text style={styles.metaLabel}>
                DATE
              </Text>

              <Text style={styles.metaValue}>
                {data.date || "-"}
              </Text>
            </View>
          </View>

          {/* ================================================= */}
          {/* CUSTOMER */}
          {/* ================================================= */}

          <CustomerSection
            quotationNo={data.quotationNo}
            date={data.date}
            title={data.quotationTitle}
            customerName={data.customerName}
            siteName={data.siteName}
          />

          {/* ================================================= */}
          {/* ITEMS */}
          {/* ================================================= */}

          <ItemsTable items={items} />

          {/* ================================================= */}
          {/* TOTAL */}
          {/* ================================================= */}

          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>
              Grand Total
            </Text>

            <Text style={styles.totalAmount}>
              ₹ {Number(
                grandTotal || 0
              ).toFixed(2)}
            </Text>
          </View>

          {/* ================================================= */}
          {/* NOTES */}
          {/* ================================================= */}

          <NotesSection
            notes={data.notes}
          />

          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

          <FooterSection
            grandTotal={grandTotal}
            company={company}
          />

          {/* ================================================= */}
          {/* SIGNATURE / STAMP */}
          {/* ================================================= */}

          {(signature || stamp) && (
            <View style={styles.approvalCard}>
              <View style={styles.approvalHeader}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={Colors.primary}
                />

                <Text style={styles.approvalTitle}>
                  Authorized Approval
                </Text>
              </View>

              <View style={styles.approvalContent}>
                {/* SIGNATURE */}

                <View style={styles.signatureBox}>
                  {signature ? (
                    <Image
                      source={{
                        uri: signature,
                      }}
                      style={
                        styles.signatureImage
                      }
                    />
                  ) : (
                    <View
                      style={
                        styles.emptySignature
                      }
                    >
                      <Ionicons
                        name="create-outline"
                        size={25}
                        color={
                          Colors.textLight
                        }
                      />

                      <Text
                        style={
                          styles.emptyText
                        }
                      >
                        Signature
                      </Text>
                    </View>
                  )}

                  <View
                    style={
                      styles.signatureLine
                    }
                  />

                  <Text
                    style={
                      styles.signatureLabel
                    }
                  >
                    Authorized Signature
                  </Text>
                </View>

                {/* STAMP */}

                {stamp ? (
                  <View style={styles.stampBox}>
                    <Image
                      source={{
                        uri: stamp,
                      }}
                      style={styles.stampImage}
                    />

                    <Text
                      style={
                        styles.signatureLabel
                      }
                    >
                      Company Stamp
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          )}
        </View>

        {/* ================================================= */}
        {/* ACTIONS */}
        {/* ================================================= */}

        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>
            Document Actions
          </Text>

          <Text style={styles.actionsSubtitle}>
            Save your quotation or share it as a PDF.
          </Text>

          <AppButton
            title="✏ Edit Quotation"
            color="#FB8C00"
            onPress={editQuotation}
          />

          <AppButton
            title={
              mode === "edit"
                ? "Update Quotation"
                : "Save Quotation"
            }
            onPress={
              saveCurrentQuotation
            }
          />

          <AppButton
            title="⬇ Download PDF"
            onPress={download}
          />

          <AppButton
            title="📤 Share PDF"
            onPress={share}
          />
        </View>

        <View
          style={styles.bottomSpace}
        />
      </ScrollView>
    </View>
  );
}

// =====================================================
// CONTACT ITEM
// =====================================================

function ContactItem({
  icon,
  label,
  value,
  fullWidth = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <View
      style={[
        styles.contactItem,
        fullWidth &&
          styles.contactFullWidth,
      ]}
    >
      <View style={styles.contactIcon}>
        <Ionicons
          name={icon}
          size={15}
          color={Colors.primary}
        />
      </View>

      <View style={styles.contactText}>
        <Text style={styles.contactLabel}>
          {label}
        </Text>

        <Text
          style={styles.contactValue}
          numberOfLines={fullWidth ? 3 : 1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor:
      Colors.background,
  },

  // TOP BAR
  topBar: {
    minHeight: 72,
    paddingHorizontal: 17,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50, // For status bar spacing
  },

  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  backIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  topTitle: {
    marginLeft: 11,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  topSubtitle: {
    marginLeft: 11,
    marginTop: 2,
    fontSize: 10,
    color: Colors.textSecondary,
  },

  previewBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
  },

  previewBadgeText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primary,
  },

  // CONTAINER
  container: {
    flex: 1,
  },

  contentContainer: {
    padding: 14,
    paddingBottom: 30,
  },

  // DOCUMENT
  document: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E8ECF2",
  },

  // COMPANY
  companyCard: {
    borderRadius: 17,
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderWidth: 1,
    borderColor: "#E7ECF3",
  },

  companyTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 17,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#E3E8EF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  logo: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  companyMain: {
    flex: 1,
    marginLeft: 13,
  },

  companyName: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.textPrimary,
  },

  ownerName: {
    marginTop: 3,
    fontSize: 11,
    color: Colors.textSecondary,
  },

  gstRow: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  gstText: {
    marginLeft: 5,
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primary,
  },

  companyDivider: {
    height: 1,
    backgroundColor: "#E3E8EF",
    marginVertical: 13,
  },

  contactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  contactItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingRight: 8,
  },

  contactFullWidth: {
    width: "100%",
    marginTop: 3,
  },

  contactIcon: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  contactText: {
    flex: 1,
    marginLeft: 7,
  },

  contactLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: Colors.textSecondary,
    textTransform: "uppercase",
  },

  contactValue: {
    marginTop: 2,
    fontSize: 10,
    color: Colors.textPrimary,
  },

  // META
  metaCard: {
    marginTop: 12,
    borderRadius: 15,
    backgroundColor: "#F8FAFC",
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E7ECF3",
  },

  metaDivider: {
    width: 1,
    height: 35,
    backgroundColor: "#DDE3EB",
    marginHorizontal: 15,
  },

  metaRight: {
    alignItems: "flex-end",
    flex: 1,
  },

  metaLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },

  metaValue: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  // TOTAL
  totalCard: {
    marginTop: 13,
    padding: 15,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
  },

  totalAmount: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.primary,
  },

  // APPROVAL
  approvalCard: {
    marginTop: 15,
    padding: 14,
    borderRadius: 17,
    backgroundColor: "#FAFBFC",
    borderWidth: 1,
    borderColor: "#E7ECF3",
  },

  approvalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  approvalTitle: {
    marginLeft: 7,
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  approvalContent: {
    minHeight: 135,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },

  signatureBox: {
    alignItems: "center",
    minWidth: 170,
  },

  signatureImage: {
    width: 150,
    height: 75,
    resizeMode: "contain",
  },

  emptySignature: {
    height: 75,
    width: 150,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    marginTop: 4,
    fontSize: 9,
    color: Colors.textLight,
  },

  signatureLine: {
    width: 170,
    height: 1,
    backgroundColor: "#AAB2BD",
    marginTop: 5,
  },

  signatureLabel: {
    marginTop: 5,
    fontSize: 9,
    fontWeight: "700",
    color: Colors.textSecondary,
  },

  stampBox: {
    marginLeft: 20,
    alignItems: "center",
  },

  stampImage: {
    width: 85,
    height: 85,
    resizeMode: "contain",
  },

  // ACTIONS
  actionsCard: {
    marginTop: 15,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E8ECF2",
  },

  actionsTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  actionsSubtitle: {
    marginTop: 3,
    marginBottom: 12,
    fontSize: 10,
    color: Colors.textSecondary,
  },

  bottomSpace: {
    height: 25,
  },
});