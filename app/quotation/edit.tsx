import React from "react";
import { useLocalSearchParams } from "expo-router";

import QuotationForm from "../../src/components/quotation/QuotationForm";

export default function EditQuotationScreen() {

  const {quotation, duplicate}=useLocalSearchParams();

  return (
    <QuotationForm

      mode={
        duplicate
        ?"create"
        :"edit"
      }

      quotation={
        JSON.parse(
        quotation as string
      )}

    />
  );

}