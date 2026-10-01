import React from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <LinearGradient
        colors={["#F8F3E9", "#F4EBDD", "#E8EFE6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        {/* Decorative Background */}
        <View style={styles.topCircle} />
        <View style={styles.bottomCircle} />

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <View style={styles.progressContainer}>
            <View style={styles.progressActive} />
            <View style={styles.progressInactive} />
            <View style={styles.progressInactive} />
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* Illustration */}
        <View style={styles.illustrationSection}>
          <View style={styles.mainCircle}>
            <View style={styles.innerCircle} />

            {/* Decorative Hearts */}
            <View style={styles.heartOne}>
              <Text style={styles.heartText}>♥</Text>
            </View>

            <View style={styles.heartTwo}>
              <Text style={styles.heartTextSmall}>♥</Text>
            </View>

            {/* Left Person */}
            <View style={styles.personLeft}>
              <View style={styles.headLeft} />
              <View style={styles.bodyLeft} />
            </View>

            {/* Right Person */}
            <View style={styles.personRight}>
              <View style={styles.headRight} />
              <View style={styles.bodyRight} />
            </View>

            {/* Connection */}
            <View style={styles.connectionLine} />
          </View>

          <View style={styles.sparkleOne}>
            <Text style={styles.sparkle}>✦</Text>
          </View>

          <View style={styles.sparkleTwo}>
            <Text style={styles.sparkle}>✦</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.eyebrow}>
            A BETTER WAY TO CONNECT
          </Text>

          <Text style={styles.title}>
            Meaningful{"\n"}
            <Text style={styles.titleAccent}>connections.</Text>
          </Text>

          <Text style={styles.description}>
            Nexora is built for people who want more
            {"\n"}
            than just another swipe.
          </Text>

          {/* Feature Card */}
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>✦</Text>
            </View>

            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>
                Connect with intention
              </Text>

              <Text style={styles.featureDescription}>
                Discover people who share your interests,
                values and relationship goals.
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom */}
        <View style={styles.bottomSection}>
          <Pressable
            onPress={() => router.push("/onboarding/preferences")}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.continueText}>
              Continue
            </Text>

            <View style={styles.arrowCircle}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </Pressable>

          <Text style={styles.stepText}>1 of 3</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F3E9",
  },

  background: {
    flex: 1,
    paddingHorizontal: 24,
    overflow: "hidden",
  },

  topCircle: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(190, 211, 190, 0.22)",
    top: -120,
    right: -90,
  },

  bottomCircle: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(226, 177, 138, 0.12)",
    bottom: -100,
    left: -100,
  },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.58)",
    alignItems: "center",
    justifyContent: "center",
  },

  backArrow: {
    color: "#244735",
    fontSize: 34,
    lineHeight: 36,
    fontWeight: "300",
    marginTop: -4,
  },

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  progressActive: {
    width: 28,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#244735",
  },

  progressInactive: {
    width: 7,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#CBD5CB",
  },

  headerSpacer: {
    width: 42,
  },

  illustrationSection: {
    flex: 0.92,
    alignItems: "center",
    justifyContent: "center",
  },

  mainCircle: {
    width: width * 0.62,
    height: width * 0.62,
    maxWidth: 270,
    maxHeight: 270,
    borderRadius: 200,
    backgroundColor: "#DCE6D8",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  innerCircle: {
    position: "absolute",
    width: "78%",
    height: "78%",
    borderRadius: 200,
    backgroundColor: "rgba(248,243,233,0.38)",
  },

  personLeft: {
    position: "absolute",
    left: "23%",
    bottom: "21%",
    alignItems: "center",
  },

  headLeft: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D59B7D",
  },

  bodyLeft: {
    width: 72,
    height: 78,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    backgroundColor: "#244735",
    marginTop: -3,
  },

  personRight: {
    position: "absolute",
    right: "20%",
    bottom: "21%",
    alignItems: "center",
  },

  headRight: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#E2B18A",
  },

  bodyRight: {
    width: 68,
    height: 75,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    backgroundColor: "#A9BCA8",
    marginTop: -2,
  },

  connectionLine: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F8F3E9",
    borderWidth: 5,
    borderColor: "#D59B7D",
    top: "38%",
    left: "43%",
  },

  heartOne: {
    position: "absolute",
    top: "13%",
    right: "17%",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8F3E9",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "10deg" }],
  },

  heartText: {
    color: "#D98268",
    fontSize: 20,
  },

  heartTwo: {
    position: "absolute",
    bottom: "14%",
    left: "14%",
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#F8F3E9",
    alignItems: "center",
    justifyContent: "center",
  },

  heartTextSmall: {
    color: "#244735",
    fontSize: 14,
  },

  sparkleOne: {
    position: "absolute",
    top: "15%",
    left: "18%",
  },

  sparkleTwo: {
    position: "absolute",
    bottom: "15%",
    right: "16%",
  },

  sparkle: {
    color: "#C79862",
    fontSize: 20,
  },

  content: {
    alignItems: "center",
    paddingHorizontal: 4,
  },

  eyebrow: {
    color: "#718172",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 10,
  },

  title: {
    color: "#20382B",
    fontFamily: "serif",
    fontSize: 42,
    lineHeight: 45,
    fontWeight: "600",
    textAlign: "center",
  },

  titleAccent: {
    color: "#244735",
    fontStyle: "italic",
  },

  description: {
    marginTop: 12,
    color: "#6E786F",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },

  featureCard: {
    width: "100%",
    marginTop: 18,
    padding: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.62)",
    flexDirection: "row",
    alignItems: "center",
  },

  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#DCE6D8",
    alignItems: "center",
    justifyContent: "center",
  },

  featureIconText: {
    color: "#244735",
    fontSize: 18,
  },

  featureContent: {
    flex: 1,
    marginLeft: 12,
  },

  featureTitle: {
    color: "#244735",
    fontSize: 14,
    fontWeight: "700",
  },

  featureDescription: {
    marginTop: 3,
    color: "#788078",
    fontSize: 11,
    lineHeight: 16,
  },

  bottomSection: {
    paddingTop: 18,
    paddingBottom: 10,
  },

  continueButton: {
    height: 58,
    borderRadius: 29,
    backgroundColor: "#244735",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  arrowCircle: {
    position: "absolute",
    right: 7,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#D7E2D3",
    alignItems: "center",
    justifyContent: "center",
  },

  arrow: {
    color: "#244735",
    fontSize: 23,
    fontWeight: "600",
  },

  stepText: {
    textAlign: "center",
    marginTop: 9,
    color: "#9A9F9B",
    fontSize: 10,
  },

  pressed: {
    opacity: 0.7,
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});