import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";

import {
  useRef,
  useState,
} from "react";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/contexts/AuthContext";

const { width } = Dimensions.get("window");

type OnboardingItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  accent: string;
  background: string;
};

const onboardingData: OnboardingItem[] = [
  {
    id: "1",
    icon: "people-outline",
    title: "Manage Your\nWorkforce",
    description:
      "Keep every worker organised. Manage worker profiles, wages and site assignments from one place.",
    accent: "#2563EB",
    background: "#EFF6FF",
  },
  {
    id: "2",
    icon: "calendar-outline",
    title: "Attendance Made\nSimple",
    description:
      "Mark daily attendance, track working days and calculate labour wages with less effort.",
    accent: "#16A34A",
    background: "#F0FDF4",
  },
  {
    id: "3",
    icon: "wallet-outline",
    title: "Track Every\nPayment",
    description:
      "Manage advances, worker payments and detailed labour cost reports with complete clarity.",
    accent: "#7C3AED",
    background: "#FAF5FF",
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();

  const flatListRef =
    useRef<FlatList<OnboardingItem>>(null);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const isLast =
    currentIndex === onboardingData.length - 1;

  const handleComplete = async () => {
    try {
      await completeOnboarding();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error(
        "ONBOARDING COMPLETE ERROR:",
        error
      );
    }
  };

  const handleNext = () => {
    if (isLast) {
      handleComplete();
      return;
    }

    flatListRef.current?.scrollToIndex({
      index: currentIndex + 1,
      animated: true,
    });
  };

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetX =
      event.nativeEvent.contentOffset.x;

    const index = Math.round(offsetX / width);

    setCurrentIndex(index);
  };

  const onViewableItemsChanged = useRef(
    ({
      viewableItems,
    }: {
      viewableItems: ViewToken[];
    }) => {
      if (
        viewableItems.length > 0 &&
        viewableItems[0].index !== null
      ) {
        setCurrentIndex(
          viewableItems[0].index ?? 0
        );
      }
    }
  ).current;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8FAFC"
      />

      <View style={styles.topBar}>
        <View style={styles.brandContainer}>
          <View style={styles.brandIcon}>
            <Ionicons
              name="people"
              size={19}
              color={Colors.white}
            />
          </View>

          <Text style={styles.brandName}>
            LabourMate
          </Text>
        </View>

        {!isLast && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleComplete}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>
              Skip
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        onViewableItemsChanged={
          onViewableItemsChanged
        }
        viewabilityConfig={{
          viewAreaCoveragePercentThreshold: 50,
        }}
        renderItem={({ item }) => (
          <OnboardingSlide item={item} />
        )}
      />

      <View style={styles.bottomContainer}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                currentIndex === index &&
                  styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          activeOpacity={0.85}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {isLast ? "Get Started" : "Continue"}
          </Text>

          <View style={styles.nextIcon}>
            <Ionicons
              name={
                isLast
                  ? "checkmark"
                  : "arrow-forward"
              }
              size={19}
              color={Colors.primary}
            />
          </View>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Built for contractors & labour managers
        </Text>
      </View>
    </SafeAreaView>
  );
}

function OnboardingSlide({
  item,
}: {
  item: OnboardingItem;
}) {
  return (
    <View
      style={[
        styles.slide,
        {
          width,
        },
      ]}
    >
      <View style={styles.illustrationContainer}>
        <View
          style={[
            styles.largeCircle,
            {
              backgroundColor: item.background,
            },
          ]}
        >
          <View
            style={[
              styles.mediumCircle,
              {
                borderColor: `${item.accent}20`,
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: item.accent,
                },
              ]}
            >
              <Ionicons
                name={item.icon}
                size={54}
                color={Colors.white}
              />
            </View>
          </View>
        </View>

        <View
          style={[
            styles.floatingCardOne,
            {
              backgroundColor: item.background,
            },
          ]}
        >
          <Ionicons
            name="checkmark-circle"
            size={23}
            color={item.accent}
          />
        </View>

        <View
          style={[
            styles.floatingCardTwo,
            {
              backgroundColor: item.background,
            },
          ]}
        >
          <Ionicons
            name="analytics"
            size={21}
            color={item.accent}
          />
        </View>
      </View>

      <View style={styles.textContent}>
        <Text style={styles.slideTitle}>
          {item.title}
        </Text>

        <Text style={styles.slideDescription}>
          {item.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  topBar: {
    height: 70,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  brandName: {
    marginLeft: 10,
    fontSize: 17,
    fontWeight: "900",
    color: Colors.textPrimary,
  },

  skipButton: {
    paddingHorizontal: 15,
    paddingVertical: 9,
  },

  skipText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
  },

  slide: {
    flex: 1,
    paddingHorizontal: 25,
  },

  illustrationContainer: {
    flex: 1.15,
    alignItems: "center",
    justifyContent: "center",
  },

  largeCircle: {
    width: 270,
    height: 270,
    borderRadius: 135,
    alignItems: "center",
    justifyContent: "center",
  },

  mediumCircle: {
    width: 205,
    height: 205,
    borderRadius: 103,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  iconContainer: {
    width: 130,
    height: 130,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",

    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 9,
  },

  floatingCardOne: {
    position: "absolute",
    top: "25%",
    right: 45,
    width: 53,
    height: 53,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  floatingCardTwo: {
    position: "absolute",
    bottom: "20%",
    left: 48,
    width: 49,
    height: 49,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  textContent: {
    flex: 0.85,
    paddingTop: 10,
    alignItems: "center",
  },

  slideTitle: {
    fontSize: 31,
    lineHeight: 39,
    fontWeight: "900",
    textAlign: "center",
    color: Colors.textPrimary,
    letterSpacing: -0.8,
  },

  slideDescription: {
    marginTop: 17,
    maxWidth: 330,
    fontSize: 13,
    lineHeight: 22,
    textAlign: "center",
    color: Colors.textSecondary,
  },

  bottomContainer: {
    paddingHorizontal: 22,
    paddingBottom: 18,
  },

  pagination: {
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  paginationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#CBD5E1",
  },

  paginationDotActive: {
    width: 25,
    backgroundColor: Colors.primary,
  },

  nextButton: {
    marginTop: 8,
    height: 59,
    borderRadius: 18,
    paddingLeft: 22,
    paddingRight: 8,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 7,
  },

  nextButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.white,
  },

  nextIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  footerText: {
    marginTop: 17,
    fontSize: 9,
    textAlign: "center",
    color: Colors.textLight,
  },
});