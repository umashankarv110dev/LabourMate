import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Colors } from "@/src/constants/colors";

interface Props {
  quotationNo: string;
  date: string;
  title: string;
  customerName: string;
  siteName: string;
}

export default function CustomerSection({
  quotationNo,
  date,
  title,
  customerName,
  siteName,
}: Props) {
  return (
    <View style={styles.container}>

      {/* Quotation Info */}

      <View style={styles.row}>
        <Text style={styles.label}>
          Quotation No :
        </Text>

        <Text style={styles.value}>
          {quotationNo}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>
          Date :
        </Text>

        <Text style={styles.value}>
          {date}
        </Text>
      </View>

      {/* Title */}

      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          {title}
        </Text>
      </View>

      {/* Customer */}

      <View style={styles.customerContainer}>

        <Text style={styles.to}>
          To,
        </Text>

        <Text style={styles.customer}>
          {customerName}
        </Text>

        {siteName ? (
          <Text style={styles.site}>
            {siteName}
          </Text>
        ) : null}

      </View>

      <View style={styles.divider} />

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    marginBottom:20,
  },

  row:{
    flexDirection:"row",
    marginBottom:5,
  },

  label:{
    width:120,
    fontWeight:"700",
    color:Colors.black,
    fontSize:14,
  },

  value:{
    flex:1,
    color:Colors.text,
    fontSize:14,
  },

  titleContainer:{
    alignItems:"center",
    marginVertical:20,
  },

  title:{
    fontSize:20,
    fontWeight:"700",
    textDecorationLine:"underline",
    color:Colors.black,
    textTransform:"uppercase",
  },

  customerContainer:{
    marginBottom:15,
  },

  to:{
    fontWeight:"700",
    fontSize:15,
    marginBottom:5,
  },

  customer:{
    fontSize:16,
    fontWeight:"600",
    color:Colors.black,
  },

  site:{
    fontSize:14,
    color:Colors.text,
    marginTop:3,
  },

  divider:{
    height:1,
    backgroundColor:Colors.border,
  },

});