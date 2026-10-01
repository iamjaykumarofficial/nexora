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

const { width, height } = Dimensions.get("window");

export default function Index() {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <LinearGradient
        colors={["#F8F3E9", "#F4EBDD", "#E8EFE6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        {/* Decorative Background */}
        <View style={styles.circleOne} />
        <View style={styles.circleTwo} />
        <View style={styles.circleThree} />

        {/* Branding */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>N</Text>
          </View>

          <Text style={styles.brandName}>NEXORA</Text>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.imagePlaceholder}>
            <View style={styles.imageGlow} />

            <View style={styles.personCard}>
              <Text style={styles.personEmoji}>♡</Text>
            </View>

            <View style={styles.smallHeart}>
              <Text style={styles.smallHeartText}>♥</Text>
            </View>

            <View style={styles.leafOne}>
              <Text style={styles.leafText}>⌁</Text>
            </View>

            <View style={styles.leafTwo}>
              <Text style={styles.leafText}>⌁</Text>
            </View>
          </View>

          <View style={styles.heroTextContainer}>
            <Text style={styles.eyebrow}>MEET • CONNECT • BELONG</Text>

            <Text style={styles.title}>
              Find Your{"\n"}
              <Text style={styles.titleAccent}>People.</Text>
            </Text>

            <Text style={styles.description}>
              Real people. Meaningful connections.
              {"\n"}
              Something genuine starts here.
            </Text>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomSection}>
          <Pressable
            onPress={() => router.push("/onboarding")}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>

            <View style={styles.arrowCircle}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push("/onboarding")}
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={styles.loginAccent}>Log in</Text>
            </Text>
          </Pressable>

          <Text style={styles.footerText}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
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

  circleOne: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(190, 211, 190, 0.25)",
    top: -100,
    right: -90,
  },

  circleTwo: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(226, 177, 138, 0.16)",
    bottom: 170,
    left: -100,
  },

  circleThree: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(38, 70, 53, 0.05)",
    top: height * 0.34,
    right: -55,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 14,
  },

  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#244735",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    color: "#F8F3E9",
    fontSize: 21,
    fontWeight: "700",
    fontFamily: "serif",
  },

  brandName: {
    marginLeft: 10,
    fontSize: 16,
    letterSpacing: 4,
    fontWeight: "700",
    color: "#244735",
  },

  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  imagePlaceholder: {
    width: width * 0.68,
    height: width * 0.72,
    maxWidth: 290,
    maxHeight: 310,
    borderRadius: 145,
    backgroundColor: "#D8E1D5",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-3deg" }],
    marginBottom: 34,
    overflow: "hidden",
  },

  imageGlow: {
    position: "absolute",
    width: "80%",
    height: "80%",
    borderRadius: 200,
    backgroundColor: "rgba(255,255,255,0.28)",
  },

  personCard: {
    width: 125,
    height: 155,
    borderRadius: 70,
    backgroundColor: "#E7B99B",
    alignItems: "center",
    justifyContent: "center",
  },

  personEmoji: {
    fontSize: 70,
    color: "#F8F3E9",
    fontFamily: "serif",
  },

  smallHeart: {
    position: "absolute",
    right: 25,
    top: 40,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8F3E9",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "8deg" }],
  },

  smallHeartText: {
    fontSize: 20,
    color: "#D98268",
  },

  leafOne: {
    position: "absolute",
    left: 30,
    bottom: 38,
    transform: [{ rotate: "-25deg" }],
  },

  leafTwo: {
    position: "absolute",
    right: 48,
    bottom: 24,
    transform: [{ rotate: "35deg" }],
  },

  leafText: {
    color: "#244735",
    fontSize: 42,
    opacity: 0.65,
  },

  heroTextContainer: {
    alignItems: "center",
  },

  eyebrow: {
    color: "#718172",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2.2,
    marginBottom: 12,
  },

  title: {
    color: "#20382B",
    fontSize: 48,
    lineHeight: 51,
    textAlign: "center",
    fontFamily: "serif",
    fontWeight: "600",
  },

  titleAccent: {
    color: "#244735",
    fontStyle: "italic",
  },

  description: {
    marginTop: 14,
    textAlign: "center",
    color: "#69736B",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "400",
  },

  bottomSection: {
    paddingBottom: 12,
    paddingTop: 18,
  },

  primaryButton: {
    height: 58,
    borderRadius: 29,
    backgroundColor: "#244735",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
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

  loginButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },

  loginText: {
    color: "#777F79",
    fontSize: 13,
  },

  loginAccent: {
    color: "#244735",
    fontWeight: "700",
  },

  footerText: {
    textAlign: "center",
    color: "#9A9F9B",
    fontSize: 9,
    lineHeight: 14,
    paddingHorizontal: 20,
  },

  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});