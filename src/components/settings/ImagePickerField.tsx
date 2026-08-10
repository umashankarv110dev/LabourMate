import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/src/constants/colors";


interface Props {
  title: string;
  value: string;
  onChange: (uri: string) => void;
}

export default function ImagePickerField({
  title,
  value,
  onChange,
}: Props) {
  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permission required");
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });

    if (!result.canceled) {
      onChange(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity
        style={styles.box}
        onPress={pickImage}
      >
        {value ? (
          <Image
            source={{ uri: value }}
            style={styles.image}
          />
        ) : (
          <Text style={styles.placeholder}>
            Tap to Select
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },

  title: {
    fontWeight: "700",
    marginBottom: 8,
  },

  box: {
    height: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },

  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    resizeMode: "contain",
  },

  placeholder: {
    color: Colors.grey,
  },
});