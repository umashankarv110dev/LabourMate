import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Animated,
  Text,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/src/constants/colors";

interface Props extends TextInputProps {
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  clearIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  onClearIconPress?: () => void;
}

export default function AppInput({
  leftIcon,
  rightIcon,
  clearIcon,
  onRightIconPress,
  onClearIconPress,
  style,
  value,
  placeholder,
  onFocus,
  onBlur,
  ...props
}: Props) {
  const [focused, setFocused] = useState(false);

  const animated = useRef(
    new Animated.Value(value ? 1 : 0)
  ).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue:
        focused || (value?.toString().length ?? 0) > 0
          ? 1
          : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

  const labelTop = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 6],
  });

  const labelFont = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });

  const labelColor = focused
    ? Colors.primary
    : "#888";

  return (
    <View
      style={[
        styles.container,
        focused && {
          borderColor: Colors.primary,
        },
      ]}
    >
      {leftIcon && (
        <Ionicons
          name={leftIcon}
          size={20}
          color="#666"
          style={styles.leftIcon}
        />
      )}

      <Animated.Text
        style={[
          styles.label,
          {
            top: labelTop,
            fontSize: labelFont,
            color: labelColor,
            left: leftIcon ? 42 : 15,
          },
        ]}
      >
        {placeholder}
      </Animated.Text>

      <TextInput
        {...props}
        value={value}
        placeholder=""
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        multiline={props.multiline}
        style={[
          styles.input,

          props.multiline && {
            height: 120,
            textAlignVertical: "top",
            paddingTop: 28,
            paddingBottom: 12,
          },

          leftIcon && { paddingLeft: 42 },

          rightIcon &&
            !clearIcon && {
              paddingRight: 45,
            },

          clearIcon &&
            !rightIcon && {
              paddingRight: 45,
            },

          rightIcon &&
            clearIcon &&
            value &&
            value.toString().length > 0 && {
              paddingRight: 90,
            },

          style,
        ]}
      />

      {clearIcon &&
        value &&
        value.toString().length > 0 && (
          <TouchableOpacity
            style={styles.clearIcon}
            onPress={onClearIconPress}
          >
            <Ionicons
              name={clearIcon}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        )}

      {rightIcon && (
        <TouchableOpacity
          style={styles.rightIcon}
          onPress={onRightIconPress}
        >
          <Ionicons
            name={rightIcon}
            size={22}
            color={Colors.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    backgroundColor: "#fff",
    justifyContent: "center",
    marginVertical: 8,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    paddingHorizontal: 15,
    paddingTop: 22,
    paddingBottom: 6,
  },

  label: {
    position: "absolute",
    backgroundColor: "#fff",
    paddingHorizontal: 2,
  },

  leftIcon: {
    position: "absolute",
    left: 12,
    top: 19,
  },

  rightIcon: {
    position: "absolute",
    right: 12,
    top: 17,
    width: 26,
    alignItems: "center",
    justifyContent: "center",
  },

  clearIcon: {
    position: "absolute",
    right: 48,
    top: 18,
    width: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});