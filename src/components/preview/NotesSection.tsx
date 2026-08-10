import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Colors } from "@/src/constants/colors";

interface Props {
  notes: string;
}

export default function NotesSection({
  notes,
}: Props) {

  if (!notes || notes.trim() === "") {
    return null;
  }

  // Support multiline notes
  const lines = notes
    .split("\n")
    .filter((item) => item.trim() !== "");

  return (
    <View style={styles.container}>

      <Text style={styles.heading}>
        Notes
      </Text>

      {lines.map((line, index) => (

        <View
          key={index}
          style={styles.row}
        >

          <Text style={styles.bullet}>
            •
          </Text>

          <Text style={styles.note}>
            {line}
          </Text>

        </View>

      ))}

    </View>
  );
}

const styles = StyleSheet.create({

  container:{

    marginTop:20,

    borderWidth:1,

    borderColor:Colors.border,

    borderRadius:8,

    padding:15,

    backgroundColor:"#FAFAFA",

  },

  heading:{

    fontSize:16,

    fontWeight:"700",

    marginBottom:10,

    color:Colors.black,

  },

  row:{

    flexDirection:"row",

    marginBottom:8,

  },

  bullet:{

    width:18,

    fontSize:16,

    color:Colors.primary,

    fontWeight:"700",

  },

  note:{

    flex:1,

    fontSize:14,

    color:Colors.text,

    lineHeight:22,

  }

});