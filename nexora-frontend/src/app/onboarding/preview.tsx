import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const PREVIEW_PHOTO =
  "file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540anonymous%252Fnexora-frontend-a6c597ff-460f-4c5b-8716-739dce836e98/ImagePicker/d04cb6a9-e313-49c6-a3cc-ec36b158f10f.png";

export default function PreviewScreen() {
  const handleContinue = () => {
    console.log("🔥 PREVIEW → COMPLETE");
    router.push("/onboarding");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>NEXORA</Text>
            <Text style={styles.title}>Your profile is ready.</Text>
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>05</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Take a quick look before we introduce you to your people.
        </Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.photoWrapper}>
            <Image
              source={{ uri: PREVIEW_PHOTO }}
              style={styles.profileImage}
              resizeMode="cover"
            />

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.78)"]}
              style={styles.imageGradient}
            />

            <View style={styles.profileInfo}>
              <Text style={styles.name}>Jay, 24</Text>

              <Text style={styles.location}>📍 Jabalpur</Text>
            </View>
          </View>

          {/* About */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionLabel}>ABOUT</Text>

            <Text style={styles.bio}>
              Hey my name is jay kumar choudhary
            </Text>
          </View>

          {/* Tags */}
          <View style={styles.tagsSection}>
            <Text style={styles.sectionLabel}>YOUR VIBE</Text>

            <View style={styles.tags}>
              {[
                "Art",
                "Books",
                "Cooking",
                "Dancing",
                "Fitness",
                "Food",
                "Gaming",
                "Music",
              ].map((item) => (
                <View key={item} style={styles.tag}>
                  <Text style={styles.tagText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Privacy */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyIcon}>
            <Text style={styles.lock}>✓</Text>
          </View>

          <View style={styles.privacyContent}>
            <Text style={styles.privacyTitle}>You're in control</Text>

            <Text style={styles.privacyText}>
              You can edit your profile, photos and preferences anytime.
            </Text>
          </View>
        </View>

        {/* Continue */}
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.continueButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <LinearGradient
            colors={["#174D3A", "#0F382A"]}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>Enter Nexora</Text>
            <Text style={styles.arrow}>→</Text>
          </LinearGradient>
        </Pressable>

        <Text style={styles.footer}>
          Your journey to meaningful connections starts here.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F5EE",
  },

  container: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  eyebrow: {
    fontSize: 12,
    letterSpacing: 3,
    color: "#B88955",
    fontWeight: "800",
    marginBottom: 8,
  },

  title: {
    fontSize: 30,
    lineHeight: 36,
    color: "#173C2E",
    fontWeight: "800",
  },

  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: "#77736B",
    maxWidth: 330,
  },

  stepBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8E0D0",
    alignItems: "center",
    justifyContent: "center",
  },

  stepText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#174D3A",
  },

  profileCard: {
    marginTop: 26,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#173C2E",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 5,
  },

  photoWrapper: {
    height: 410,
    position: "relative",
    backgroundColor: "#E8E3D8",
  },

  profileImage: {
    width: "100%",
    height: "100%",
  },

  imageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
  },

  profileInfo: {
    position: "absolute",
    left: 22,
    right: 22,
    bottom: 20,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },

  location: {
    color: "#F4EFE6",
    fontSize: 14,
    marginTop: 5,
  },

  aboutSection: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  sectionLabel: {
    fontSize: 11,
    letterSpacing: 2,
    color: "#B88955",
    fontWeight: "800",
    marginBottom: 8,
  },

  bio: {
    fontSize: 16,
    lineHeight: 23,
    color: "#333A35",
  },

  tagsSection: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
  },

  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  tag: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#EDF3ED",
  },

  tagText: {
    fontSize: 13,
    color: "#28533F",
    fontWeight: "600",
  },

  privacyCard: {
    marginTop: 18,
    padding: 17,
    borderRadius: 20,
    backgroundColor: "#EEF3ED",
    flexDirection: "row",
    alignItems: "center",
  },

  privacyIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#D5E4D7",
    alignItems: "center",
    justifyContent: "center",
  },

  lock: {
    fontSize: 18,
    fontWeight: "900",
    color: "#174D3A",
  },

  privacyContent: {
    flex: 1,
    marginLeft: 12,
  },

  privacyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#173C2E",
  },

  privacyText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    color: "#687269",
  },

  continueButton: {
    marginTop: 22,
    borderRadius: 18,
    overflow: "hidden",
  },

  continueGradient: {
    height: 58,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  arrow: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "400",
  },

  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },

  footer: {
    textAlign: "center",
    marginTop: 15,
    fontSize: 11,
    color: "#9A968D",
  },
});