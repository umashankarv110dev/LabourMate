import {
  StyleSheet,
  View,
  ViewProps,
} from "react-native";

import { Colors } from "@/src/constants/colors";

type Props = ViewProps & {
  children: React.ReactNode;
};

export default function AppCard({
  children,
  style,
  ...props
}: Props) {
  return (
    <View
      style={[styles.card, style]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,

    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 2,
  },
});