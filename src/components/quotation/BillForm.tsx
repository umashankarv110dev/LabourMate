import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";

import AppButton from "../common/AppButton";
import SectionHeader from "../common/ScreenHeader";
import AppCard from "../common/AppCard";
import AppInput from "../common/AppInput";

import ItemList from "./ItemList";
import { Colors } from "@/src/constants/colors";

import { Company } from "../../types/companybill";
import { Item } from "../../types/item";

import {
  getData,
  StorageKeys,
} from "../../services/storage";

import {
  calculateGrandTotal,
} from "../../utils/calculation";

import {
  generateQuotationNo,
} from "@/src/utils/generator";

import {
  getTodayDate,
} from "../../utils/date";
import { Quotation } from "@/src/types/quotation";


interface Props {
  mode: "create" | "edit";
  quotation?: any;
}

export default function BillForm({
  mode,
  quotation,
}: Props) {

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

  const [company, setCompany] =
    useState<Company | null>(null);

    const [items, setItems] = useState<Item[]>([
        defaultItem,
    ]);

    const [form, setForm] = useState({
        id: Date.now().toString(),
        quotationNo: generateQuotationNo(),
        date: getTodayDate(),
        customerName: "",
        siteName: "",
        quotationTitle: "",
        notes: "1. Material once sold will not be taken back. \n2. Transportation charges extra. \n3. Payment: 50% Advance, 50% After Completion of work",
    });

    useEffect(() => {

    loadCompany();

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
        setItems(quotation.items);
        setCompany(quotation.company);
    }

  }, []);

  const loadCompany =
    async () => {

      const data =
        await getData(
          StorageKeys.COMPANY
        );

      if (data) {

        setCompany(data);

      }

    };

  const updateField = (
    key: string,
    value: any
  ) => {

    setForm((prev) => ({

      ...prev,

      [key]: value,

    }));

  };

  const previewQuotation = () => {

  if (!company) {
    Alert.alert(
      "Company Details Missing",
      "Please configure company details first."
    );
    return;
  }

  if (!form.customerName.trim()) {
    Alert.alert(
      "Validation",
      "Please enter customer name."
    );
    return;
  }

  if (!form.quotationTitle.trim()) {
    Alert.alert(
      "Validation",
      "Please enter quotation title."
    );
    return;
  }

  const quotationData: Quotation = {
    id:
      mode === "edit"
        ? quotation?.id
        : Date.now().toString(),

    quotationNo:
      mode === "edit"
        ? quotation?.quotationNo
        : generateQuotationNo(),

    date: form.date,

    quotationTitle: form.quotationTitle,

    customerName: form.customerName,

    siteName: form.siteName,

    company: company,

    items: items,

    notes: form.notes,

    grandTotal: calculateGrandTotal(items),

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
      quotation: JSON.stringify(quotationData),
      mode,
    },
  });

};

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* Company */}

      <SectionHeader
        title="Company"
      />

      <AppCard>

        <AppInput
          editable={false}
          value={
            company?.companyName
          }
        />

        <AppInput
          editable={false}
          value={
            company?.mobile
          }
        />

      </AppCard>

      {/* Customer */}

      <SectionHeader
        title="Customer Details"
      />

      <AppCard>

        <AppInput
          placeholder="Customer Name"
          value={
            form.customerName
          }
          onChangeText={(
            text
          ) =>
            updateField(
              "customerName",
              text
            )
          }
        />

        <AppInput
          placeholder="Site Name"
          value={
            form.siteName
          }
          onChangeText={(
            text
          ) =>
            updateField(
              "siteName",
              text
            )
          }
        />

      </AppCard>

      {/* Quotation */}

      <SectionHeader
        title="Quotation Details"
      />

      <AppCard>

        <AppInput
          editable={false}
          value={
            form.quotationNo
          }
        />

        <AppInput
          editable={false}
          value={form.date}
        />

        <AppInput
          placeholder="Quotation Title"
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

            <SectionHeader
        title="Items"
      />

      <ItemList
        items={items}
        setItems={setItems}
        />

      <AppCard>

        <AppInput
          multiline
          numberOfLines={5}
          style={{
            height: 120,
            textAlignVertical:
              "top",
          }}
          placeholder="Notes"
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

      <AppButton
        title={
          mode === "create"
            ? "Preview Quotation"
            : "Update Preview"
        }
        onPress={
          previewQuotation
        }
      />

    </ScrollView>
  );

}

const styles = StyleSheet.create({

  container:{

    flex:1,

    backgroundColor:
      Colors.background,

    padding:15,

  },

});