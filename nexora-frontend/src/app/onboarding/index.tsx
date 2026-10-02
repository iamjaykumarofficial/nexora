import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

export default function OnboardingScreen() {
  const handleContinue = () => {
    console.log("🔥 ONBOARDING → PREFERENCES");
    router.push("/onboarding/preferences");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>NEXORA</Text>

        <Text style={styles.title}>
          Meaningful{"\n"}
          <Text style={styles.titleAccent}>
            connections.
          </Text>
        </Text>

        <Text style={styles.subtitle}>
          Tell us a little about yourself and we'll
          help you find people who truly connect with you.
        </Text>

        <View style={styles.featureCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>♡</Text>
          </View>

          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>
              Be authentic
            </Text>

            <Text style={styles.featureText}>
              Your genuine self is what makes the
              right connections possible.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>✦</Text>
          </View>

          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>
              Find your people
            </Text>

            <Text style={styles.featureText}>
              Discover people who share your interests,
              values and goals.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleContinue}
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

        <Text style={styles.stepText}>
          1 of 3
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F3E9",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  content: {
    width: "100%",
    alignItems: "center",
  },

  logo: {
    color: "#244735",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 4,
    marginBottom: 38,
  },

  title: {
    color: "#20382B",
    fontFamily: "serif",
    fontSize: 42,
    lineHeight: 46,
    fontWeight: "600",
    textAlign: "center",
  },

  titleAccent: {
    color: "#244735",
    fontStyle: "italic",
  },

  subtitle: {
    color: "#6E786F",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 28,
    maxWidth: 350,
  },

  featureCard: {
    width: "100%",
    minHeight: 78,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.72)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 12,
  },

  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#DCE6D8",
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    color: "#244735",
    fontSize: 21,
  },

  featureContent: {
    flex: 1,
    marginLeft: 13,
  },

  featureTitle: {
    color: "#244735",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },

  featureText: {
    color: "#7A817B",
    fontSize: 10,
    lineHeight: 15,
  },

  continueButton: {
    width: "100%",
    height: 58,
    borderRadius: 29,
    backgroundColor: "#244735",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 18,
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
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
    color: "#9A9F9B",
    fontSize: 10,
    marginTop: 9,
  },

  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});