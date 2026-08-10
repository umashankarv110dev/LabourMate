import React from "react";
import {
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import AppButton from "../../src/components/common/AppButton";

import CompanyHeader from "../../src/components/preview/CompanyHeader";
import CustomerSection from "../../src/components/preview/CustomerSection";
import ItemsTable from "../../src/components/preview/ItemsTable";
import NotesSection from "../../src/components/preview/NotesSection";
import FooterSection from "../../src/components/preview/FooterSection";

import { calculateGrandTotal } from "../../src/utils/calculation";
import { generatePDF, sharePDF } from "@/src/services/pdf";
import { Colors } from "@/src/constants/colors";
import { saveQuotation, updateQuotation } from "@/src/services/quotationStorage";

export default function PreviewScreen() {

  const { quotation, mode } = useLocalSearchParams();

  if (!quotation) {
    return null;
  }

  const data = JSON.parse(quotation as string);

  const grandTotal = calculateGrandTotal(data.items);

  const download = async()=>{
    const uri= await generatePDF(data);
      Alert.alert(
      "PDF Saved",
      uri
    );

  };

  const share = async()=>{
    await sharePDF(data);
  };

  

  // const saveCurrentQuotation = async () => {
  //   try {
  //     await saveQuotation(data);
  //     Alert.alert(
  //       "Success",
  //       "Quotation Saved Successfully",
  //       [
  //         {
  //           text: "OK",
  //           onPress: () =>
  //             router.replace("/quotation/history"),
  //         },
  //       ]
  //     );

  //   } catch (e) {
  //     Alert.alert(
  //       "Error",
  //       "Unable to save quotation."
  //     );
  //   }
  // };

  const saveCurrentQuotation = async () => {
    try {
      if (mode === "edit") {
        await updateQuotation(data);
        Alert.alert(
          "Updated",
          "Quotation Updated Successfully",
          [
            {
              text: "OK",
              onPress: () =>
                router.replace("/quotation/history"),
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
          "Quotation already exists."
        );

        return;

      }

      Alert.alert(
        "Saved",
        "Quotation Saved Successfully",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace("/quotation/history"),
          },
        ]
      );

    } catch {

      Alert.alert(
        "Error",
        "Something went wrong."
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <CompanyHeader
        company={data.company}
      />

      <CustomerSection
        quotationNo={data.quotationNo}
        date={data.date}
        title={data.quotationTitle}
        customerName={data.customerName}
        siteName={data.siteName}
      />

      <ItemsTable
        items={data.items}
      />

      <NotesSection
        notes={data.notes}
      />

      <FooterSection
        grandTotal={grandTotal}
        company={data.company}
      />

      <AppButton
        title="✏ Edit Quotation"
        color="#FB8C00"
        onPress = {() => router.back()}
      />

      <AppButton
        title={
        mode==="edit"
        ?"Update Quotation"
        :"Save Quotation"
        }
        onPress={saveCurrentQuotation}
      />

      <AppButton
        title="⬇ Download PDF"
        onPress={download}
      />

      <AppButton
        title="📤 Share PDF"
        onPress={share}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 15,

  },

});