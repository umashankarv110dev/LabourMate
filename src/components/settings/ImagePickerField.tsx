import React from "react";

import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/src/constants/colors";


// =====================================================
// PROPS
// =====================================================

interface Props {
  title: string;
  subtitle?: string;
  value: string | null;
  onChange: (uri: string | null) => void;
  icon?: keyof typeof Ionicons.glyphMap;
}


// =====================================================
// COMPONENT
// =====================================================

export default function ImagePickerField({
  title,
  subtitle,
  value,
  onChange,
  icon = "image-outline",
}: Props) {

  // ===================================================
  // SELECT + CROP
  // ===================================================

  const pickImage = async () => {
    try {

      // -----------------------------------------------
      // Permission
      // -----------------------------------------------

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow photo library access to select an image."
        );

        return;
      }


      // -----------------------------------------------
      // Select Image + Native Crop
      // -----------------------------------------------

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],

          // IMPORTANT:
          // Opens native crop editor after selecting
          allowsEditing: true,

          // Do NOT set aspect [1,1]
          // because signature can be wide
          quality: 1,
        });


      // -----------------------------------------------
      // Cancelled
      // -----------------------------------------------

      if (
        result.canceled ||
        !result.assets ||
        result.assets.length === 0
      ) {
        return;
      }


      // -----------------------------------------------
      // Selected / Cropped URI
      // -----------------------------------------------

      const uri =
        result.assets[0].uri;

      if (!uri) {
        return;
      }


      // -----------------------------------------------
      // Send back to Company Screen
      // -----------------------------------------------

      onChange(uri);

    } catch (error) {

      console.error(
        "IMAGE PICKER ERROR:",
        error
      );

      Alert.alert(
        "Image Error",
        "Unable to select or crop the image. Please try again."
      );
    }
  };


  // ===================================================
  // REMOVE IMAGE
  // ===================================================

  const removeImage = () => {

    Alert.alert(
      `Remove ${title}?`,
      `Are you sure you want to remove the ${title.toLowerCase()}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Remove",
          style: "destructive",

          onPress: () => {
            onChange(null);
          },
        },
      ]
    );
  };


  // ===================================================
  // RETURN UI
  // ===================================================

  return (
    <View style={styles.container}>

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <View style={styles.headerRow}>

        <View style={styles.titleIcon}>
          <Ionicons
            name={icon}
            size={19}
            color={Colors.primary}
          />
        </View>


        <View style={styles.titleContent}>

          <Text style={styles.title}>
            {title}
          </Text>


          {subtitle ? (
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}

        </View>

      </View>


      {/* ================================================= */}
      {/* IMAGE PREVIEW */}
      {/* ================================================= */}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={pickImage}
        style={[
          styles.box,
          value
            ? styles.boxWithImage
            : styles.boxEmpty,
        ]}
      >

        {value ? (

          <>
            <Image
              source={{
                uri: value,
              }}
              style={styles.image}
            />

            {/* EDIT ICON */}

            <View style={styles.editBadge}>

              <Ionicons
                name="create-outline"
                size={18}
                color={Colors.white}
              />

            </View>

          </>

        ) : (

          <View style={styles.emptyState}>

            <View style={styles.uploadIcon}>

              <Ionicons
                name="cloud-upload-outline"
                size={29}
                color={Colors.primary}
              />

            </View>


            <Text
              style={styles.placeholderTitle}
            >
              Tap to Select & Crop
            </Text>


            <Text
              style={styles.placeholderText}
            >
              Select image and crop if required
            </Text>

          </View>

        )}

      </TouchableOpacity>


      {/* ================================================= */}
      {/* STATUS */}
      {/* ================================================= */}

      {value ? (

        <View style={styles.statusRow}>

          <Ionicons
            name="checkmark-circle"
            size={16}
            color={Colors.success}
          />

          <Text style={styles.statusText}>
            Image selected
          </Text>

        </View>

      ) : null}


      {/* ================================================= */}
      {/* REMOVE */}
      {/* ================================================= */}

      {value ? (

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={removeImage}
          style={styles.removeButton}
        >

          <Ionicons
            name="trash-outline"
            size={15}
            color={Colors.danger}
          />

          <Text style={styles.removeText}>
            Remove {title}
          </Text>

        </TouchableOpacity>

      ) : null}

    </View>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    marginBottom: 22,
  },


  // ===================================================
  // HEADER
  // ===================================================

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },


  titleIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,

    backgroundColor: "#EFF6FF",

    alignItems: "center",
    justifyContent: "center",
  },


  titleContent: {
    flex: 1,
    marginLeft: 10,
  },


  title: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textPrimary,
  },


  subtitle: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 15,
    color: Colors.textSecondary,
  },


  // ===================================================
  // BOX
  // ===================================================

  box: {
    height: 155,

    borderWidth: 1.5,
    borderRadius: 16,

    overflow: "hidden",

    alignItems: "center",
    justifyContent: "center",
  },


  boxEmpty: {
    borderColor: Colors.border,
    borderStyle: "dashed",
    backgroundColor: "#FAFCFF",
  },


  boxWithImage: {
    borderColor: "#DCE3EC",
    borderStyle: "solid",
    backgroundColor: "#FFFFFF",
  },


  // ===================================================
  // IMAGE
  // ===================================================

  image: {
    width: "100%",
    height: "100%",

    // IMPORTANT
    // Keeps logo/signature/stamp aspect ratio
    resizeMode: "contain",
  },


  // ===================================================
  // EMPTY STATE
  // ===================================================

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
  },


  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 17,

    backgroundColor: "#EFF6FF",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 9,
  },


  placeholderTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textPrimary,
  },


  placeholderText: {
    marginTop: 4,
    fontSize: 10,
    color: Colors.textSecondary,
  },


  // ===================================================
  // EDIT
  // ===================================================

  editBadge: {
    position: "absolute",

    right: 10,
    bottom: 10,

    width: 38,
    height: 38,

    borderRadius: 12,

    backgroundColor: Colors.primary,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 2,
    borderColor: Colors.white,
  },


  // ===================================================
  // STATUS
  // ===================================================

  statusRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 8,

    paddingHorizontal: 2,
  },


  statusText: {
    marginLeft: 5,

    fontSize: 10,
    fontWeight: "600",

    color: Colors.success,
  },


  // ===================================================
  // REMOVE
  // ===================================================

  removeButton: {
    alignSelf: "flex-end",

    marginTop: 5,

    paddingHorizontal: 7,
    paddingVertical: 5,

    flexDirection: "row",
    alignItems: "center",
  },


  removeText: {
    marginLeft: 5,

    fontSize: 10,
    fontWeight: "700",

    color: Colors.danger,
  },

});