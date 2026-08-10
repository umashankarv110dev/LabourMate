import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
} from "react-native";

import { Company } from "../../types/companybill";
import { Colors } from "@/src/constants/colors";

interface Props {
  company: Company | null;
}

export default function CompanyHeader({
  company,
}: Props) {
  if (!company) return null;

  return (
    <View style={styles.container}>
      {company.logo ? (
        <Image
          source={{ uri: company.logo }}
          style={styles.logo}
        />
      ) : null}

      <Text style={styles.companyName}>
        {company.companyName}
      </Text>

      <Text style={styles.address}>
        {company.addressLine1}
      </Text>

      <Text style={styles.address}>
        {company.addressLine2}
      </Text>

      <Text style={styles.info}>
        Mobile : {company.mobile}
      </Text>

      <Text style={styles.info}>
        Email : {company.email}
      </Text>

      {company.gstNumber ? (
        <Text style={styles.info}>
          GSTIN : {company.gstNumber}
        </Text>
      ) : null}

      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 15,
  },

  logo: {
    width: 90,
    height: 90,
    resizeMode: "contain",
    marginBottom: 10,
  },

  companyName: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black,
  },

  address: {
    fontSize: 14,
    color: Colors.text,
    textAlign: "center",
    marginTop: 2,
  },

  info: {
    fontSize: 13,
    color: Colors.text,
    marginTop: 2,
  },

  divider: {
    marginTop: 15,
    width: "100%",
    height: 1,
    backgroundColor: Colors.border,
  },
});