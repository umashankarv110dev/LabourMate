import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { Colors } from "@/src/constants/colors";
import { Item } from "../../types/item";

interface Props {
  items: Item[];
}

export default function ItemsTable({
  items,
}: Props) {

  const getTotal = (item: Item) => {

    if (
      item.showSize &&
      item.showQty &&
      item.showRate
    ) {

      return (
        Number(item.size || 0) *
        Number(item.qty || 0) *
        Number(item.rate || 0)
      );

    }

    return Number(item.total || 0);
  };

  return (
    <View style={styles.container}>

      {/* Header */}

      <View style={styles.headerRow}>

        <Text style={[styles.headerCell,{flex:0.6}]}>
          Sr
        </Text>

        <Text style={[styles.headerCell,{flex:3}]}>
          Description
        </Text>

        <Text style={styles.headerCell}>
          Unit
        </Text>

        <Text style={styles.headerCell}>
          Size
        </Text>

        <Text style={styles.headerCell}>
          Qty
        </Text>

        <Text style={styles.headerCell}>
          Rate
        </Text>

        <Text style={styles.headerCell}>
          Total
        </Text>

      </View>

      {/* Rows */}

      {items.map((item,index)=>(

        <View
          key={item.id}
          style={styles.row}
        >

          <Text style={[styles.cell,{flex:0.6}]}>
            {index+1}
          </Text>

          <View
            style={[
              styles.cell,
              {flex:3,alignItems:"flex-start"}
            ]}
          >

            <Text style={styles.description}>
              {item.description}
            </Text>

            {item.remarks ? (

              <Text style={styles.remarks}>
                {item.remarks}
              </Text>

            ) : null}

          </View>

          <Text style={styles.cell}>
            {item.unit || "-"}
          </Text>

          <Text style={styles.cell}>
            {item.showSize
              ? item.size || "-"
              : "-"}
          </Text>

          <Text style={styles.cell}>
            {item.showQty
              ? item.qty || "-"
              : "-"}
          </Text>

          <Text style={styles.cell}>
            {item.showRate
              ? item.rate || "-"
              : "-"}
          </Text>

          <Text style={styles.cell}>
            ₹ {getTotal(item)}
          </Text>

        </View>

      ))}

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    borderWidth:1,
    borderColor:Colors.border,
    marginBottom:20,
  },

  headerRow:{
    flexDirection:"row",
    backgroundColor:"#E3F2FD",
    borderBottomWidth:1,
    borderBottomColor:Colors.border,
  },

  headerCell:{
    flex:1,
    padding:8,
    textAlign:"center",
    fontWeight:"700",
    fontSize:12,
    color:Colors.black,
    borderRightWidth:1,
    borderRightColor:Colors.border,
  },

  row:{
    flexDirection:"row",
    borderBottomWidth:1,
    borderBottomColor:Colors.border,
  },

  cell:{
    flex:1,
    padding:8,
    fontSize:12,
    textAlign:"center",
    borderRightWidth:1,
    borderRightColor:Colors.border,
    justifyContent:"center",
    alignItems:"center",
  },

  description:{
    fontWeight:"600",
    color:Colors.black,
  },

  remarks:{
    fontSize:10,
    color:Colors.grey,
    marginTop:4,
  }

});