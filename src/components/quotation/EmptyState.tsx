import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Colors } from "@/src/constants/colors";

export default function EmptyState() {
  return (
    <View style={styles.container}>

      <Text style={styles.icon}>
        📄
      </Text>

      <Text style={styles.title}>
        No Quotations Found
      </Text>

      <Text style={styles.subtitle}>
        Click + button to create your first quotation.
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    marginTop:100,
    alignItems:"center",
  },

  icon:{
    fontSize:70,
  },

  title:{
    fontSize:20,
    fontWeight:"700",
    marginTop:15,
  },

  subtitle:{
    color:"#777",
    marginTop:8,
    textAlign:"center",
  }

});