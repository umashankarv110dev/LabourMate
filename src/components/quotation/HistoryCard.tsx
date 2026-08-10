import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/colors";

interface Props {
  item: any;

  onView: () => void;

  onEdit: () => void;

  onDelete: () => void;

  onShare: () => void;

  onDuplicate: () => void;

  onConvert: () => void;
}

export default function HistoryCard({
  item,
  onView,
  onEdit,
  onDelete,
  onShare,
  onDuplicate,
  onConvert,
}: Props) {

  return (

    <View style={styles.card}>

      <Text style={styles.number}>
        {item.quotationNo}
      </Text>

      <Text style={styles.customer}>
        {item.customerName}
      </Text>

      <Text style={styles.site}>
        {item.siteName}
      </Text>

      <View style={styles.row}>

        <Text>
          {item.date}
        </Text>

        <Text style={styles.total}>
          ₹ {item.grandTotal}
        </Text>

      </View>

      <View style={styles.actionRow}>

        <ActionButton
          icon="eye-outline"
          color="#1565C0"
          onPress={onView}
        />

        <ActionButton
          icon="create-outline"
          color="#FB8C00"
          onPress={onEdit}
        />

        <ActionButton
          icon="copy-outline"
          color="#43A047"
          onPress={onDuplicate}
        />

        <ActionButton
          icon="share-social-outline"
          color="#8E24AA"
          onPress={onShare}
        />

        <ActionButton
          icon="trash-outline"
          color="#E53935"
          onPress={onDelete}
        />

        {/* <ActionButton
          icon="document-text-outline"
          color="#009688"
          onPress={onConvert}
        /> */}
        <ActionButton
          icon="receipt-outline"
          color="#009688"
          onPress={onConvert}
        />

      </View>

    </View>

  );

}

function ActionButton({
  icon,
  color,
  onPress,
}: any) {

  return (

    <TouchableOpacity
      style={[
        styles.action,
        {
          backgroundColor: color,
        },
      ]}
      onPress={onPress}
    >

      <Ionicons
        name={icon}
        size={18}
        color="#fff"
      />

    </TouchableOpacity>

  );

}

const styles = StyleSheet.create({

  card:{

    backgroundColor:"#fff",

    borderRadius:15,

    padding:15,

    marginBottom:15,

    elevation:3,

  },

  number:{
    fontWeight:"700",
    fontSize:18,
  },

  customer:{
    marginTop:8,
    fontSize:16,
  },

  site:{
    color:"#666",
    marginTop:2,
  },

  row:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginTop:15,
  },

  total:{
    color:Colors.primary,
    fontWeight:"700",
  },

  actionRow:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginTop:20,
  },

  action:{
    width:42,
    height:42,
    borderRadius:10,
    justifyContent:"center",
    alignItems:"center",
  },

});