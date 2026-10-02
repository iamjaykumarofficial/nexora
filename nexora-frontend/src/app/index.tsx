import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const openOnboarding = () => {
    console.log("🔥 OPEN ONBOARDING");
    router.push("/onboarding");
  };

  const openLogin = () => {
    console.log("🔥 OPEN LOGIN");
    router.push("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[
          "#F8F3E9",
          "#F5EEE2",
          "#E8EFE6",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Decorative background */}
        <View style={styles.topCircle} />
        <View style={styles.bottomCircle} />

        <View style={styles.content}>
          {/* Brand */}
          <View style={styles.brandContainer}>
            <View style={styles.brandMark}>
              <View style={styles.brandLeafLeft} />
              <View style={styles.brandLeafRight} />
              <View style={styles.brandDot} />
            </View>

            <Text style={styles.logo}>
              NEXORA
            </Text>

            <Text style={styles.brandTagline}>
              MEANINGFUL CONNECTIONS
            </Text>
          </View>

          {/* Hero Visual */}
          <View style={styles.visualArea}>
            <View style={styles.glow} />

            <View
              style={[
                styles.profileCard,
                styles.cardBack,
              ]}
            >
              <View style={styles.fakePhoto}>
                <View style={styles.fakeHead} />
                <View style={styles.fakeBody} />
              </View>
            </View>

            <View
              style={[
                styles.profileCard,
                styles.cardMiddle,
              ]}
            >
              <View style={styles.fakePhoto}>
                <View style={styles.fakeHeadTwo} />
                <View style={styles.fakeBodyTwo} />
              </View>
            </View>

            <View
              style={[
                styles.profileCard,
                styles.cardFront,
              ]}
            >
              <LinearGradient
                colors={[
                  "#DDE9D9",
                  "#C7D9C5",
                  "#B5CCB7",
                ]}
                style={styles.mainVisual}
              >
                <View style={styles.sun} />

                <View style={styles.personHead} />

                <View style={styles.personBody} />

                <View style={styles.leafOne}>
                  <View style={styles.leafStem} />
                </View>

                <View style={styles.leafTwo}>
                  <View style={styles.leafStem} />
                </View>

                <View style={styles.heartBubble}>
                  <Text style={styles.heart}>
                    ♥
                  </Text>
                </View>

                <Text style={styles.visualText}>
                  YOUR PEOPLE
                </Text>
              </LinearGradient>
            </View>

            {/* Floating badges */}
            <View style={styles.badgeTop}>
              <Text style={styles.badgeEmoji}>
                ✦
              </Text>
              <Text style={styles.badgeText}>
                AUTHENTIC
              </Text>
            </View>

            <View style={styles.badgeBottom}>
              <Text style={styles.badgeEmoji}>
                ♡
              </Text>
              <Text style={styles.badgeText}>
                CONNECT
              </Text>
            </View>
          </View>

          {/* Heading */}
          <View style={styles.heading}>
            <Text style={styles.title}>
              Find Your{"\n"}
              <Text style={styles.titleAccent}>
                People.
              </Text>
            </Text>

            <Text style={styles.subtitle}>
              Real people. Meaningful
              connections. A space where
              you can simply be yourself.
            </Text>
          </View>

          {/* CTA */}
          <View style={styles.actions}>
            <Pressable
              onPress={openOnboarding}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <LinearGradient
                colors={[
                  "#244735",
                  "#315C43",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryGradient}
              >
                <Text
                  style={styles.primaryText}
                >
                  Get Started
                </Text>

                <View
                  style={styles.arrowCircle}
                >
                  <Text style={styles.arrow}>
                    →
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={openLogin}
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.loginText}>
                Already have an account?{" "}
                <Text style={styles.loginAccent}>
                  Log in
                </Text>
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Bottom branding */}
        <Text style={styles.bottomBrand}>
          NEXORA • BE YOURSELF
        </Text>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F3E9",
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    overflow: "hidden",
  },

  topCircle: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor:
      "rgba(190,211,190,0.22)",
    top: -150,
    right: -100,
  },

  bottomCircle: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor:
      "rgba(226,177,138,0.13)",
    bottom: -120,
    left: -120,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 4,
  },

  brandContainer: {
    alignItems: "center",
  },

  brandMark: {
    width: 38,
    height: 30,
    position: "relative",
    marginBottom: 7,
  },

  brandLeafLeft: {
    position: "absolute",
    width: 15,
    height: 23,
    borderRadius: 15,
    backgroundColor: "#244735",
    transform: [
      {
        rotate: "-32deg",
      },
    ],
    left: 5,
    top: 1,
  },

  brandLeafRight: {
    position: "absolute",
    width: 15,
    height: 23,
    borderRadius: 15,
    backgroundColor: "#315C43",
    transform: [
      {
        rotate: "32deg",
      },
    ],
    right: 5,
    top: 1,
  },

  brandDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D49B70",
    alignSelf: "center",
    bottom: 0,
  },

  logo: {
    color: "#244735",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 5,
  },

  brandTagline: {
    color: "#8A948B",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 2.3,
    marginTop: 4,
  },

  visualArea: {
    width: "100%",
    height: 285,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: 5,
  },

  glow: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor:
      "rgba(196,216,194,0.28)",
  },

  profileCard: {
    width: 170,
    height: 220,
    borderRadius: 28,
    position: "absolute",
    overflow: "hidden",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.8)",
  },

  cardBack: {
    transform: [
      {
        rotate: "-12deg",
      },
    ],
    marginLeft: -105,
    marginTop: 12,
    opacity: 0.62,
  },

  cardMiddle: {
    transform: [
      {
        rotate: "11deg",
      },
    ],
    marginLeft: 105,
    marginTop: 12,
    opacity: 0.72,
  },

  cardFront: {
    elevation: 10,
    shadowColor: "#244735",
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 12,
    },
  },

  fakePhoto: {
    flex: 1,
    backgroundColor: "#D6E0D2",
    alignItems: "center",
    justifyContent: "center",
  },

  fakeHead: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#B7C8B4",
    marginTop: -20,
  },

  fakeBody: {
    width: 90,
    height: 100,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    backgroundColor: "#A7BCA9",
    marginTop: 10,
  },

  fakeHeadTwo: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#D7B99F",
    marginTop: -20,
  },

  fakeBodyTwo: {
    width: 90,
    height: 100,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    backgroundColor: "#BCA28C",
    marginTop: 10,
  },

  mainVisual: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
    paddingBottom: 22,
  },

  sun: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor:
      "rgba(239,194,147,0.65)",
    top: 22,
    right: 18,
  },

  personHead: {
    position: "absolute",
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: "#D8B296",
    top: 64,
  },

  personBody: {
    position: "absolute",
    width: 125,
    height: 130,
    borderTopLeftRadius: 62,
    borderTopRightRadius: 62,
    backgroundColor: "#55755D",
    bottom: 32,
  },

  leafOne: {
    position: "absolute",
    width: 48,
    height: 70,
    borderRadius: 40,
    backgroundColor: "#78947B",
    left: -3,
    bottom: 55,
    transform: [
      {
        rotate: "-30deg",
      },
    ],
  },

  leafTwo: {
    position: "absolute",
    width: 45,
    height: 68,
    borderRadius: 40,
    backgroundColor: "#6B886F",
    right: -4,
    bottom: 70,
    transform: [
      {
        rotate: "32deg",
      },
    ],
  },

  leafStem: {
    width: 2,
    height: 45,
    backgroundColor: "#4E6D55",
    alignSelf: "center",
    marginTop: 20,
  },

  heartBubble: {
    position: "absolute",
    top: 28,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      "rgba(255,255,255,0.86)",
    alignItems: "center",
    justifyContent: "center",
  },

  heart: {
    color: "#C77D6B",
    fontSize: 18,
  },

  visualText: {
    color: "#F7F4EA",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 2,
  },

  badgeTop: {
    position: "absolute",
    top: 17,
    right: 7,
    height: 38,
    paddingHorizontal: 11,
    borderRadius: 19,
    backgroundColor:
      "rgba(255,255,255,0.88)",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    elevation: 3,
  },

  badgeBottom: {
    position: "absolute",
    bottom: 14,
    left: 7,
    height: 38,
    paddingHorizontal: 11,
    borderRadius: 19,
    backgroundColor:
      "rgba(255,255,255,0.88)",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    elevation: 3,
  },

  badgeEmoji: {
    color: "#315C43",
    fontSize: 14,
  },

  badgeText: {
    color: "#536257",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
  },

  heading: {
    width: "100%",
    alignItems: "center",
    marginTop: -2,
  },

  title: {
    color: "#20382B",
    fontFamily: "serif",
    fontSize: 40,
    lineHeight: 43,
    fontWeight: "600",
    textAlign: "center",
  },

  titleAccent: {
    color: "#244735",
    fontStyle: "italic",
  },

  subtitle: {
    color: "#737C75",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 315,
    marginTop: 9,
  },

  actions: {
    width: "100%",
    marginTop: 8,
  },

  primaryButton: {
    width: "100%",
    height: 58,
    borderRadius: 29,
    overflow: "hidden",
  },

  primaryGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
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
    fontSize: 22,
    fontWeight: "700",
  },

  loginButton: {
    alignItems: "center",
    paddingVertical: 11,
  },

  loginText: {
    color: "#818A82",
    fontSize: 11,
  },

  loginAccent: {
    color: "#244735",
    fontWeight: "800",
  },

  bottomBrand: {
    color: "#A0A79F",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 2,
    textAlign: "center",
    paddingBottom: 5,
  },

  buttonPressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },
});