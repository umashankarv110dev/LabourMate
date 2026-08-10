import React, { useEffect, useState } from "react";

import AppInput from "../common/AppInput";
import SuggestionDropdown, {
  SuggestionItem,
} from "../common/SuggestionDropdown";

import {
  Customer,
} from "../../types/customer";

import {
  searchCustomers,
} from "../../services/customerStorage";

interface Props {
  value: string;
  onChange: (text: string) => void;
  onSelect: (customer: Customer) => void;
}

export default function CustomerDropdown({
  value,
  onChange,
  onSelect,
}: Props) {

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [show, setShow] =
    useState(false);

  useEffect(() => {
    loadCustomers();
  }, [value]);

  const loadCustomers = async () => {
    const result =
      await searchCustomers(value);
    setCustomers(result);
  };

  const suggestions: SuggestionItem[] =
  customers.map((item) => ({
    id: item.id,
    title: item.customerName,
    subtitle: `${item.sites.length} Site(s)`,
    data: item,
  }));

  return (
    <>
      <AppInput
        placeholder="Customer Name"
        value={value}
        onChangeText={(text) => {
          onChange(text);
          setShow(true);
        }}

        onFocus={() => {
          if (customers.length > 0) {
            setShow(true);
          }
        }}
      />

      <SuggestionDropdown
        visible={show}
        data={suggestions}
        onClose={() => setShow(false)}
        onSelect={(item) => {
          console.log(item);
          onSelect(item.data);
          setShow(false);
        }}
      />
    </>
  );

}