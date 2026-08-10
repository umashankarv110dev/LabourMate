import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
} from "react-native";
import { Colors } from "@/src/constants/colors";
import { Company } from "../../types/companybill";

interface Props {
  grandTotal: number;
  company: Company | null;
}

export default function FooterSection({
  grandTotal,
  company,
}: Props) {
  return (
    <View style={styles.container}>

      {/* Grand Total */}

      <View style={styles.totalContainer}>

        <Text style={styles.totalLabel}>
          Grand Total
        </Text>

        <Text style={styles.totalValue}>
          ₹ {grandTotal.toLocaleString("en-IN")}
        </Text>

      </View>

      {/* Signature */}

      <View style={styles.signatureContainer}>

        {company?.signature ? (
          <Image
            source={{
              uri: company.signature,
            }}
            style={styles.signature}
          />
        ) : (
          <View style={styles.emptySignature} />
        )}

        <View style={styles.signatureLine} />

        <Text style={styles.signatureText}>
          Authorized Signature
        </Text>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    marginTop:25,
  },

  totalContainer:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",

    borderTopWidth:2,
    borderBottomWidth:2,

    borderColor:Colors.black,

    paddingVertical:12,
  },

  totalLabel:{
    fontSize:18,
    fontWeight:"700",
    color:Colors.black,
  },

  totalValue:{
    fontSize:22,
    fontWeight:"700",
    color:Colors.primary,
  },

  signatureContainer:{
    marginTop:40,
    alignItems:"flex-end",
  },

  signature:{
    width:170,
    height:80,
    resizeMode:"contain",
  },

  emptySignature:{
    width:170,
    height:80,
  },

  signatureLine:{
    width:180,
    borderTopWidth:1,
    borderColor:Colors.black,
    marginTop:5,
  },

  signatureText:{
    marginTop:5,
    fontWeight:"700",
    color:Colors.black,
  },

});