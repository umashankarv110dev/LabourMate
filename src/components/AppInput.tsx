import { Ionicons } from "@expo/vector-icons";
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { Colors } from "@/src/constants/colors";

type Props = TextInputProps & {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
};

export default function AppInput({
  label,
  icon,
  error,
  style,
  ...props
}: Props) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          error ? styles.errorBorder : null,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={Colors.textSecondary}
          />
        )}

        <TextInput
          placeholderTextColor={Colors.textLight}
          style={[styles.input, style]}
          {...props}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  inputContainer: {
    minHeight: 54,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 15,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  errorBorder: {
    borderColor: Colors.danger,
  },
  error: {
    marginTop: 5,
    fontSize: 12,
    color: Colors.danger,
  },
});