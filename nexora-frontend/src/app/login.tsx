import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");

  const handleContinue = () => {
    const cleanedPhone = phone.replace(/\D/g, "");

    if (cleanedPhone.length !== 10) {
      return;
    }

    console.log("📱 LOGIN PHONE:", cleanedPhone);

    router.push({
      pathname: "/otp" as any,
      params: {
        phone: cleanedPhone,
      },
    });
  };

  const isValidPhone =
    phone.replace(/\D/g, "").length === 10;

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "bottom"]}
    >
      <LinearGradient
        colors={["#F8F3E9", "#F5EEE3", "#E8EFE7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <View style={styles.topCircle} />
        <View style={styles.bottomCircle} />

        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
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

            <Text style={styles.logo}>NEXORA</Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.content}>
            <Text style={styles.eyebrow}>
              WELCOME BACK
            </Text>

            <Text style={styles.title}>
              Let's get you{"\n"}
              <Text style={styles.titleAccent}>
                connected.
              </Text>
            </Text>

            <Text style={styles.subtitle}>
              Enter your phone number and we'll send you
              {"\n"}
              a secure verification code.
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>
                PHONE NUMBER
              </Text>

              <View
                style={[
                  styles.phoneContainer,
                  isValidPhone &&
                    styles.phoneContainerValid,
                ]}
              >
                <View style={styles.countryCode}>
                  <Text style={styles.flag}>🇮🇳</Text>

                  <Text style={styles.code}>
                    +91
                  </Text>
                </View>

                <View style={styles.divider} />

                <TextInput
                  value={phone}
                  onChangeText={(value) => {
                    const numbers =
                      value.replace(/\D/g, "");

                    if (numbers.length <= 10) {
                      setPhone(numbers);
                    }
                  }}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#9A9F9B"
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.input}
                  returnKeyType="done"
                />
              </View>

              <Text style={styles.helper}>
                We'll never share your number with anyone.
              </Text>
            </View>

            <View style={styles.spacer} />

            <View style={styles.bottom}>
              <Pressable
                disabled={!isValidPhone}
                onPress={handleContinue}
                style={({ pressed }) => [
                  styles.continueButton,
                  !isValidPhone &&
                    styles.continueButtonDisabled,
                  pressed &&
                    isValidPhone &&
                    styles.buttonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.continueText,
                    !isValidPhone &&
                      styles.continueTextDisabled,
                  ]}
                >
                  Send OTP
                </Text>

                <View
                  style={[
                    styles.arrowCircle,
                    !isValidPhone &&
                      styles.arrowCircleDisabled,
                  ]}
                >
                  <Text style={styles.arrow}>
                    →
                  </Text>
                </View>
              </Pressable>

              <Text style={styles.terms}>
                By continuing, you agree to our{" "}
                <Text style={styles.termsAccent}>
                  Terms
                </Text>{" "}
                &{" "}
                <Text style={styles.termsAccent}>
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
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

  keyboard: {
    flex: 1,
  },

  topCircle: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(190, 211, 190, 0.22)",
    top: -135,
    right: -105,
  },

  bottomCircle: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(226, 177, 138, 0.13)",
    bottom: -100,
    left: -105,
  },

  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.62)",
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

  logo: {
    color: "#244735",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 3,
  },

  headerSpacer: {
    width: 42,
  },

  content: {
    flex: 1,
    paddingTop: 52,
  },

  eyebrow: {
    color: "#718172",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 11,
  },

  title: {
    color: "#20382B",
    fontFamily: "serif",
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "600",
  },

  titleAccent: {
    color: "#244735",
    fontStyle: "italic",
  },

  subtitle: {
    color: "#6E786F",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 15,
  },

  form: {
    marginTop: 42,
  },

  label: {
    color: "#718172",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginBottom: 10,
  },

  phoneContainer: {
    height: 58,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.76)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },

  phoneContainerValid: {
    borderColor: "rgba(36,71,53,0.22)",
  },

  countryCode: {
    flexDirection: "row",
    alignItems: "center",
  },

  flag: {
    fontSize: 19,
    marginRight: 7,
  },

  code: {
    color: "#244735",
    fontSize: 14,
    fontWeight: "700",
  },

  divider: {
    width: 1,
    height: 25,
    backgroundColor: "#D8DDD8",
    marginHorizontal: 13,
  },

  input: {
    flex: 1,
    color: "#244735",
    fontSize: 15,
    fontWeight: "600",
  },

  helper: {
    color: "#929A93",
    fontSize: 10,
    marginTop: 9,
    marginLeft: 3,
  },

  spacer: {
    flex: 1,
  },

  bottom: {
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

  continueButtonDisabled: {
    backgroundColor: "#C8D0C8",
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  continueTextDisabled: {
    color: "#7C857D",
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

  arrowCircleDisabled: {
    backgroundColor: "#DDE2DD",
  },

  arrow: {
    color: "#244735",
    fontSize: 23,
    fontWeight: "600",
  },

  terms: {
    textAlign: "center",
    color: "#969D97",
    fontSize: 9.5,
    lineHeight: 15,
    marginTop: 11,
  },

  termsAccent: {
    color: "#5E7062",
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.7,
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});