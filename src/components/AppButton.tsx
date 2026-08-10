import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

import { Colors } from "@/src/constants/colors";

type Props = {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export default function AppButton({
  title,
  onPress,
  icon,
  loading = false,
  disabled = false,
  style,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={Colors.white}
            />
          )}

          <Text style={styles.title}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: Colors.primary,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

    paddingHorizontal: 20,
  },

  title: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  disabled: {
    opacity: 0.5,
  },
});