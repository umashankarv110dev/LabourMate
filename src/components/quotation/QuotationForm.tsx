import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import AppButton from "../common/AppButton";
import AppCard from "../common/AppCard";
import AppInput from "../common/AppInput";
import ItemList from "./ItemList";
import SearchModal, {
  SearchItem,
} from "../common/SearchModal";

import { Colors } from "@/src/constants/colors";

import { Company } from "../../types/company";
import { Item } from "../../types/item";
import { Customer } from "../../types/customer";
import {
  getCustomers,
  addCustomer,
} from "../../services/customerStorage";

import {
  calculateGrandTotal,
} from "../../utils/calculation";

import {
  generateBillNo,
  generateQuotationNo,
} from "@/src/utils/generator";

import {
  getTodayDate,
} from "../../utils/date";

import { useCompany } from "@/src/contexts/CompanyContext";

import { Quotation } from "@/src/types/quotation";

interface Props {
  mode: "create" | "edit";
  quotation?: any;
}

export default function QuotationForm({
  mode,
  quotation,
}: Props) {
  const insets = useSafeAreaInsets();

  const { company: savedCompany } = useCompany();

  const defaultItem: Item = {
    id: Date.now().toString(),
    description: "",
    unit: "Nos",

    showSize: false,
    showQty: false,
    showRate: false,

    size: "",
    qty: "",
    rate: "",

    total: "",

    remarks: "",
  };

  const [customerModalVisible, setCustomerModalVisible] =
    useState(false);

  const [siteModalVisible, setSiteModalVisible] =
    useState(false);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [documentType, setDocumentType] =
    useState<"Quotation" | "Bill">(
      "Quotation"
    );

  const [company, setCompany] =
    useState<Company | null>(null);

  const [items, setItems] =
    useState<Item[]>([defaultItem]);

  const [form, setForm] = useState({
    id: Date.now().toString(),
    quotationNo: generateQuotationNo(),
    date: getTodayDate(),
    customerName: "",
    siteName: "",
    quotationTitle: "",
    notes:
      "1. Material once sold will not be taken back.\n2. Transportation charges extra.\n3. Payment: 50% Advance, 50% After Completion of work",
  });

  useEffect(() => {
    // --------------------------------------------------
    // EDIT MODE
    // Existing quotation company should remain unchanged
    // --------------------------------------------------

    if (mode === "edit" && quotation) {
      setForm({
        id: quotation.id,
        quotationNo: quotation.quotationNo,
        date: quotation.date,
        customerName: quotation.customerName,
        siteName: quotation.siteName,
        quotationTitle: quotation.quotationTitle,
        notes: quotation.notes,
      });

      setItems(
        Array.isArray(quotation.items)
          ? quotation.items
          : [defaultItem]
      );

      // Keep the company information stored
      // inside the existing quotation.
      if (quotation.company) {
        setCompany(quotation.company);
      }
    }

    loadCustomerList();
  }, []);
  useEffect(() => {
    // --------------------------------------------------
    // CREATE MODE
    // Use latest Company Profile from SQLite/Context
    // --------------------------------------------------

    if (mode === "create" && savedCompany) {
      setCompany(savedCompany);
    }
  }, [mode, savedCompany]);


  // const loadCompany = async () => {
  //   try {
  //     const data = await getData(
  //       StorageKeys.COMPANY
  //     );

  //     if (data) {
  //       setCompany(data);
  //     }
  //   } catch (error) {
  //     console.log(
  //       "Load Company Error:",
  //       error
  //     );
  //   }
  // };

  const loadCustomerList = async () => {
    try {
      const list = await getCustomers();
      setCustomers(list);
    } catch (error) {
      console.log(
        "Customer Load Error:",
        error
      );
    }
  };

  const customerSuggestions: SearchItem[] =
    customers.map((customer) => ({
      id: customer.id,
      title: customer.customerName,
      subtitle: `${customer.sites.length} Site(s)`,
      data: customer,
    }));

  const siteSuggestions: SearchItem[] =
    selectedCustomer
      ? selectedCustomer.sites.map((site) => ({
          id: site.id,
          title: site.name,
          data: site,
        }))
      : [];

  const updateField = (
    key: string,
    value: any
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const onDateChange = (
    event: any,
    selectedDate?: Date
  ) => {
    setShowDatePicker(false);

    if (!selectedDate) {
      return;
    }

    const day = String(
      selectedDate.getDate()
    ).padStart(2, "0");

    const month = String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0");

    const year =
      selectedDate.getFullYear();

    updateField(
      "date",
      `${day}/${month}/${year}`
    );
  };

  const previewQuotation = async () => {
    if (!company) {
      Alert.alert(
        "Company Details Missing",
        "Please configure company details first."
      );
      return;
    }

    if (!form.customerName.trim()) {
      Alert.alert(
        "Customer Required",
        "Please select or enter customer name."
      );
      return;
    }

    if (!form.quotationTitle.trim()) {
      Alert.alert(
        "Title Required",
        `Please enter ${
          documentType === "Quotation"
            ? "quotation"
            : "bill"
        } title.`
      );
      return;
    }

    if (!items.length) {
      Alert.alert(
        "Items Required",
        "Please add at least one item."
      );
      return;
    }

    await addCustomer(
      form.customerName,
      form.siteName
    );

    const quotationData: Quotation = {
      id:
        mode === "edit"
          ? quotation?.id
          : Date.now().toString(),

      quotationNo:
        mode === "edit"
          ? quotation?.quotationNo
          : documentType === "Quotation"
          ? generateQuotationNo()
          : generateBillNo(),

      date: form.date,

      quotationTitle:
        form.quotationTitle,

      customerName:
        form.customerName,

      siteName:
        form.siteName,

      company: company,

      items: items,

      notes: form.notes,

      grandTotal:
        calculateGrandTotal(items),

      status:
        mode === "edit"
          ? quotation?.status ?? "Saved"
          : "Draft",

      createdAt:
        mode === "edit"
          ? quotation?.createdAt
          : new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    };

    router.push({
      pathname: "/quotation/preview",
      params: {
        quotation:
          JSON.stringify(
            quotationData
          ),
        mode,
      },
    });
  };

  return (
    <View style={styles.container}>
          <StatusBar barStyle="light-content" />
    
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* HEADER */}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        {/* ================================================= */}
        {/* TOP HEADER */}
        {/* ================================================= */}

        <LinearGradient
          colors={["#2563EB", "#3B82F6", "#60A5FA"]}
          style={styles.header}>
          <View style={styles.headerTop}>
            <View
              style={styles.headerIcon}
            >
              <Ionicons
                name={
                  documentType ===
                  "Quotation"
                    ? "document-text-outline"
                    : "receipt-outline"
                }
                size={27}
                color="#FFFFFF"
              />
            </View>

            <View
              style={styles.headerContent}
            >
              <Text
                style={styles.headerEyebrow}
              >
                {mode === "edit"
                  ? "EDIT DOCUMENT"
                  : "CREATE DOCUMENT"}
              </Text>

              <Text
                style={styles.headerTitle}
              >
                {documentType}
              </Text>

              <Text
                style={styles.headerSubtitle}
              >
                Create a professional
                business document
              </Text>
            </View>
          </View>

          {/* Document number */}

          <View
            style={styles.documentBadge}
          >
            <Ionicons
              name="barcode-outline"
              size={17}
              color="#DBEAFE"
            />

            <Text
              style={styles.documentBadgeText}
            >
              {form.quotationNo}
            </Text>
          </View>
        </LinearGradient>

        {/* ================================================= */}
        {/* MAIN FORM */}
        {/* ================================================= */}

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom:
                125 + insets.bottom,
            },
          ]}
        >
          {/* ================================================= */}
          {/* COMPANY */}
          {/* ================================================= */}

          <View
            style={styles.sectionHeading}
          >
            <View
              style={styles.sectionIcon}
            >
              <Ionicons
                name="business-outline"
                size={20}
                color={Colors.primary}
              />
            </View>

            <View>
              <Text
                style={styles.sectionTitle}
              >
                Company
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Your business information
              </Text>
            </View>
          </View>

          <AppCard
            style={styles.card}
          >
            <View
              style={styles.companyRow}
            >
              <View
                style={
                  styles.companyIcon
                }
              >
                <Ionicons
                  name="business"
                  size={27}
                  color={Colors.primary}
                />
              </View>

              <View
                style={
                  styles.companyInfo
                }
              >
                <Text
                  style={
                    styles.companyName
                  }
                  numberOfLines={1}
                >
                  {company?.owner_name ||
                    "Company not configured"}
                </Text>

                <Text
                  style={
                    styles.companyMobile
                  }
                >
                  {company?.phone ||
                    "Add company mobile number"}
                </Text>
              </View>

              <View
                style={
                  styles.verifiedBadge
                }
              >
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={
                    Colors.success
                  }
                />
              </View>
            </View>
          </AppCard>

          {/* ================================================= */}
          {/* CUSTOMER */}
          {/* ================================================= */}

          <View
            style={styles.sectionHeading}
          >
            <View
              style={styles.sectionIcon}
            >
              <Ionicons
                name="people-outline"
                size={20}
                color={Colors.primary}
              />
            </View>

            <View>
              <Text
                style={styles.sectionTitle}
              >
                Customer Details
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Who is this document for?
              </Text>
            </View>
          </View>

          <AppCard
            style={styles.card}
          >
            <AppInput
              leftIcon="person-outline"
              rightIcon="search"
              clearIcon="close-circle"
              placeholder="Customer Name"
              value={
                form.customerName
              }
              onChangeText={(text) => {
                updateField(
                  "customerName",
                  text
                );

                updateField(
                  "siteName",
                  ""
                );

                setSelectedCustomer(
                  null
                );
              }}
              onRightIconPress={async () => {
                await loadCustomerList();
                setCustomerModalVisible(
                  true
                );
              }}
              onClearIconPress={() => {
                updateField(
                  "customerName",
                  ""
                );

                updateField(
                  "siteName",
                  ""
                );

                setSelectedCustomer(
                  null
                );
              }}
            />

            <AppInput
              leftIcon="location-outline"
              rightIcon="search"
              clearIcon="close-circle"
              placeholder="Site Name"
              value={form.siteName}
              onChangeText={(text) =>
                updateField(
                  "siteName",
                  text
                )
              }
              onRightIconPress={() => {
                if (
                  !selectedCustomer
                ) {
                  Alert.alert(
                    "Customer Required",
                    "Please select a customer first."
                  );
                  return;
                }

                setSiteModalVisible(
                  true
                );
              }}
              onClearIconPress={() => {
                updateField(
                  "siteName",
                  ""
                );

                setSelectedCustomer(
                  null
                );
              }}
            />

            {form.customerName.trim() && (
              <View
                style={
                  styles.selectedInfo
                }
              >
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={
                    Colors.success
                  }
                />

                <Text
                  style={
                    styles.selectedInfoText
                  }
                >
                  Customer selected
                </Text>
              </View>
            )}
          </AppCard>

          {/* ================================================= */}
          {/* DOCUMENT DETAILS */}
          {/* ================================================= */}

          <View
            style={styles.sectionHeading}
          >
            <View
              style={styles.sectionIcon}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color={Colors.primary}
              />
            </View>

            <View>
              <Text
                style={styles.sectionTitle}
              >
                Document Details
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Configure quotation or bill
              </Text>
            </View>
          </View>

          <AppCard
            style={styles.card}
          >
            <Text
              style={styles.fieldLabel}
            >
              Document Type
            </Text>

            <View
              style={
                styles.typeSelector
              }
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.typeButton,
                  documentType ===
                    "Quotation" &&
                    styles.typeButtonActive,
                ]}
                onPress={() => {
                  setDocumentType(
                    "Quotation"
                  );

                  updateField(
                    "quotationNo",
                    generateQuotationNo()
                  );
                }}
              >
                <Ionicons
                  name="document-text-outline"
                  size={19}
                  color={
                    documentType ===
                    "Quotation"
                      ? "#FFFFFF"
                      : Colors.primary
                  }
                />

                <Text
                  style={[
                    styles.typeButtonText,
                    documentType ===
                      "Quotation" &&
                      styles.typeButtonTextActive,
                  ]}
                >
                  Quotation
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.typeButton,
                  documentType ===
                    "Bill" &&
                    styles.typeButtonActive,
                ]}
                onPress={() => {
                  setDocumentType(
                    "Bill"
                  );

                  updateField(
                    "quotationNo",
                    generateBillNo()
                  );
                }}
              >
                <Ionicons
                  name="receipt-outline"
                  size={19}
                  color={
                    documentType ===
                    "Bill"
                      ? "#FFFFFF"
                      : Colors.primary
                  }
                />

                <Text
                  style={[
                    styles.typeButtonText,
                    documentType ===
                      "Bill" &&
                      styles.typeButtonTextActive,
                  ]}
                >
                  Bill
                </Text>
              </TouchableOpacity>
            </View>

            <AppInput
              editable={false}
              leftIcon="barcode-outline"
              placeholder={
                documentType ===
                "Quotation"
                  ? "Quotation Number"
                  : "Bill Number"
              }
              value={
                form.quotationNo
              }
            />

            <AppInput
              placeholder="Document Date"
              value={form.date}
              editable={false}
              leftIcon="calendar-outline"
              rightIcon="calendar"
              onRightIconPress={() =>
                setShowDatePicker(
                  true
                )
              }
              onPressIn={() =>
                setShowDatePicker(
                  true
                )
              }
            />

            <AppInput
              leftIcon="create-outline"
              placeholder={
                documentType ===
                "Quotation"
                  ? "Quotation Title"
                  : "Bill Title"
              }
              value={
                form.quotationTitle
              }
              onChangeText={(
                text
              ) =>
                updateField(
                  "quotationTitle",
                  text
                )
              }
            />
          </AppCard>

          {/* ================================================= */}
          {/* ITEMS */}
          {/* ================================================= */}

          <View
            style={styles.sectionHeading}
          >
            <View
              style={styles.sectionIcon}
            >
              <Ionicons
                name="list-outline"
                size={20}
                color={Colors.primary}
              />
            </View>

            <View>
              <Text
                style={styles.sectionTitle}
              >
                Items
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Add products or services
              </Text>
            </View>
          </View>

          <ItemList
            items={items}
            setItems={setItems}
          />

          {/* ================================================= */}
          {/* NOTES */}
          {/* ================================================= */}

          <View
            style={styles.sectionHeading}
          >
            <View
              style={styles.sectionIcon}
            >
              <Ionicons
                name="chatbox-ellipses-outline"
                size={20}
                color={Colors.primary}
              />
            </View>

            <View>
              <Text
                style={styles.sectionTitle}
              >
                Notes & Terms
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Add payment terms or notes
              </Text>
            </View>
          </View>

          <AppCard
            style={styles.card}
          >
            <AppInput
              multiline
              numberOfLines={5}
              style={{
                height: 130,
                textAlignVertical:
                  "top",
              }}
              placeholder="Notes & Terms"
              value={form.notes}
              onChangeText={(
                text
              ) =>
                updateField(
                  "notes",
                  text
                )
              }
            />
          </AppCard>

          {/* Extra scroll space */}

          <View
            style={{
              height: 20,
            }}
          />
        </ScrollView>

        {/* ================================================= */}
        {/* FIXED BOTTOM ACTION */}
        {/* ================================================= */}

        <View
          style={[
            styles.bottomBar,
            {
              paddingBottom:
                Math.max(
                  insets.bottom + 8,
                  18
                ),
            },
          ]}
        >
          <View
            style={styles.bottomSummary}
          >
            <View
              style={
                styles.previewIcon
              }
            >
              <Ionicons
                name="eye-outline"
                size={21}
                color={Colors.primary}
              />
            </View>

            <View
              style={
                styles.previewTextContainer
              }
            >
              <Text
                style={
                  styles.previewLabel
                }
              >
                Ready to preview
              </Text>

              <Text
                style={
                  styles.previewSubLabel
                }
              >
                Review your document before saving
              </Text>
            </View>
          </View>

          <AppButton
            title={
              mode === "create"
                ? `Preview ${documentType}`
                : "Update Preview"
            }
            onPress={
              previewQuotation
            }
          />
        </View>

        {/* ================================================= */}
        {/* CUSTOMER SEARCH */}
        {/* ================================================= */}

        <SearchModal
          visible={
            customerModalVisible
          }
          title="Select Customer"
          placeholder="Search Customer"
          data={
            customerSuggestions
          }
          onClose={() =>
            setCustomerModalVisible(
              false
            )
          }
          onSelect={(item) => {
            const customer =
              item.data as Customer;

            setSelectedCustomer(
              customer
            );

            updateField(
              "customerName",
              customer.customerName
            );

            updateField(
              "siteName",
              ""
            );

            setCustomerModalVisible(
              false
            );
          }}
        />

        {/* ================================================= */}
        {/* SITE SEARCH */}
        {/* ================================================= */}

        <SearchModal
          visible={
            siteModalVisible
          }
          title="Select Site"
          placeholder="Search Site"
          data={
            siteSuggestions
          }
          onClose={() =>
            setSiteModalVisible(
              false
            )
          }
          onSelect={(item) => {
            updateField(
              "siteName",
              item.title
            );

            setSiteModalVisible(
              false
            );
          }}
        />

        {/* ================================================= */}
        {/* DATE PICKER */}
        {/* ================================================= */}

        {showDatePicker && (
          <DateTimePicker
            value={
              form.date
                ? new Date(
                    form.date
                      .split("/")
                      .reverse()
                      .join("-")
                  )
                : new Date()
            }
            mode="date"
            display="default"
            maximumDate={
              new Date()
            }
            onChange={
              onDateChange
            }
          />
        )}
      </KeyboardAvoidingView>
            </ScrollView>

            </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },

  /* ================================================= */
  /* BASE */
  /* ================================================= */

  safeArea: {
    flex: 1,
    backgroundColor:
      Colors.background,
  },

  flex: {
    flex: 1,
  },

  /* ================================================= */
  /* HEADER */
  /* ================================================= */

  header: {
    paddingTop: 50,
    paddingHorizontal: 22,
    paddingBottom: 40,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,

    backgroundColor:
      "rgba(255,255,255,0.16)",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.20)",

    marginRight: 14,
  },

  headerContent: {
    flex: 1,
  },

  headerEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "#BFDBFE",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "800",
    marginTop: 3,
  },

  headerSubtitle: {
    color: "#DBEAFE",
    fontSize: 13,
    marginTop: 4,
  },

  documentBadge: {
    alignSelf: "flex-start",

    flexDirection: "row",
    alignItems: "center",

    marginTop: 18,

    paddingHorizontal: 12,
    paddingVertical: 7,

    borderRadius: 10,

    backgroundColor:
      "rgba(255,255,255,0.12)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.18)",
  },

  documentBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 7,
  },

  /* ================================================= */
  /* CONTENT */
  /* ================================================= */

  content: {
    paddingTop: 4,
  },

  /* ================================================= */
  /* SECTION HEADER */
  /* ================================================= */

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",

    marginHorizontal: 20,
    marginTop: 23,
    marginBottom: 9,
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
  /* CARD */
  /* ================================================= */

  card: {
    marginHorizontal: 18,
    borderRadius: 20,
    padding: 15,
    backgroundColor:
      Colors.white,
  },

  /* ================================================= */
  /* COMPANY */
  /* ================================================= */

  companyRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  companyIcon: {
    width: 56,
    height: 56,
    borderRadius: 17,

    backgroundColor:
      Colors.primaryLight,

    justifyContent: "center",
    alignItems: "center",
  },

  companyInfo: {
    flex: 1,
    marginLeft: 13,
  },

  companyName: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  companyMobile: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  verifiedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,

    backgroundColor:
      "#F0FDF4",

    justifyContent: "center",
    alignItems: "center",
  },

  /* ================================================= */
  /* CUSTOMER */
  /* ================================================= */

  selectedInfo: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor:
      "#F0FDF4",

    paddingHorizontal: 12,
    paddingVertical: 9,

    borderRadius: 10,

    marginTop: 5,
  },

  selectedInfoText: {
    marginLeft: 7,
    color: "#15803D",
    fontSize: 12,
    fontWeight: "600",
  },

  /* ================================================= */
  /* DOCUMENT TYPE */
  /* ================================================= */

  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 10,
  },

  typeSelector: {
    flexDirection: "row",

    backgroundColor:
      "#F1F5F9",

    padding: 4,

    borderRadius: 14,

    marginBottom: 8,
  },

  typeButton: {
    flex: 1,

    minHeight: 46,

    borderRadius: 11,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  typeButtonActive: {
    backgroundColor:
      Colors.primary,

    shadowColor:
      Colors.primary,

    shadowOpacity: 0.22,
    shadowRadius: 6,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 4,
  },

  typeButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 7,
  },

  typeButtonTextActive: {
    color: "#FFFFFF",
  },

  /* ================================================= */
  /* BOTTOM BAR */
  /* ================================================= */

  bottomBar: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor:
      Colors.white,

    paddingHorizontal: 18,
    paddingTop: 10,

    borderTopWidth: 1,
    borderTopColor:
      "#E2E8F0",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: -5,
    },

    shadowOpacity: 0.10,
    shadowRadius: 12,

    elevation: 20,
  },

  bottomSummary: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 3,
  },

  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,

    backgroundColor:
      Colors.primaryLight,

    justifyContent: "center",
    alignItems: "center",
  },

  previewTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  previewLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  previewSubLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});